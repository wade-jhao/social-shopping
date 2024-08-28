import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
// import { sendGaEvent } from "@utils/track";

interface RequestConfig extends AxiosRequestConfig {
  baseURL?: string;
}

class Request {
  instance: AxiosInstance;
  private config: RequestConfig;
  constructor(config: RequestConfig) {
    const initConfig: RequestConfig = {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      timeout: 12000,
      // withCredentials: true, //request with cookie
    };
    this.config = { ...config, ...initConfig };
    this.instance = axios.create(this.config);
    this.instance.interceptors.request.use(
      (res: InternalAxiosRequestConfig) => {
        return res;
      },
      (err: any) => err
    );
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        if (res.status !== 200) {
          // sendGaEvent<{ msg: string; type: string; endpoint: string }>(
          //   "error_notice",
          //   {
          //     msg: JSON.stringify(res?.statusText),
          //     type: "legacy",
          //     endpoint: (res?.config?.url as string) || "",
          //   }
          // );
        }
        if (res.status === 200 && !res?.data?.success) {
          // sendGaEvent<{ msg: string; type: string; endpoint: string }>(
          //   "error_notice",
          //   {
          //     msg: res?.data?.error,
          //     type: "legacy",
          //     endpoint: (res?.config?.url as string) || "",
          //   }
          // );
        }
        return res.data;
      },
      (err: any) => {
        // sendGaEvent<{ msg: string; type: string; endpoint: string }>(
        //   "error_notice",
        //   {
        //     msg: JSON.stringify(err?.message),
        //     type: "legacy",
        //     endpoint: err?.config?.url,
        //   }
        // );
      }
    );
  }
}

export default Request;
