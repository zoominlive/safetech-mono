interface IConfig {
  BASE_URL: string
  APP_NAME: string
  APP_VERSION: string
  }

export const config: IConfig = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME as string,
  APP_VERSION: process.env.NEXT_PUBLIC_VERSION as string
}