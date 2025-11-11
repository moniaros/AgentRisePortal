import apiClient from './apiClient';
import { Campaign } from '../types';

export interface CreateCampaignData {
  name: string;
  objective?: string;
  platforms?: string[];
  targetAudience?: Record<string, any>;
  budget?: number;
  budgetType?: 'daily' | 'total';
  startDate?: string;
  endDate?: string;
  creativeData?: Record<string, any>;
  leadFormData?: Record<string, any>;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  status?: 'draft' | 'active' | 'paused' | 'completed';
}

class CampaignService {
  /**
   * Get all campaigns
   */
  async getCampaigns(): Promise<Campaign[]> {
    const response = await apiClient.get('/campaigns');
    return response.data.data;
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: number): Promise<Campaign> {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data.data;
  }

  /**
   * Create new campaign
   */
  async createCampaign(data: CreateCampaignData): Promise<{ id: number }> {
    const response = await apiClient.post('/campaigns', data);
    return response.data.data;
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: number, data: UpdateCampaignData): Promise<void> {
    await apiClient.put(`/campaigns/${id}`, data);
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: number): Promise<void> {
    await apiClient.delete(`/campaigns/${id}`);
  }
}

export const campaignService = new CampaignService();
