import { BaseClient } from '@/lib/api/ApiClient';
import { AxiosResponse } from 'axios';

interface LocationsResponse {
  count: number;
  success: boolean;
  data: Array<{
    id: string,
    name: string,
    address_line_1: string;
    address_line_2: string;
    city: string;
    province: string;
    postal_code: string;
    active: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string,
  }>;
} 

export interface LocationData {
  name: string;
  active: boolean;
}

export interface LocationResponse {
  success: boolean;
  data: {
    id: string,
    name: string,
    active: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
  };
}

export const locationService = {
  getAllLocations: async (searchQuery?: string, sortBy?: string): Promise<LocationsResponse> => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    
    const response: AxiosResponse<LocationsResponse> = await BaseClient.get(
      `/locations?${params.toString()}`
    );
    return response.data;
  },
  
  getLocationById: async (id: string): Promise<LocationResponse> => {
    const response: AxiosResponse<LocationResponse> = await BaseClient.get(`/locations/${id}`);
    return response.data;
  },
  
  createLocation: async (customerData: LocationData): Promise<LocationResponse> => {
    const response: AxiosResponse<LocationResponse> = await BaseClient.post('/locations/add', customerData);
    return response.data;
  },
  
  updateLocation: async (id: string, customerData: LocationData): Promise<LocationResponse> => {
    const response: AxiosResponse<LocationResponse> = await BaseClient.put(`/locations/${id}`, customerData);
    return response.data;
  },
  
  deleteLocation: async (id: string): Promise<{success: boolean; message: string}> => {
    const response: AxiosResponse<{success: boolean; message: string}> = await BaseClient.delete(`/locations/${id}`);
    console.log('response', response);
    
    return response.data;
  },

  getLocationsByCustomerId: async (customerId: string): Promise<LocationsResponse> => {
    const response: AxiosResponse<LocationsResponse> = await BaseClient.get(`/locations/${customerId}`);
    return response.data;
  }
};