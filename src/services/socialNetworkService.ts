import apiClient from './apiClient';

export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube';

export interface SocialConnection {
  id: number;
  platform: SocialPlatform;
  platformUserId: string;
  platformUsername: string;
  isActive: boolean;
  tokenExpiresAt?: string;
  lastSyncedAt?: string;
  profileData?: {
    id: string;
    name: string;
    username?: string;
    picture?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface InitiateConnectionResponse {
  authUrl: string;
  state: string;
}

class SocialNetworkService {
  /**
   * Get all social network connections for current user
   */
  async getConnections(): Promise<SocialConnection[]> {
    const response = await apiClient.get('/social/connections');
    return response.data.data;
  }

  /**
   * Initiate OAuth connection for a platform
   */
  async initiateConnection(platform: SocialPlatform): Promise<InitiateConnectionResponse> {
    const response = await apiClient.post(`/social/connect/${platform}`);
    return response.data.data;
  }

  /**
   * Open OAuth popup window for connection
   */
  async connectPlatform(platform: SocialPlatform): Promise<boolean> {
    try {
      // Get authorization URL
      const { authUrl, state } = await this.initiateConnection(platform);

      // Open popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        `${platform}-oauth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Wait for OAuth callback
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkInterval);
              // Check if connection was successful
              this.getConnections()
                .then(connections => {
                  const connected = connections.some(
                    c => c.platform === platform && c.isActive
                  );
                  resolve(connected);
                })
                .catch(() => resolve(false));
            }
          } catch (error) {
            // Ignore cross-origin errors
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth timeout'));
        }, 5 * 60 * 1000);
      });
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect a social network
   */
  async disconnect(connectionId: number): Promise<void> {
    await apiClient.delete(`/social/connections/${connectionId}`);
  }

  /**
   * Refresh access token for a connection
   */
  async refreshConnection(connectionId: number): Promise<void> {
    await apiClient.post(`/social/connections/${connectionId}/refresh`);
  }

  /**
   * Check if a platform is connected
   */
  async isConnected(platform: SocialPlatform): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      return connections.some(c => c.platform === platform && c.isActive);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get connection status for all platforms
   */
  async getConnectionStatus(): Promise<Record<SocialPlatform, boolean>> {
    try {
      const connections = await this.getConnections();
      const status: Record<string, boolean> = {};

      const platforms: SocialPlatform[] = [
        'facebook',
        'instagram',
        'linkedin',
        'x',
        'tiktok',
        'youtube'
      ];

      platforms.forEach(platform => {
        status[platform] = connections.some(
          c => c.platform === platform && c.isActive
        );
      });

      return status as Record<SocialPlatform, boolean>;
    } catch (error) {
      console.error('Failed to get connection status:', error);
      return {
        facebook: false,
        instagram: false,
        linkedin: false,
        x: false,
        tiktok: false,
        youtube: false
      };
    }
  }
}

export const socialNetworkService = new SocialNetworkService();
