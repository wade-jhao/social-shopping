import Cookies from "js-cookie";

const fbApiErrorHandler = <T, TwE extends T>(
  callback: (response: T) => void,
  strict: boolean = true
): ((response: TwE) => void) => {
  return (response: any) => {
    if (response?.error?.code === 190) {
      // access token expired
      window.localStorage.removeItem("user_id");
      window.localStorage.removeItem("user_info");
      Cookies.remove("fb_access_token");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } else if (response?.error?.code === 10) {
      console.log("FB error 10:", response?.error.message);
      callback(response satisfies T);
    } else if ((!response || response.error) && strict) {
      throw Error(response?.error.message || "FB API Error");
    } else callback(response satisfies T);
  };
};

export const getLongTermAccessToken = async (
  accessToken: string,
  appId: string,
  appSecret: string,
  onSuccess: Function
) => {
  const endpoint = `/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;

  await FB.api(
    endpoint,
    fbApiErrorHandler(
      (response: { access_token: string; token_type: string }) => {
        if (response) {
          onSuccess && onSuccess(response);
        }
      }
    )
  );
};

export const getUserInfo = async (
  accessToken: string,
  userId: string,
  onSuccess: Function
) => {
  const endpoint = `/${userId}?access_token=${accessToken}&fields=id,email,name,picture{url}`;
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: any) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    })
  );
};
