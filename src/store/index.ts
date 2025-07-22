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
            password 
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
        const { rememberMe } = get();
        if (rememberMe) {
          set({ isAuthenticated: false, user: null, token: null });
        } else {
          set({ isAuthenticated: false, user: null, token: null, rememberMe: false });
          localStorage.removeItem('auth-storage'); // Clear persisted state
        }
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

// Material store for managing standard and custom materials
interface MaterialState {
  standardMaterials: string[];
  customMaterials: string[];
  
  // Actions
  addCustomMaterial: (materialName: string) => void;
  getAvailableMaterials: () => string[];
  isStandardMaterial: (materialName: string) => boolean;
  isCustomMaterial: (materialName: string) => boolean;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      standardMaterials: [
        "Sprayed Fireproofing",
        "Blown Insulation",
        "Loose Fill / Vermiculite Insulation",
        "Mechanical Pipe Insulation – Straights",
        "Mechanical Pipe Insulation – Fittings",
        "HVAC Duct Insulation",
        "Breeching / Exhaust Insulation",
        "Tank Insulation",
        "Boiler Insulation",
        "Other Mechanical Equipment Insulation",
        "Sprayed Texture / Stucco Finishes",
        "Plaster Finishes",
        "Drywall Joint Compound",
        "Lay-in Acoustic Ceiling Tiles",
        "Glued-on Acoustic Ceiling Tiles",
        "Cement Ceiling Panels",
        "Vinyl Floor Tiles",
        "Vinyl Sheet Flooring",
        "Mastic (Flooring)",
        "Asbestos Cement Piping",
        "Asbestos Cement Roofing, Siding, Wallboard",
        "Other Cement Products (Asbestos Cement)",
        "Exterior Building Caulking",
        "Exterior Building Shingles",
        "Exterior Building Roof Membrane",
        "Miscellaneous Mastic",
      ],
      customMaterials: [],

      addCustomMaterial: (materialName: string) => {
        const { customMaterials } = get();
        if (!customMaterials.includes(materialName)) {
          set({ customMaterials: [...customMaterials, materialName] });
        }
      },

      getAvailableMaterials: () => {
        const { standardMaterials, customMaterials } = get();
        return [...standardMaterials, ...customMaterials];
      },

      isStandardMaterial: (materialName: string) => {
        const { standardMaterials } = get();
        return standardMaterials.includes(materialName);
      },

      isCustomMaterial: (materialName: string) => {
        const { customMaterials } = get();
        return customMaterials.includes(materialName);
      },
    }),
    {
      name: 'material-storage',
    }
  )
);
