import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface DashboardResponse {
  code: number;
  message: string;
  success: boolean;
  data: {
    overview: {
      totalOpenProjects: number;
      projectsCompletedLast30Days: number;
      avgTimeToComplete: number;
      projectsOlderThan48Hrs: number;
    };
    inProgress: Array<{
      id: string;
      projectName: string;
      company: string;
      startDate: string | Date;
      technician: string;
      status: string;
      reports: Array<{
        id: string;
        reportName: string;
      }>;
    }>;
    awaitingReview: Array<{
      id: string;
      projectName: string;
      company: string;
      completedDate: string | Date;
      reports: Array<{
        id: string;
        reportName: string;
      }>;
    }>;
  };
} 

export const dashboardService = {
  dashboard: async (): Promise<DashboardResponse> => {
    const response: AxiosResponse<DashboardResponse> = await BaseClient.get('/dashboard');
    return response.data;
  },
};
