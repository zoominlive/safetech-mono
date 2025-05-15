import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface ReportsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number;
    rows: Array<{
      id: number,
      project_id: number,
      name: string,
      type: string,
      answers: JSON,
      photos: JSON,
      project: object,
      status: boolean,
      created_at: string,
      updated_at: string,
      deleted_at: string,
    }>;
  }
} 

export interface ReportData {
  name: string;
  status: boolean;
  answers: JSON;
  photos: JSON;
  project_id: number;
}

export interface ReportResponse {
  data: {
    id: number,
    project_id: number,
    name: string,
    type: string,
    answers: JSON,
    photos: JSON,
    project: object,
    status: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string,
  },
  code: number,
  message: string,
  success: boolean
}

export const reportService = {
  getAllReports: async (searchQuery?: string, sortBy?: string): Promise<ReportsResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    
    const response: AxiosResponse<ReportsResponse> = await BaseClient.get(
      `/reports/all?${params.toString()}`
    );
    return response.data;
  },
  
  getReportById: async (id: string): Promise<ReportResponse> => {
    const response: AxiosResponse<ReportResponse> = await BaseClient.get(`/customers/get-customer-details/${id}`);
    return response.data;
  },
  
  createReport: async (customerData: ReportData): Promise<ReportResponse> => {
    const response: AxiosResponse<ReportResponse> = await BaseClient.post('/customers/add', customerData);
    return response.data;
  },
  
  updateReport: async (id: string, customerData: ReportData): Promise<ReportResponse> => {
    const response: AxiosResponse<ReportResponse> = await BaseClient.put(`/customers/edit/${id}`, customerData);
    return response.data;
  },
  
  deleteReport: async (id: string): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.delete(`/customers/delete/${id}`);
    console.log('response', response);
    
    return response.data;
  }
};