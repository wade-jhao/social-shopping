import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useLogin = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);

  useEffect(() => {
    if (Cookies.get("fb_access_token")) {
      setIsLogin(true);
    }
  }, []);

  return isLogin;
};
