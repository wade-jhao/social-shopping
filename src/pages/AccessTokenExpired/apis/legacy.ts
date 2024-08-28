import { api } from "@apis/index";

export const getUrls = async (url: string) => {
  let urls: { platform: string } | null = null;

  await api.get(url, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      urls = data;
    }
  });
  return urls;
};
