import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface ProjectsResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    count: number
    rows: Array<{
      id: string,
      project_no: string,
      name: string,
      site_name: string,
      site_email: string,
      status: string,
      location_id: string,
      pm_id: string,
      reports: Array<{
        id: string
      }>,
      pm: {
        first_name: string;
        last_name: string;
      }
      technician_id: string,
      technician: {
        first_name: string;
        last_name: string;
      },
      company: {
        first_name: string;
        last_name: string;
      },
      customer_id: string,
      start_date: string,
      end_date: string,
      created_at: string,
      updated_at: string,
      deleted_at: string,
    }>;
  };
} 

export interface ProjectData {
  name: string;
  site_name: string;
  specific_location: string;
  site_email: string;
  site_contact_name: string;
  site_contact_title: string;
  status: string;
  location_id: string;
  location: {
    id: string;
    name: string;
  }
  report_template_id: string;
  reportTemplate: {
    id: string;
    name: string;
  },
  pm_id: string;
  pm: {
    id: string;
    first_name: string;
    last_name: string;
  };
  technician_id: string;
  technician: {
    id: string;
    first_name: string;
    last_name: string;
  },
  customer_id: string;
  company: {
    id: string;
    first_name: string;
    last_name: string;
  }
  start_date: string;
  end_date: string;
  project_number?: string;
  report_id?: string;
}

export interface ProjectResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    id: string,
    project_no: string,
    name: string,
    site_name: string,
    specific_location: string,
    site_contact_name: string;
    site_contact_title: string;
    reportTemplate: {
      id: string;
      name: string;
    },
    report_template_id: string;
    site_email: string,
    status: string,
    location_id: string,
    report_id: string,
    report: {
      id: string;
      name: string;
    },
    pm_id: string,
    technician_id: string,
    technician: {
      id: string;
      first_name: string;
      last_name: string;
    },
    pm: {
      id: string;
      first_name: string;
      last_name: string;
    },
    company: {
      id: string;
      first_name: string;
      last_name: string;
    },
    location: {
      id: string;
      name: string;
    },
    reports: Array<{
    id: string;
    name: string;
    date_of_assessment: string;
    date_of_loss: string;
    site_contact_name?: string;
    site_contact_title?: string;
    assessment_due_to: string;
  }>;
    customer_id: string,
    start_date: string,
    end_date: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
  };
}

export const projectService = {
  getAllProjects: async (searchQuery?: string, sortBy?: string, statusFilter?: string, pm_ids?: string, technician_ids?: string, limit?: number, page?: number, startDateFrom?: string, startDateTo?: string): Promise<ProjectsResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (statusFilter) params.append('statusFilter', statusFilter);
    if (pm_ids) params.append('pm_ids', pm_ids);
    if (technician_ids) params.append('technician_ids', technician_ids);
    if (limit) params.append('limit', limit.toString()); // Convert number to string
    if (page) params.append('page', page.toString());    // Convert number to string
    if (startDateFrom) params.append('start_date_from', startDateFrom);
    if (startDateTo) params.append('start_date_to', startDateTo);

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
