import { query } from '../config/database.js';
import crypto from 'crypto';

/**
 * Get all social network connections for current user
 */
export const getConnections = async (req, res, next) => {
  try {
    const connections = await query(
      `SELECT
        id,
        platform,
        platform_user_id,
        platform_username,
        is_active,
        token_expires_at,
        last_synced_at,
        profile_data,
        created_at
       FROM social_network_connections
       WHERE user_id = ?
       ORDER BY platform`,
      [req.user.id]
    );

    // Format response
    const formattedConnections = connections.map(conn => ({
      id: conn.id,
      platform: conn.platform,
      platformUserId: conn.platform_user_id,
      platformUsername: conn.platform_username,
      isActive: Boolean(conn.is_active),
      tokenExpiresAt: conn.token_expires_at,
      lastSyncedAt: conn.last_synced_at,
      profileData: conn.profile_data ? JSON.parse(conn.profile_data) : null,
      createdAt: conn.created_at
    }));

    res.status(200).json({
      success: true,
      data: formattedConnections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate OAuth connection for a platform
 */
export const initiateConnection = async (req, res, next) => {
  try {
    const { platform } = req.params;

    // Validate platform
    const validPlatforms = ['facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    // Generate state parameter for OAuth security
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session or database (temporary storage)
    // In production, you'd want to use Redis or similar

    // Get OAuth URLs and credentials
    const oauthConfig = getOAuthConfig(platform);

    if (!oauthConfig) {
      return res.status(500).json({
        success: false,
        message: `OAuth not configured for ${platform}`
      });
    }

    // Build authorization URL
    const authUrl = buildAuthorizationUrl(platform, oauthConfig, state);

    res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle OAuth callback
 */
export const handleCallback = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: `OAuth error: ${error}`
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Verify state parameter (in production, check against stored state)
    // const isValidState = await verifyState(state);
    // if (!isValidState) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid state parameter'
    //   });
    // }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(platform, code);

    // Get user profile from platform
    const profileData = await fetchPlatformProfile(platform, tokenData.access_token);

    // Save or update connection
    const existingConnection = await query(
      'SELECT id FROM social_network_connections WHERE user_id = ? AND platform = ?',
      [req.user.id, platform]
    );

    if (existingConnection.length > 0) {
      // Update existing connection
      await query(
        `UPDATE social_network_connections
         SET access_token = ?,
             refresh_token = ?,
             token_expires_at = ?,
             platform_user_id = ?,
             platform_username = ?,
             profile_data = ?,
             is_active = TRUE,
             last_synced_at = NOW()
         WHERE id = ?`,
        [
          tokenData.access_token,
          tokenData.refresh_token || null,
          tokenData.expires_at || null,
          profileData.id,
          profileData.username || profileData.name,
          JSON.stringify(profileData),
          existingConnection[0].id
        ]
      );
    } else {
      // Create new connection
      await query(
        `INSERT INTO social_network_connections (
          user_id, platform, access_token, refresh_token, token_expires_at,
          platform_user_id, platform_username, profile_data, last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          platform,
          tokenData.access_token,
          tokenData.refresh_token || null,
          tokenData.expires_at || null,
          profileData.id,
          profileData.username || profileData.name,
          JSON.stringify(profileData)
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: `Successfully connected to ${platform}`,
      data: {
        platform,
        username: profileData.username || profileData.name
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect a social network
 */
export const disconnect = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify connection belongs to user
    const connections = await query(
      'SELECT id FROM social_network_connections WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (connections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Soft delete - set inactive
    await query(
      'UPDATE social_network_connections SET is_active = FALSE WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Social network disconnected successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token for a connection
 */
export const refreshConnection = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get connection
    const connections = await query(
      'SELECT * FROM social_network_connections WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (connections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const connection = connections[0];

    // Refresh token
    const tokenData = await refreshAccessToken(connection.platform, connection.refresh_token);

    // Update connection
    await query(
      `UPDATE social_network_connections
       SET access_token = ?,
           token_expires_at = ?,
           last_synced_at = NOW()
       WHERE id = ?`,
      [tokenData.access_token, tokenData.expires_at, id]
    );

    res.status(200).json({
      success: true,
      message: 'Connection refreshed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// Helper Functions (OAuth Implementation)
// ========================================

function getOAuthConfig(platform) {
  const configs = {
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/facebook`,
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'ads_management']
    },
    instagram: {
      clientId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/instagram`,
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/linkedin`,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: ['w_member_social', 'r_liteprofile', 'r_emailaddress']
    },
    x: {
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/x`,
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      scopes: ['tweet.read', 'tweet.write', 'users.read']
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/tiktok`,
      authUrl: 'https://www.tiktok.com/auth/authorize/',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
      scopes: ['user.info.basic', 'video.publish']
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.API_BASE_URL}/api/v1/social/callback/youtube`,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube']
    }
  };

  return configs[platform];
}

function buildAuthorizationUrl(platform, config, state) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: state,
    response_type: 'code'
  });

  // Platform-specific parameters
  if (platform === 'facebook' || platform === 'instagram') {
    params.append('auth_type', 'rerequest');
  }

  if (platform === 'youtube') {
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}

async function exchangeCodeForToken(platform, code) {
  // This is a simplified version
  // In production, you'd make actual HTTP requests to each platform's token endpoint

  const config = getOAuthConfig(platform);

  // Mock implementation - replace with actual API calls
  console.log(`Exchanging code for token on ${platform}`);

  // Example for Facebook/Instagram:
  // const response = await fetch(config.tokenUrl, {
  //   method: 'POST',
  //   body: new URLSearchParams({
  //     client_id: config.clientId,
  //     client_secret: config.clientSecret,
  //     code: code,
  //     redirect_uri: config.redirectUri
  //   })
  // });
  // const data = await response.json();
  // return {
  //   access_token: data.access_token,
  //   refresh_token: data.refresh_token,
  //   expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
  // };

  // Mock response
  return {
    access_token: `mock_access_token_${platform}_${Date.now()}`,
    refresh_token: `mock_refresh_token_${platform}_${Date.now()}`,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
  };
}

async function fetchPlatformProfile(platform, accessToken) {
  // Mock implementation - replace with actual API calls
  console.log(`Fetching profile from ${platform}`);

  // Example for Facebook:
  // const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessToken}&fields=id,name`);
  // return await response.json();

  // Mock response
  return {
    id: `${platform}_user_${Math.random().toString(36).substr(2, 9)}`,
    name: `Mock ${platform} User`,
    username: `@mock_${platform}_user`
  };
}

async function refreshAccessToken(platform, refreshToken) {
  // Mock implementation - replace with actual API calls
  console.log(`Refreshing token for ${platform}`);

  return {
    access_token: `refreshed_token_${platform}_${Date.now()}`,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  };
}
