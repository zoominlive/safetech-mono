import { BaseClient } from '@/lib/api/ApiClient';
import { User } from '@/store';
import { AxiosResponse } from 'axios';

interface UsersResponse {
  data: {
    count: number,
    rows: Array<{
      id: number,
      name: string,
      profile_picture: string,
      role: string,
      email: string,
      phone: string,
      last_login: string,
      is_verified: boolean,
      deactivated_user: boolean,
      password: string,
      created_at: string,
      updated_at: string,
      deleted_at: string,
      created_by: string
    }>;
  },
  code: number,
  message: string,
  success: boolean
}

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
  getAllUsers: async (searchQuery?: string, sortBy?: string): Promise<UsersResponse> => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      
      const response: AxiosResponse<UsersResponse> = await BaseClient.get(
        `/users/all?${params.toString()}`
      );
      return response.data;
    },

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
