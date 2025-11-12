import apiClient from './apiClient';
import type {
  Policy,
  PolicyExtractionResponse,
  PolicySyncRequest,
  PolicySyncResponse,
  PolicyWithDetails,
  Contact,
  PolicyBeneficiaryLink
} from '../../types';

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

  /**
   * Upload policy document and extract data using AI
   */
  async uploadPolicyDocument(file: File): Promise<PolicyExtractionResponse> {
    const formData = new FormData();
    formData.append('policyDocument', file);

    const response = await apiClient.post('/policies/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000 // 2 minutes timeout for AI processing
    });

    return response.data.data;
  }

  /**
   * Sync extracted policy data to CRM
   */
  async syncPolicyToCRM(data: PolicySyncRequest): Promise<PolicySyncResponse> {
    const response = await apiClient.post('/policies/sync', data);
    return response.data.data;
  }

  /**
   * Get all policies for a customer
   */
  async getCustomerPolicies(customerId: number): Promise<PolicyWithDetails[]> {
    const response = await apiClient.get(`/customers/${customerId}/policies`);
    return response.data.data;
  }

  /**
   * Get policy with full details including beneficiaries and coverages
   */
  async getPolicyWithDetails(policyId: number): Promise<PolicyWithDetails> {
    const response = await apiClient.get(`/policies/${policyId}`);
    return response.data.data;
  }
}

// Beneficiary Service
export interface CreateBeneficiaryData {
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  ssnLastFour?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  contactType?: 'beneficiary' | 'dependent' | 'emergency' | 'other';
  notes?: string;
}

export interface LinkBeneficiaryData {
  contactId: number;
  beneficiaryType: 'primary' | 'contingent';
  allocationPercentage: number;
  relationship: string;
  isRevocable?: boolean;
  notes?: string;
}

class BeneficiaryService {
  /**
   * Get all beneficiaries for a customer
   */
  async getCustomerBeneficiaries(customerId: number, contactType?: string): Promise<Contact[]> {
    const params = contactType ? { contactType } : {};
    const response = await apiClient.get(`/customers/${customerId}/beneficiaries`, { params });
    return response.data.data;
  }

  /**
   * Get beneficiary by ID
   */
  async getBeneficiaryById(id: number): Promise<Contact> {
    const response = await apiClient.get(`/beneficiaries/${id}`);
    return response.data.data;
  }

  /**
   * Create new beneficiary
   */
  async createBeneficiary(customerId: number, data: CreateBeneficiaryData): Promise<{ id: number }> {
    const response = await apiClient.post(`/customers/${customerId}/beneficiaries`, data);
    return response.data.data;
  }

  /**
   * Update beneficiary
   */
  async updateBeneficiary(id: number, data: Partial<CreateBeneficiaryData>): Promise<void> {
    await apiClient.put(`/beneficiaries/${id}`, data);
  }

  /**
   * Delete beneficiary
   */
  async deleteBeneficiary(id: number): Promise<void> {
    await apiClient.delete(`/beneficiaries/${id}`);
  }

  /**
   * Get all beneficiaries for a policy
   */
  async getPolicyBeneficiaries(policyId: number): Promise<{
    beneficiaries: Array<Contact & PolicyBeneficiaryLink>;
    totals: { primary: number; contingent: number };
  }> {
    const response = await apiClient.get(`/policies/${policyId}/beneficiaries`);
    return response.data.data;
  }

  /**
   * Link beneficiary to policy
   */
  async linkBeneficiaryToPolicy(policyId: number, data: LinkBeneficiaryData): Promise<{ id: number }> {
    const response = await apiClient.post(`/policies/${policyId}/beneficiaries`, data);
    return response.data.data;
  }

  /**
   * Update beneficiary link
   */
  async updateBeneficiaryLink(
    policyId: number,
    linkId: number,
    data: Partial<LinkBeneficiaryData>
  ): Promise<void> {
    await apiClient.put(`/policies/${policyId}/beneficiaries/${linkId}`, data);
  }

  /**
   * Remove beneficiary from policy
   */
  async removeBeneficiaryFromPolicy(policyId: number, linkId: number): Promise<void> {
    await apiClient.delete(`/policies/${policyId}/beneficiaries/${linkId}`);
  }
}

export const policyService = new PolicyService();
export const beneficiaryService = new BeneficiaryService();
