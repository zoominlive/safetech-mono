interface IConfig {
  BASE_URL: string
  APP_NAME: string
  APP_VERSION: string
  }

export const config: IConfig = {
  BASE_URL: import.meta.env.VITE_BASE_URL as string,
  APP_NAME: import.meta.env.VITE_NAME as string,
  APP_VERSION: import.meta.env.VITE_VERSION as string
}