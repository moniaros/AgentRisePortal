import apiClient from './apiClient';
import { Policy } from '../types';

export interface CreatePolicyData {
  customerId: number;
  policyNumber: string;
  policyType: 'auto' | 'home' | 'life' | 'health' | 'commercial' | 'umbrella' | 'renters' | 'other';
  insurer: string;
  effectiveDate: string;
  expirationDate: string;
  premiumAmount: number;
  premiumFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  coverageAmount?: number;
  deductible?: number;
  policyDetails?: Record<string, any>;
  acordData?: Record<string, any>;
  coverages?: Array<{
    type: string;
    limit?: number;
    deductible?: number;
    description?: string;
  }>;
}

export interface UpdatePolicyData {
  status?: 'active' | 'pending' | 'expired' | 'cancelled';
  premiumAmount?: number;
  expirationDate?: string;
  coverageAmount?: number;
  deductible?: number;
  policyDetails?: Record<string, any>;
  acordData?: Record<string, any>;
}

export interface PolicyFilters {
  customerId?: number;
  policyType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class PolicyService {
  /**
   * Get all policies with filters
   */
  async getPolicies(filters?: PolicyFilters): Promise<{ policies: Policy[] }> {
    const response = await apiClient.get('/policies', { params: filters });
    return response.data.data;
  }

  /**
   * Get policy by ID with coverages
   */
  async getPolicyById(id: number): Promise<Policy> {
    const response = await apiClient.get(`/policies/${id}`);
    return response.data.data;
  }

  /**
   * Create new policy
   */
  async createPolicy(data: CreatePolicyData): Promise<{ id: number }> {
    const response = await apiClient.post('/policies', data);
    return response.data.data;
  }

  /**
   * Update policy
   */
  async updatePolicy(id: number, data: UpdatePolicyData): Promise<void> {
    await apiClient.put(`/policies/${id}`, data);
  }

  /**
   * Delete policy
   */
  async deletePolicy(id: number): Promise<void> {
    await apiClient.delete(`/policies/${id}`);
  }
}

export const policyService = new PolicyService();
