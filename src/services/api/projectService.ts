import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface ProjectsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number
    rows: Array<{
      id: number,
      name: string,
      site_name: string,
      site_email: string,
      status: string,
      location_id: string,
      pm_id: string,
      technician_id: string,
      technician: {
        name: string;
      },
      company: {
        name: string;
      },
      customer_id: string,
      start_date: string,
      created_at: string,
      updated_at: string,
      deleted_at: string,
    }>;
  };
} 

export const projectService = {
  getAllProjects: async (): Promise<ProjectsResponse> => {
    const response: AxiosResponse<ProjectsResponse> = await BaseClient.get('/projects/all');
    return response.data;
  },
};
