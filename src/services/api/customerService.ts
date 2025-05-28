import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface CustomersResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number
    rows: Array<{
      id: string,
      first_name: string,
      last_name: string,
      email: string,
      phone: string,
      status: boolean,
      created_at: string,
      updated_at: string,
      deleted_at: string,
    }>;
  };
} 

export interface CustomerData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: boolean;
}

export interface CustomerResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    projects: Array<{
      id: string,
      name: string,
      start_date: string,
      end_date: string | null,
      status: string,
    }>,
    status: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
  };
}

export const customerService = {
  getAllCustomers: async (searchQuery?: string, sortBy?: string, filter?: string, limit?: number, page?: number): Promise<CustomersResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sort', sortBy);
    if (filter) params.append('filter', filter);
    if (limit) params.append('limit', limit.toString()); // Convert number to string
    if (page) params.append('page', page.toString());    // Convert number to string
    
    const response: AxiosResponse<CustomersResponse> = await BaseClient.get(
      `/customers/all?${params.toString()}`
    );
    return response.data;
  },
  
  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response: AxiosResponse<CustomerResponse> = await BaseClient.get(`/customers/get-customer-details/${id}`);
    return response.data;
  },
  
  createCustomer: async (customerData: CustomerData): Promise<CustomerResponse> => {
    const response: AxiosResponse<CustomerResponse> = await BaseClient.post('/customers/add', customerData);
    return response.data;
  },
  
  updateCustomer: async (id: string, customerData: CustomerData): Promise<CustomerResponse> => {
    const response: AxiosResponse<CustomerResponse> = await BaseClient.put(`/customers/edit/${id}`, customerData);
    return response.data;
  },
  
  deleteCustomer: async (id: string): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.delete(`/customers/delete/${id}`);
    console.log('response', response);
    
    return response.data;
  }
};
