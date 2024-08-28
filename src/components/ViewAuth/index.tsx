import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { checkIsLogin } from "@utils/index";
import { useLocalStorage } from "@utils/index";
import { useAppDispatch } from "@store/hooks";
import { setUserInfo } from "@store/userSlice";

interface PROPS {
  children: JSX.Element;
  isAuthRoute?: boolean;
}

const ViewAuth = ({ children, isAuthRoute = false }: PROPS) => {
  const isLogin = checkIsLogin();
  const location = useLocation();
  const [userMsgs] = useLocalStorage("user_info", null);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userMsgs) {
      dispatch(setUserInfo(userMsgs));
      setLoading(false);
    }
  }, []);

  if (!isAuthRoute) {
    return children;
  } else if (!isLogin) {
    return (
      <Navigate
        to={`/login?from=${window.location.href}`}
        state={{ from: location }}
      />
    );
  } else if (!loading) {
    return children;
  } else {
    return null;
  }
};

export default ViewAuth;
