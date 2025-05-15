import { BaseClient } from '@/lib/api/ApiClient';
import { useAuthStore } from '@/store';
import { AxiosResponse } from 'axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface SetNewPasswordRequest {
  password: string;
  confirmPassword: string;
}

interface SetNewPasswordResponse {
  message: string;
  success: boolean;
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

export const authService = {
  
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('calling authService');
    const response: AxiosResponse<LoginResponse> = await BaseClient.post('/auth/login', data);
    return response.data;
  },
  
  setNewPassword: async (data: SetNewPasswordRequest): Promise<SetNewPasswordResponse> => {
    const response: AxiosResponse<SetNewPasswordResponse> = await BaseClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response: AxiosResponse<ResetPasswordResponse> = await BaseClient.post('/auth/reset-password', data);
    return response.data;
  },
  
  logout: (): void => {
    // Clear authentication state in Zustand store
    console.log('token', useAuthStore.getState().token);
    useAuthStore.getState().logout();
    // You could also make an API call to invalidate the token on server if needed
  },
  
  validateToken: async (): Promise<boolean> => {
    try {
      // Call an endpoint that requires authentication
      await BaseClient.get(`/auth/login-with-token?token=${useAuthStore.getState().token}`);
      return true;
    } catch (error) {
      // If validation fails, logout
      authService.logout();
      return false;
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response: AxiosResponse<ChangePasswordResponse> = await BaseClient.post('/auth/change-password', data);
    return response.data;
  }
};
