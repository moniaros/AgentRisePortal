import apiClient from './apiClient';
import { Customer, TimelineEntry } from '../types';

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  customerSince?: string;
  assignedAgentId?: number;
  communicationPreference?: 'email' | 'phone' | 'sms' | 'none';
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: 'active' | 'inactive' | 'pending';
  attentionFlag?: boolean;
  attentionReason?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  status?: string;
  assignedAgent?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRecords: number;
  };
}

export interface CreateTimelineEntryData {
  entryType: 'note' | 'call' | 'email' | 'meeting' | 'claim' | 'policy_change' | 'payment';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

class CustomerService {
  /**
   * Get all customers with pagination and filters
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get('/customers', { params: filters });
    return {
      data: response.data.data.customers,
      pagination: response.data.data.pagination
    };
  }

  /**
   * Get customer by ID with full details
   */
  async getCustomerById(id: number): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.data;
  }

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerData): Promise<{ id: number }> {
    const response = await apiClient.post('/customers', data);
    return response.data.data;
  }

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: UpdateCustomerData): Promise<void> {
    await apiClient.put(`/customers/${id}`, data);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }

  /**
   * Add timeline entry for customer
   */
  async addTimelineEntry(customerId: number, data: CreateTimelineEntryData): Promise<{ id: number }> {
    const response = await apiClient.post(`/customers/${customerId}/timeline`, data);
    return response.data.data;
  }
}

export const customerService = new CustomerService();
