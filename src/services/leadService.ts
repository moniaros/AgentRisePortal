import apiClient from './apiClient';
import { Lead } from '../types';
import { PaginatedResponse } from './customerService';

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: string;
  interest?: string;
  notes?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedAgentId?: number;
  score?: number;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  assignedAgent?: number;
  search?: string;
}

export interface ConvertLeadData {
  customerData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

class LeadService {
  /**
   * Get all leads with pagination and filters
   */
  async getLeads(filters?: LeadFilters): Promise<PaginatedResponse<Lead>> {
    const response = await apiClient.get('/leads', { params: filters });
    return {
      data: response.data.data.leads,
      pagination: response.data.data.pagination
    };
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: number): Promise<Lead> {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data.data;
  }

  /**
   * Create new lead
   */
  async createLead(data: CreateLeadData): Promise<{ id: number }> {
    const response = await apiClient.post('/leads', data);
    return response.data.data;
  }

  /**
   * Update lead
   */
  async updateLead(id: number, data: UpdateLeadData): Promise<void> {
    await apiClient.put(`/leads/${id}`, data);
  }

  /**
   * Delete lead
   */
  async deleteLead(id: number): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  }

  /**
   * Convert lead to customer
   */
  async convertLead(id: number, data?: ConvertLeadData): Promise<{ customerId: number }> {
    const response = await apiClient.post(`/leads/${id}/convert`, data);
    return response.data.data;
  }
}

export const leadService = new LeadService();
