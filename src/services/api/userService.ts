import { BaseClient } from '@/lib/api/ApiClient';
import { User } from '@/store';
import { AxiosResponse } from 'axios';

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export const userService = {
  updateProfile: async (id: string, data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response: AxiosResponse<UpdateProfileResponse> = await BaseClient.put(`/users/edit/${id}`, data);
    return response.data;
  },
  uploadProfilePicture: async (userId: string, formData: FormData) => {
    try {
      const response = await BaseClient.post(`/users/${userId}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = 
        error && typeof error === 'object' && 'response' in error
          ? (error.response as any)?.data?.message
          : 'Failed to upload profile picture';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  },
};
