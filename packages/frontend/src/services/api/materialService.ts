import { AxiosResponse } from 'axios';
import { BaseClient } from '@/lib/api/ApiClient';

// Types
export interface Material {
  id: string;
  name: string;
  type: 'standard' | 'custom';
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MaterialData {
  name: string;
  type: 'standard' | 'custom';
}

export interface MaterialsResponse {
  success?: boolean;
  status?: number;
  message?: string;
  data: {
    materials: Material[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface MaterialResponse {
  success: boolean;
  data: Material;
  message?: string;
}

export interface CreateMaterialResponse {
  success: boolean;
  data: Material;
  message?: string;
}

export const materialService = {
  // Get all materials (both standard and custom)
  getAllMaterials: async (): Promise<MaterialsResponse> => {
    const response: AxiosResponse<MaterialsResponse> = await BaseClient.get('/materials/all');
    return response.data;
  },

  // Get only standard materials
  getStandardMaterials: async (): Promise<MaterialsResponse> => {
    const response: AxiosResponse<MaterialsResponse> = await BaseClient.get('/materials/standard');
    return response.data;
  },

  // Get only custom materials
  getCustomMaterials: async (): Promise<MaterialsResponse> => {
    const response: AxiosResponse<MaterialsResponse> = await BaseClient.get('/materials/custom');
    return response.data;
  },

  // Create a new custom material
  createCustomMaterial: async (materialData: MaterialData): Promise<CreateMaterialResponse> => {
    const response: AxiosResponse<CreateMaterialResponse> = await BaseClient.post('/materials/add', materialData);
    return response.data;
  },

  // Update a material
  updateMaterial: async (id: string, materialData: MaterialData): Promise<MaterialResponse> => {
    const response: AxiosResponse<MaterialResponse> = await BaseClient.put(`/materials/edit/${id}`, materialData);
    return response.data;
  },

  // Delete a custom material (only custom materials can be deleted)
  deleteCustomMaterial: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> = await BaseClient.delete(`/materials/delete/${id}`);
    return response.data;
  },

  // Toggle material active status
  toggleMaterialStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> = await BaseClient.patch(`/materials/${id}/status`, { is_active: isActive });
    return response.data;
  },

  // Get material by ID
  getMaterialById: async (id: string): Promise<MaterialResponse> => {
    const response: AxiosResponse<MaterialResponse> = await BaseClient.get(`/materials/get-material-details/${id}`);
    return response.data;
  },

  // Search materials
  searchMaterials: async (searchQuery: string): Promise<MaterialsResponse> => {
    const response: AxiosResponse<MaterialsResponse> = await BaseClient.get(`/materials/search?q=${encodeURIComponent(searchQuery)}`);
    return response.data;
  },

  // Bulk import materials (for admin use)
  bulkImportMaterials: async (materials: MaterialData[]): Promise<{ success: boolean; message: string; imported_count: number }> => {
    const response: AxiosResponse<{ success: boolean; message: string; imported_count: number }> = await BaseClient.post('/materials/bulk-import', { materials });
    return response.data;
  },

  // Export materials to CSV
  exportMaterials: async (): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await BaseClient.get('/materials/export', {
      responseType: 'blob'
    });
    return response.data;
  }
}; 