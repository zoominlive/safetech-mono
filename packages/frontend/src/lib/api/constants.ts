import { AxiosError } from "axios";

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "X-Requested-With": "XMLHttpRequest",
  "Access-Control-Allow-Origin": "*",
};

enum STATUS_CODES {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
  NOT_FOUND = 404,
}

const ERROR_MESSAGES = { GENERIC: "Oops! Something went wrong" };

const TIMEOUT = 30000;

export { HEADERS, STATUS_CODES, ERROR_MESSAGES, TIMEOUT };
export type { AxiosError };
