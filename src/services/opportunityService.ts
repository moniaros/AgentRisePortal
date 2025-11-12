import apiClient from './apiClient';
import {
  Opportunity,
  OpportunityStage,
  KanbanBoard,
  MyDayOpportunities,
  Interaction
} from '../types';

export interface CreateOpportunityData {
  title: string;
  description?: string;
  prospectName: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectType?: 'customer' | 'inquiry';
  prospectId?: number;
  estimatedValue?: number;
  probability?: number;
  policyType?: string;
  nextFollowUpDate?: string;
  sourceInquiryId?: number;
  sourceCampaignId?: number;
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  // Additional update fields
}

export interface UpdateStageData {
  stage: OpportunityStage;
  lostReason?: string;
  actualPremium?: number;
  policyId?: number;
}

export interface OpportunityFilters {
  page?: number;
  limit?: number;
  stage?: OpportunityStage | 'all';
  agentId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateInteractionData {
  interactionType: 'email' | 'sms' | 'phone' | 'meeting' | 'viber' | 'whatsapp' | 'note';
  direction?: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  recipient?: string;
  sentVia?: string;
  deliveryStatus?: string;
  scheduledAt?: string;
  completedAt?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

class OpportunityService {
  /**
   * Get all opportunities with filters
   */
  async getOpportunities(filters?: OpportunityFilters): Promise<{
    opportunities: Opportunity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalRecords: number;
    };
  }> {
    const response = await apiClient.get('/opportunities', { params: filters });
    return response.data.data;
  }

  /**
   * Get opportunities grouped by stage (for Kanban board)
   */
  async getKanbanBoard(agentId?: number): Promise<KanbanBoard> {
    const response = await apiClient.get('/opportunities/kanban', {
      params: agentId ? { agentId } : {}
    });
    return response.data.data;
  }

  /**
   * Get "My Day" opportunities categorized by follow-up status
   */
  async getMyDayOpportunities(): Promise<MyDayOpportunities> {
    const response = await apiClient.get('/opportunities/my-day');
    return response.data.data;
  }

  /**
   * Get single opportunity by ID
   */
  async getOpportunityById(id: number): Promise<Opportunity> {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data.data;
  }

  /**
   * Create new opportunity
   */
  async createOpportunity(data: CreateOpportunityData): Promise<{ id: number }> {
    const response = await apiClient.post('/opportunities', data);
    return response.data.data;
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(id: number, data: UpdateOpportunityData): Promise<void> {
    await apiClient.put(`/opportunities/${id}`, data);
  }

  /**
   * Update opportunity stage (for Kanban drag-drop)
   */
  async updateStage(id: number, data: UpdateStageData): Promise<void> {
    await apiClient.put(`/opportunities/${id}/stage`, data);
  }

  /**
   * Delete opportunity
   */
  async deleteOpportunity(id: number): Promise<void> {
    await apiClient.delete(`/opportunities/${id}`);
  }

  /**
   * Get interactions for an opportunity
   */
  async getInteractions(opportunityId: number): Promise<Interaction[]> {
    const response = await apiClient.get(`/opportunities/${opportunityId}/interactions`);
    return response.data.data;
  }

  /**
   * Create interaction (log communication)
   */
  async createInteraction(opportunityId: number, data: CreateInteractionData): Promise<{ id: number }> {
    const response = await apiClient.post(`/opportunities/${opportunityId}/interactions`, data);
    return response.data.data;
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(opportunityId: number): Promise<{
    total: number;
    byType: Record<string, { count: number; lastInteraction: string }>;
  }> {
    const response = await apiClient.get(`/opportunities/${opportunityId}/interactions/stats`);
    return response.data.data;
  }
}

export const opportunityService = new OpportunityService();
