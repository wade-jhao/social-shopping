import { api } from "@apis/index";

export const fetchSettingFacebookLoginStatus = async (url: string) => {
  return await api.get(url, { baseURL: "" }).then((res: any) => {
    return res;
  });
};
export const fetchSettingSchedulerStatus = async (url: string) => {
  return await api.get(url, { baseURL: "" }).then((res: any) => {
    return res;
  });
};
