import { store } from "@/store";
import { AxiosRequestConfig } from "axios";

const injectToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const newConfig = { ...config };
  const state = store.getState();
  try {
    if (state.auth.userDetails?.token && newConfig.headers) {
      newConfig.headers.Authorization = `Bearer ${state.auth.userDetails?.token}`;
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
