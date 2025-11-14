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
  
  return 'https://9ddf8f58-2768-4062-96b6-6f709c8dbac2-00-1omg4hp6qmbo2.picard.replit.dev:8080/api/v1';
}

export const config: IConfig = {
  BASE_URL: getBaseURL(),
  APP_NAME: import.meta.env.VITE_NAME as string,
  APP_VERSION: import.meta.env.VITE_VERSION as string
}