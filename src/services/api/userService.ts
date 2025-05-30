import { BaseClient } from '@/lib/api/ApiClient';
import { User } from '@/store';
import { AxiosResponse } from 'axios';

interface UsersResponse {
  data: {
    count: number,
    rows: Array<{
      id: string,
      first_name: string,
      last_name: string,
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

interface UserResponse {
  data: {
    id: string,
    first_name: string,
    last_name: string,
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
  }
  code: number,
  message: string,
  success: boolean
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_picture?: string; // Optional, can be undefined if not updating
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export const userService = {
  getAllUsers: async (searchQuery?: string, sortBy?: string, filter?: string, limit?: number, page?: number, role?: string): Promise<UsersResponse> => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort', sortBy);
      if (filter) params.append('filter', filter);
      if (limit) params.append('limit', limit.toString()); // Convert number to string
      if (page) params.append('page', page.toString());    // Convert number to string
      if (role) params.append('role', role);
      
      const response: AxiosResponse<UsersResponse> = await BaseClient.get(
        `/users/all?${params.toString()}`
      );
      return response.data;
    },

  createUser: async (data: User): Promise<User> => {
    const response: AxiosResponse<User> = await BaseClient.post('/users/add', data);
    return response.data;
  },
  
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> = await BaseClient.delete(`/users/delete/${id}`);
    return response.data;
  },

  updateProfile: async (id: string, data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response: AxiosResponse<UpdateProfileResponse> = await BaseClient.put(`/users/edit/${id}`, data);
    return response.data;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await BaseClient.get(`/users/get-user-details/${id}`);
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
