import { useEffect, useState } from "react";
import Header from "@components/Header";
import Footer from "@components/Footer";
import styles from "./index.module.scss";
import Cookies from "js-cookie";
import Tooltip from "@mui/material/Tooltip";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { clearUserInfo } from "@store/userSlice";
import { getApiAsync } from "@store/apiSlice";
import { selectLoading, setLoading } from "@store/commonSlice";
import { selectApis } from "@store/apiSlice";
import ScrollTop from "@components/ScrollToTop";
import Fab from "@mui/material/Fab";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Loading from "@components/Loading";
import Notice from "@components/Notice";
import { useParams } from "react-router-dom";
import { getQueryParam } from "@utils/common";
import { decode } from "js-base64";
import { useNavigate } from "react-router-dom";
import HelpCenterDrawer from "@components/HelpCenter/HelpCenterDrawer";
import { PopperPlacementType } from "@mui/base";
import InfoIcon from "@mui/icons-material/Info";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { isMobileBrowser } from "@utils/common";

interface PROPS {
  includeLayout?: boolean;
  children: JSX.Element;
}

function Layout(props: PROPS): JSX.Element {
  let { activityId, postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const apis = useAppSelector(selectApis);
  const { includeLayout = true } = props;

  const getCurChildren = () => {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/home"
    ) {
      return props.children;
    } else {
      return apis ? props.children : null;
    }
  };
  const curChild = getCurChildren();
  useEffect(() => {
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/home"
    ) {
      let queryStrApi = getQueryParam("api");
      if (queryStrApi) {
        window.sessionStorage.setItem("api", queryStrApi);
      } else {
        queryStrApi = window.sessionStorage.getItem("api");
      }
      if (queryStrApi) {
        let url = `${decode(queryStrApi)}&activity_id=${activityId}`;
        if (postId) {
          url = `${url}&post_id=${postId}`;
        }
        dispatch(getApiAsync(url));
      } else {
        navigate("/home");
      }
    }
  }, []);

  useEffect(() => {
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/home"
    ) {
      if (!apis) {
        dispatch(setLoading(true));
      } else {
        dispatch(setLoading(false));
      }
    }
  }, [apis]);

  const onLogout = async () => {
    await clearAllStorageUserInfo();
    await setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  // remove all storage user info, includes redux, localstorage, cookies
  const clearAllStorageUserInfo = () => {
    window.localStorage.removeItem("user_info");
    window.localStorage.removeItem("user_id");
    Cookies.remove("fb_access_token");
    dispatch(clearUserInfo());
  };

  const pages = [
    {
      name: "首頁",
      onClick: () => navigate("/home"),
    },
  ];
  const settings = [
    {
      name: "登出",
      onClick: onLogout,
    },
  ];

  const [guideAnchorEl, setGuideAnchorEl] = useState<null | HTMLElement>(null);
  const [isHideGuideOpenButton, setIsHideGuideOpenButton] = useState<boolean>(
    window.location.pathname.includes("/liveroom/activities") &&
      window.location.pathname.includes("/posts")
  );
  const handleGuideClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLElement>) => {
      setGuideAnchorEl(guideAnchorEl ? null : event.currentTarget);
      // setPlacement(newPlacement);
    };

  return (
    <>
      {includeLayout && <Header pageList={pages} settingList={settings} />}
      <div className={styles.layout}>{curChild}</div>
      {includeLayout && <Footer />}
      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon color="primary" />
        </Fab>
      </ScrollTop>
      <Loading isVisible={loading} />
      <Notice />
      {!isMobileBrowser() && (
        <>
          <HelpCenterDrawer
            anchorEl={guideAnchorEl}
            onClose={() => setGuideAnchorEl(null)}
          />
          <Tooltip title="幫助中心" placement="top" arrow>
            <Fab
              id="guide-fab"
              color="primary"
              aria-label="info"
              sx={{
                position: "fixed",
                right: isHideGuideOpenButton ? -44 : 24,
                bottom: 24,
                transition: "all 0.3s ease-in-out",
              }}
              onClick={(e) => {
                if (isHideGuideOpenButton) {
                  setIsHideGuideOpenButton(false);
                  return;
                }
                handleGuideClick("top")(e);
              }}
            >
              {guideAnchorEl ? <CancelIcon /> : <InfoIcon />}
            </Fab>
          </Tooltip>
          <Fab
            size="small"
            color="inherit"
            sx={{
              position: "fixed",
              right: isHideGuideOpenButton ? -50 : 10,
              bottom: 74,
              width: 20,
              height: 20,
              fontSize: 10,
              minHeight: 0,
              backgroundColor: "white",
              color: "action.active",
              transition: "all 0.3s ease-in-out",
            }}
            onClick={() => setIsHideGuideOpenButton(true)}
          >
            <CancelOutlinedIcon />
          </Fab>
        </>
      )}
    </>
  );
}

export default Layout;
