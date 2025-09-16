import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

export interface ProjectDrawing {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  is_marked: boolean;
  created_at: string;
}

export interface ProjectDrawingsResponse {
  code: number;
  message: string;
  success: boolean;
  data: ProjectDrawing[];
}

export interface UploadDrawingResponse {
  code: number;
  message: string;
  success: boolean;
  data: ProjectDrawing;
}

export const projectDrawingService = {
  list: async (projectId: string): Promise<ProjectDrawingsResponse> => {
    const response: AxiosResponse<ProjectDrawingsResponse> = await BaseClient.get(`/projects/${projectId}/drawings`);
    return response.data;
  },

  upload: async (projectId: string, files: File[], isMarked: boolean): Promise<ProjectDrawingsResponse | UploadDrawingResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files[]', file, file.name));
    formData.append('is_marked', String(isMarked));
    const response: AxiosResponse<ProjectDrawingsResponse | UploadDrawingResponse> = await BaseClient.postFormData(`/projects/${projectId}/drawings`, formData);
    return response.data;
  },

  remove: async (projectId: string, drawingId: string): Promise<{ success: boolean; message: string } & { code?: number }> => {
    const response: AxiosResponse<{ success: boolean; message: string } & { code?: number }> = await BaseClient.delete(`/projects/${projectId}/drawings/${drawingId}`);
    return response.data;
  }
};


