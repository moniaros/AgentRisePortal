import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'agent';
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'agent';
  phone?: string;
  avatarUrl?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    const user = response.data.data;

    // Update cached user
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<void> {
    await apiClient.put('/auth/profile', data);

    // Refresh user data
    await this.getCurrentUser();
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.put('/auth/change-password', data);

    // Password change invalidates all sessions, so logout
    await this.logout();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get cached user from localStorage
   */
  getCachedUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
