import { useAuthStore } from "@/store";
import { AxiosRequestConfig } from "axios";

const injectToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const newConfig = { ...config };
  
  try {
    const token = useAuthStore.getState().token;
    
    if (token && newConfig.headers) {
      newConfig.headers.Authorization = `Bearer ${token}`;
    }

    if (newConfig.headers)
      newConfig.headers["ngrok-skip-browser-warning"] = "true";

    return newConfig;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error(String(error));
  }
};

export const NetworkUtils = { injectToken };
