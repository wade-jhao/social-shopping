import Cookies from "js-cookie";

// checking has login
export const checkIsLogin = () => {
  return Cookies.get("fb_access_token") !== undefined;
};
