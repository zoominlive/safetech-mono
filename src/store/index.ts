import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BaseClient } from '@/lib/api/ApiClient'; // Import BaseClient

// Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_picture: string;
  technician_signature?: string; // Optional field for technician signature
  last_login: string;
  deactivated_user: boolean;
  phone: string;
  token: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string, token: string) => Promise<void>;
  activateAccount: (password: string, token: string) => Promise<void>;
  resendActivation: (email: string) => Promise<void>;
  clearError: () => void;
  updateUserProfile: (user: User) => void;
}

// Create store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      rememberMe: false,

      // Login action
      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ loading: true, error: null });
        try {
          const response: any = await BaseClient.post('auth/login', { 
            email, 
            password,
            rememberMe
          });
          
          set({ 
            isAuthenticated: true, 
            user: response.data.user, 
            token: response.data.token,
            loading: false,
            rememberMe // Save the rememberMe preference
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            loading: false, 
            error: error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data 
                ? (error.data as { message: string }).message 
                : 'An error occurred'
          });
        }
      },
      
      // Logout action
      logout: () => {
        // Always clear localStorage on sign out
        try {
          localStorage.clear();
        } catch (e) {
          // no-op if storage is unavailable
        }
        set({ isAuthenticated: false, user: null, token: null, rememberMe: false });
      },
      
      // Reset password action
      forgotPassword: async (email: string) => {
        set({ loading: true, error: null });
        try {
          await BaseClient.post('auth/forgot-password', { email });
          
          set({ loading: false });
        } catch (error) {
          console.error('Reset password error:', error);
          set({ 
            loading: false, 
            error: error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data 
                ? (error.data as { message: string }).message 
                : 'An error occurred'
          });
        }
      },
      
      // Reset password action
      resetPassword: async (password: string, token: string) => {
        set({ loading: true, error: null });
        try {
          await BaseClient.post('auth/reset-password', { password, token });
          
          set({ loading: false });
        } catch (error) {
          console.error('Reset password error:', error);
          set({ 
            loading: false, 
            error: error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data 
                ? (error.data as { message: string }).message 
                : 'An error occurred'
          });
        }
      },
      
      // Activate account action
      activateAccount: async (password: string, token: string) => {
        set({ loading: true, error: null });
        try {
          await BaseClient.post(`users/activate/${token}`, { password });
          set({ loading: false });
        } catch (error) {
          console.error('Account activation error:', error);
          set({ 
            loading: false, 
            error: error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data 
                ? (error.data as { message: string }).message 
                : 'An error occurred'
          });
        }
      },
      
      // Resend activation action
      resendActivation: async (email: string) => {
        set({ loading: true, error: null });
        try {
          await BaseClient.post('users/resend-activation', { email });
          set({ loading: false });
        } catch (error) {
          console.error('Resend activation error:', error);
          set({ 
            loading: false, 
            error: error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data 
                ? (error.data as { message: string }).message 
                : 'An error occurred'
          });
        }
      },
      
      // Clear any errors in the store
      clearError: () => set({ error: null }),

      // New action to update user profile
      updateUserProfile: (user: User) => {
        set({ 
          user: user 
        });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => {
        // if (state.rememberMe) {
          return { 
            isAuthenticated: state.isAuthenticated, 
            user: state.user, 
            token: state.token,
            rememberMe: state.rememberMe
          }
        // }
        // return { rememberMe: state.rememberMe };
      },
      // storage: {
      //   getItem: (name) => {
      //     const storedData = JSON.parse(localStorage.getItem(name) || '{}');
      //     if (!storedData.state?.rememberMe) {
      //       const { rememberMe } = storedData.state || {};
      //       return { state: { rememberMe } }; // ✅ return object, not string
      //     }
      //     return storedData; // ✅ already parsed
      //   },
      //   setItem: (name, value) => {
      //     localStorage.setItem(name, JSON.stringify(value)); // ✅ store as string
      //   },
      //   removeItem: (name) => localStorage.removeItem(name),
      // }      
    }
  )
);

import { materialService, Material } from '@/services/api/materialService';

// Material store for managing standard and custom materials
interface MaterialState {
  materials: Material[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMaterials: () => Promise<void>;
  addCustomMaterial: (materialName: string) => Promise<void>;
  deleteCustomMaterial: (id: string) => Promise<void>;
  getAvailableMaterials: () => string[];
  isStandardMaterial: (materialName: string) => boolean;
  isCustomMaterial: (materialName: string) => boolean;
  clearError: () => void;
}

export const useMaterialStore = create<MaterialState>()(
  (set, get) => ({
    materials: [],
    loading: false,
    error: null,

    fetchMaterials: async () => {
      set({ loading: true, error: null });
      try {
        console.log('Fetching materials from API...');
        const response = await materialService.getAllMaterials();
        console.log('Materials API response:', response);
        
        // Check for both success property and status 200
        if (response.success || response.status === 200) {
          console.log('Materials fetched successfully:', response.data.materials);
          set({ materials: response.data.materials, loading: false });
        } else {
          console.error('Materials API returned error:', response.message);
          set({ error: response.message || 'Failed to fetch materials', loading: false });
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch materials', 
          loading: false 
        });
      }
    },

    addCustomMaterial: async (materialName: string) => {
      set({ loading: true, error: null });
      try {
        const response = await materialService.createCustomMaterial({
          name: materialName,
          type: 'custom'
        });
        
        if (response.success) {
          // Refresh materials list
          await get().fetchMaterials();
        } else {
          set({ error: response.message || 'Failed to add material', loading: false });
        }
      } catch (error) {
        console.error('Error adding custom material:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add material', 
          loading: false 
        });
      }
    },

    deleteCustomMaterial: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const response = await materialService.deleteCustomMaterial(id);
        if (response.success) {
          // Refresh materials list
          await get().fetchMaterials();
        } else {
          set({ error: response.message || 'Failed to delete material', loading: false });
        }
      } catch (error) {
        console.error('Error deleting custom material:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to delete material', 
          loading: false 
        });
      }
    },

    getAvailableMaterials: () => {
      const { materials } = get();
      const availableMaterials = materials
        .filter(material => material.is_active)
        .map(material => material.name);
      
      console.log('getAvailableMaterials called:', {
        totalMaterials: materials.length,
        activeMaterials: availableMaterials.length,
        materials: materials,
        availableMaterials: availableMaterials
      });
      
      return availableMaterials;
    },

    isStandardMaterial: (materialName: string) => {
      const { materials } = get();
      const material = materials.find(m => m.name === materialName && m.is_active);
      const result = material?.type === 'standard';
      console.log('isStandardMaterial:', { materialName, result, material });
      return result;
    },

    isCustomMaterial: (materialName: string) => {
      const { materials } = get();
      const material = materials.find(m => m.name === materialName && m.is_active);
      const result = material?.type === 'custom';
      console.log('isCustomMaterial:', { materialName, result, material });
      return result;
    },

    clearError: () => set({ error: null }),
  })
);
