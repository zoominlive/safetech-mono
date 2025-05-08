import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { HEADERS, STATUS_CODES, TIMEOUT } from "./constants";
import { NetworkUtils } from "./helper";
import { config as Config } from "@/utils/config";

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

    switch (status) {
      case STATUS_CODES.INTERNAL_SERVER_ERROR: {
        // toast.error(ERROR_MESSAGES.GENERIC)
        break;
      }
      case STATUS_CODES.FORBIDDEN: {
        break;
      }
      case STATUS_CODES.UNAUTHORIZED: {
        // toast.error(response?.data.message)
        break;
      }
      case STATUS_CODES.NOT_FOUND: {
        // toast.error(response?.data.message)
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
