import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface CustomersResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number
    rows: Array<{
      id: number,
      name: string,
      email: string,
      phone: string,
      status: boolean,
      created_at: string,
      updated_at: string,
      deleted_at: string,
    }>;
  };
} 

export const customerService = {
  getAllCustomers: async (): Promise<CustomersResponse> => {
    const response: AxiosResponse<CustomersResponse> = await BaseClient.get('/customers/all');
    return response.data;
  },
};
