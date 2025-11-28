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
    const response: AxiosResponse<ProjectDrawingsResponse> = await BaseClient.get(
      `/projects/${projectId}/drawings`,
      {
        // Increased timeout for slow networks / large drawing sets
        timeout: 60000,
      }
    );
    return response.data;
  },

  upload: async (projectId: string, files: File[], isMarked: boolean): Promise<ProjectDrawingsResponse | UploadDrawingResponse> => {
    // Simple retry mechanism to make uploads more resilient on flaky networks.
    const maxRetries = 2;
    let attempt = 0;

    // We must rebuild FormData for each attempt because it's a streamed body.
    const buildFormData = () => {
      const fd = new FormData();
      files.forEach((file) => fd.append('files[]', file, file.name));
      fd.append('is_marked', String(isMarked));
      return fd;
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const formData = buildFormData();
        const response: AxiosResponse<ProjectDrawingsResponse | UploadDrawingResponse> =
          await BaseClient.postFormData(`/projects/${projectId}/drawings`, formData, {
            // Allow more time for multi-file uploads over slow networks
            timeout: 120000,
          });
        return response.data;
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        attempt += 1;
        // Small backoff between retries
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  },

  remove: async (projectId: string, drawingId: string): Promise<{ success: boolean; message: string } & { code?: number }> => {
    const response: AxiosResponse<{ success: boolean; message: string } & { code?: number }> =
      await BaseClient.delete(`/projects/${projectId}/drawings/${drawingId}`, {
        // Give deletes a bit more time in case S3 is slow
        timeout: 60000,
      });
    return response.data;
  }
};


