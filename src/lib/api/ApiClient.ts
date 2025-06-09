import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { HEADERS, STATUS_CODES, TIMEOUT } from "./constants";
import { NetworkUtils } from "./helper";
import { config as Config } from "@/utils/config";
import { useAuthStore } from "@/store";
import { toast } from "@/components/ui/use-toast";

class ApiClient {
  ApiInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.ApiInstance = axios.create({
      baseURL: baseURL,
      timeout: TIMEOUT,
      headers: HEADERS,
    });

    this.ApiInstance.interceptors.request.use(
      NetworkUtils.injectToken as any,
      (error) => Promise.reject(error),
    );

    this.ApiInstance.interceptors.response.use(
      (response) => response,
      this.handleError,
    );
  }

  get<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.get<T, R>(url, config);
  }

  patch<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.patch<T, R>(url, data, config);
  }

  post<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.post<T, R>(url, data, config);
  }

  postFormData<T = unknown, R = AxiosResponse<T>>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.post<T, R>(url, formData, config);
  }

  putFormData<T = unknown, R = AxiosResponse<T>>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.put<T, R>(url, formData, config);
  }

  put<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.put<T, R>(url, data, config);
  }

  delete<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.ApiInstance.delete<T, R>(url, config);
  }

  handleError = async (error: AxiosError) => {
    const { response }: { response?: AxiosResponse } = error;
    const status = response?.status ?? "";

    // Check for token expiration message
    if (response?.data && 
        typeof response.data === 'object' && 
        'code' in response.data && 
        'message' in response.data &&
        response.data.code === 400 && 
        response.data.message === "Your token has been expired, Please login again") {
      
      // Handle token expiration
      useAuthStore.getState().logout();
      
      // Show notification to user
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000
      });
      
      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(response);
    }

    switch (status) {
      case STATUS_CODES.INTERNAL_SERVER_ERROR: {
        // Handle server error
        break;
      }
      case STATUS_CODES.FORBIDDEN: {
        // Handle forbidden error
        break;
      }
      case STATUS_CODES.UNAUTHORIZED: {
        // Only redirect if the user is already authenticated (token expired)
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
        // Otherwise, just reject and let the page handle the error
        break;
      }
      case STATUS_CODES.NOT_FOUND: {
        // Handle not found error
        break;
      }
      default:
        break;
    }

    return Promise.reject(response);
  };
}

const { BASE_URL, APP_VERSION } = Config;

const BaseClient = new ApiClient(BASE_URL + "/" + APP_VERSION);

export { BaseClient };
