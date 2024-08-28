import { useEffect, useState } from "react";
import { getLongTermAccessToken } from "./apis/facebook";
import Cookies from "js-cookie";
import { checkIsLogin, getQueryParam } from "@utils/index";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import LoadingButton from "@mui/lab/LoadingButton";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Copyright from "@components/Copyright";
import { useAppDispatch } from "@store/hooks";
import { setNotice } from "@store/commonSlice";
import { ReactComponent as FacebookIcon } from "@assets/facebook.svg";
import sysfeatherIcon from "@assets/new-sysfeather.png";
import style from "./index.module.scss";
import { sendGaPageView } from "@utils/track";
import { gerUserInfoAsync } from "@store/userSlice";

interface FB_LOGIN_RESPONSE {
  status: "connected" | "not_authorized" | "unknown";
  authResponse: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLogining, setIsLogining] = useState<boolean>(false);
  useEffect(() => {
    if (checkIsLogin()) {
      redirectToContentPage();
    }
    sendGaPageView("Login");
  }, []);

  const redirectToContentPage = () => {
    const fromPath = getQueryParam("from");
    if (fromPath) {
      window.location.href = fromPath;
    } else {
      navigate("/home");
    }
  };

  const getLoginDetail = (response: FB_LOGIN_RESPONSE) => {
    if (response.status === "connected") {
      const { accessToken, userID } = response.authResponse;
      window.localStorage.setItem("user_id", userID);
      const userInfoAction = dispatch(
        gerUserInfoAsync({
          accessToken: accessToken,
          userId: userID,
        })
      );
      const tokenAction = getLongTermAccessToken(
        accessToken,
        process.env.REACT_APP_FB_APP_ID as string,
        process.env.REACT_APP_FB_APP_SECRET as string,
        (res: any) => {
          Cookies.set("fb_access_token", res.access_token, {
            sameSite: "None",
            secure: true,
            path: "/",
          });
        }
      );
      Promise.all([userInfoAction, tokenAction]).then(() => {
        redirectToContentPage();
        setIsLogining(false);
      });
    }
  };

  const loginFromFb = async () => {
    let isConnected = false;
    await FB.getLoginStatus(async (response: FB_LOGIN_RESPONSE) => {
      if (response.status === "connected") {
        setIsLogining(true);
        getLoginDetail(response);
        isConnected = true;
      }
    });

    if (!isConnected) {
      setIsLogining(true);
      await FB.login(
        function (response: FB_LOGIN_RESPONSE) {
          getLoginDetail(response);
          if (response.status === "connected") {
            getLoginDetail(response);
          } else {
            dispatch(
              setNotice({
                isErroring: true,
                message: "Facebook登入失敗，請重新嘗試",
                type: "error",
              })
            );
            setIsLogining(false);
          }
        },
        {
          scope:
            "business_management,public_profile,email,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_posts,pages_manage_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_comments,instagram_manage_messages,publish_video,publish_to_groups,groups_access_member_info",
        }
      );
    }
  };

  return (
    <div className={style.login}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#f0f2f5",
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{ m: 1, bgcolor: "#fff" }}
            src={sysfeatherIcon}
            alt="矽羽直播主控台"
          />
          <Typography component="h1" variant="h5">
            矽羽直播主控台
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            粉專/社團直播+1的賣家有福了，串接Facebook粉絲專頁/社團或Instgram貼文或直播的+1留言，自動匯入官網購物車做結帳，矽羽直播主控台是您Facebook,Instgram社群購物+1的最佳助手。
          </Typography>
        </Box>
        <Card
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ mt: 1, borderRadius: "10", padding: "20px" }}>
            <LoadingButton
              type="submit"
              fullWidth
              loading={isLogining}
              variant="contained"
              loadingIndicator="登入中…"
              startIcon={<FacebookIcon />}
              onClick={() => loginFromFb()}
            >
              <span>使用 Facebook 帳號登入</span>
            </LoadingButton>
            <Grid>
              <Grid item>
                <Link
                  href="https://www.facebook.com/signup"
                  variant="body2"
                  target="_"
                >
                  {"還沒有帳號嗎? 註冊?"}
                </Link>
              </Grid>
            </Grid>
            <div className={style.terms}>
              我們不會在FACEBOOK上發佈任何訊息，
              <br />
              開通帳號表示您同意矽羽直播主控台
              <Link
                href="https://gag.sysfeather.com/site/policy?fbclid=IwAR37VVsO3WTCZaudLKahBDuJH7Zg67A9zxQPLRtxlCoIWiJanRGrrROjYTM"
                variant="body2"
                target="_"
              >
                服務條款
              </Link>
              和
              <Link
                href="https://gag.sysfeather.com/site/policy?fbclid=IwAR11pYn99dNWX_TkqpVJO9ifYZqHKxZ5XI-CtzIFRfKhHgGbch9-eyxNps4"
                variant="body2"
                target="_"
              >
                隱私政策
              </Link>
            </div>
          </Box>
          <Copyright
            link="https://www.sysfeather.com/"
            title="矽羽智慧電商"
            sx={{ mt: 8, mb: 4 }}
          />
        </Card>
      </Container>
    </div>
  );
}

export default Login;
