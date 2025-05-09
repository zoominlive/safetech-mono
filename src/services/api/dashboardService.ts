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
      projectName: string;
      company: string;
      startDate: string | Date;
      technician: string;
      status: string;
    }>;
    awaitingReview: Array<{
      projectName: string;
      company: string;
      completedDate: string | Date;
    }>;
  };
} 

export const dashboardService = {
  dashboard: async (): Promise<DashboardResponse> => {
    const response: AxiosResponse<DashboardResponse> = await BaseClient.get('/dashboard');
    return response.data;
  },
};
