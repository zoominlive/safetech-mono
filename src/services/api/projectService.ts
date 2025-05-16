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
      pm: {
        name: string;
      }
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

export interface ProjectData {
  name: string;
  site_name: string;
  site_email: string;
  status: string;
  location_id: string;
  location: {
    id: number;
    name: string;
  }
  report_id: string;
  report: {
    id: number;
    name: string;
  },
  pm_id: string;
  pm: {
    id: number;
    name: string;
  };
  technician_id: string;
  technician: {
    id: number;
    name: string;
  },
  customer_id: string;
  company: {
    id: number;
    name: string;
  }
  start_date: string;
}

export interface ProjectResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    id: number,
    name: string,
    site_name: string,
    site_email: string,
    status: string,
    location_id: string,
    report_id: string,
    report: {
      id: number;
      name: string;
    },
    pm_id: string,
    technician_id: string,
    technician: {
      id: number;
      name: string;
    },
    pm: {
      id: number;
      name: string;
    },
    company: {
      id: number;
      name: string;
    },
    location: {
      id: number;
      name: string;
    },
    customer_id: string,
    start_date: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
  };
}

export const projectService = {
  getAllProjects: async (searchQuery?: string, sortBy?: string, statusFilter?: string, limit?: number, page?: number): Promise<ProjectsResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (statusFilter) params.append('statusFilter', statusFilter);
    if (limit) params.append('limit', limit.toString()); // Convert number to string
    if (page) params.append('page', page.toString());    // Convert number to string

    const response: AxiosResponse<ProjectsResponse> = await BaseClient.get(
      `/projects/all?${params.toString()}`
    );
    return response.data;
  },
  
  getProjectById: async (id: string): Promise<ProjectResponse> => {
    const response: AxiosResponse<ProjectResponse> = await BaseClient.get(`/projects/get-project-details/${id}`);
    return response.data;
  },
  
  createProject: async (projectData: ProjectData): Promise<ProjectResponse> => {
    const response: AxiosResponse<ProjectResponse> = await BaseClient.post('/projects/add', projectData);
    return response.data;
  },
  
  updateProject: async (id: string, projectData: ProjectData): Promise<ProjectResponse> => {
    const response: AxiosResponse<ProjectResponse> = await BaseClient.put(`/projects/edit/${id}`, projectData);
    return response.data;
  },
  
  deleteProject: async (id: string): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.delete(`/projects/delete/${id}`);
    return response.data;
  }
};
