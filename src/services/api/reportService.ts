import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface ReportsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number;
    rows: Array<{
      id: string,
      name: string,
      created_at: string,
      completed_reports: number,
      status: boolean,
      answers: Record<string, any> | null,
    }>;
  }
}

interface ReportTemplatesResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number;
    rows: Array<{
      id: string,
      name: string,
      schema: any,
      created_at: string,
      updated_at: string
    }>;
  }
} 

export interface ReportData {
  name: string;
  status: boolean;
  answers?: {
    moisture_status?: string;
    moisture_level?: string | string[];
    wall_condition?: string;
    [key: string]: any;
  };
}

export interface ReportResponse {
  data: {
    id: string,
    name: string,
    created_at: string,
    updated_at: string,
    site_contact_name: string,
    site_contact_title: string,
    assessment_due_to: string,
    date_of_loss: string,
    date_of_building_material: string,
    uploaded_data: Array<{
      sample_id: string,
      material: string,
      quantity: string,
      location: string,
      result: string,
    }>,
    answers: {
      moisture_status?: string;
      moisture_level?: string | string[];
      wall_condition?: string;
      [key: string]: any;
    } | null,
    status: boolean,
  },
  code: number,
  message: string,
  success: boolean
}

export interface ProjectReportData {
  project_id: string;
  report_id: string;
  site_contact_name: string;
  site_contact_title: string;
  assessment_due_to: string;
  date_of_loss: string;
  date_of_assessment: string;
}

export const reportService = {
  getAllReports: async (searchQuery?: string, sortBy?: string, pageSize?: number, currentPage?: number): Promise<ReportsResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (pageSize) params.append('limit', pageSize.toString());
    if (currentPage) params.append('page', currentPage.toString());
    
    const response: AxiosResponse<ReportsResponse> = await BaseClient.get(
      `/reports/all?${params.toString()}`
    );
    return response.data;
  },

  getAllReportTemplates: async (): Promise<ReportTemplatesResponse> => {    
    const response: AxiosResponse<ReportTemplatesResponse> = await BaseClient.get(
      '/report-templates/all'
    );
    return response.data;
  },
  
  getReportById: async (id: string): Promise<ReportResponse> => {
    const response: AxiosResponse<ReportResponse> = await BaseClient.get(`/reports/get-report-details/${id}`);
    return response.data;
  },
  
  updateReport: async (id: string, reportData: ReportData): Promise<ReportResponse> => {
    const response: AxiosResponse<ReportResponse> = await BaseClient.put(`/reports/edit/${id}`, reportData);
    return response.data;
  },
  
  toggleReportStatus: async (id: string, status: boolean): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.patch(`/reports/${id}/status`, { status });
    return response.data;
  },
  
  updateProjectReport: async (projectId: string, reportData: ProjectReportData): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.put(`/projects/${projectId}/report`, reportData);
    return response.data;
  }
};