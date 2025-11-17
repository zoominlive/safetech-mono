interface IConfig {
  BASE_URL: string
  APP_NAME: string
  APP_VERSION: string
  }

const getBaseURL = (): string => {
  const envBaseURL = import.meta.env.VITE_BASE_URL as string;
  
  if (import.meta.env.DEV) {
    return envBaseURL;
  }
  
  // Production: Use relative path since frontend and backend are on same domain
  return '/api/v1';
}

export const config: IConfig = {
  BASE_URL: getBaseURL(),
  APP_NAME: import.meta.env.VITE_NAME as string,
  APP_VERSION: import.meta.env.VITE_VERSION as string
}