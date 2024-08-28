import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// import useMediaQuery from "@mui/material/useMediaQuery";
import LiveRoomLoading from "@assets/liveroom-loading-01.svg";
import ExpiredToken from "@assets/expired-token.svg";
import Layout from "@components/Layout";
import List from "@mui/material/List";
import { Button, CircularProgress, Divider } from "@mui/material";
import useCheckIsReadyToStartLive from "@components/NotPreparedRemind/useCheckIsReadyToStartLive";
import { selectApis } from "@store/apiSlice";
import { useEffect, useState } from "react";
import { getUrls } from "@pages/AccessTokenExpired/apis/legacy";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Link from "@mui/material/Link";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { selectIsPrepared, setIsPrepared } from "@store/liveroomSlice";
// import { checkIsLogin } from "@utils/login";
interface PROPS {
  children: JSX.Element;
}

function NotPreparedRemind(props: PROPS) {
  // const isLogin = checkIsLogin();
  const { children } = props;
  const apis = useAppSelector(selectApis);
  const isPrepared = useAppSelector(selectIsPrepared);
  const { isReadyToStartLive, readyStartLiveCheckList } =
    useCheckIsReadyToStartLive();
  const dispatch = useAppDispatch();
  const [platformsUrl, setPlatformsUrl] = useState("");
  useEffect(() => {
    if (!apis) {
      return;
    }
    getUrls(apis?.urls as string).then((res: any) => {
      setPlatformsUrl(res.platforms);
    });
  }, [apis]);

  // const matches = useMediaQuery("(min-width:600px)");

  const isCheckListReady = Object.values(readyStartLiveCheckList).every(
    (value) => value !== null
  );

  const checkListData = [
    {
      display: true,
      isReady:
        (readyStartLiveCheckList.settingSchedulerStatus &&
          readyStartLiveCheckList.settingFacebookLoginStatus) ||
        null,
      title: "擁有直播購物功能權限",
      content:
        "如果此設定尚未完成，請向您的業務單位確認有開啟直播購物功能權限。",
    },
    {
      display: true,
      isReady: readyStartLiveCheckList.isBindAnyOfSocialAccounts,
      title: "綁定外部網站",
      content: (
        <>
          請至少在矽羽後台綁定一個外部網站。前往教學
          <Link
            href="https://ebooks.sfec.cc/faq/fb+1/facebook-+1-she-ding/ru-he-xin-zeng-jia-yi-shang-pin"
            target="_blank"
            rel="noreferrer"
          >
            綁定外部網站
          </Link>
          。
        </>
      ),
      callToActionBtn: {
        content: "前往矽羽後台",
        onClick: () => {
          window.location.href = platformsUrl;
        },
      },
    },
    {
      display: readyStartLiveCheckList.isBindAnyOfSocialAccounts,
      isReady: readyStartLiveCheckList.isAllOfSocialAccountsTokenValid,
      title: "更新所有外部網站授權",
      content:
        "您的社群帳號授權已過期，請前往矽羽後台點擊「重新取得授權」。請確保沒有任何的授權更新的提示框，才可繼續使用直播購物功能。",
      callToActionBtn: {
        content: "前往矽羽後台",
        onClick: () => {
          window.location.href = platformsUrl.replace(
            "external_website",
            "plusone"
          );
        },
      },
    },
    {
      display:
        readyStartLiveCheckList.isBindAnyOfSocialAccounts &&
        readyStartLiveCheckList.isSocialAccountHasIgAccount,
      isReady: readyStartLiveCheckList.isAllOfIgAccountConversationAuthValid,
      title: "開啟所有IG商業帳號「允許使用訊息功能」",
      content: (
        <>
          請在 Instagram 上開啟「
          <Link
            href="https://www.facebook.com/help/instagram/791161338412168?cms_platform=www&helpref=platform_switcher"
            target="_blank"
            rel="noreferrer"
          >
            允許使用訊息功能
          </Link>
          」，系統才能發送訊息到消費者的小盒子。如果您已開啟，請
          <Link href="../">重新整理</Link>此頁面。
        </>
      ),
    },
  ];
  // if (isPrepared || isReadyToStartLive || !isLogin) {
  if (isPrepared || isReadyToStartLive) {
    return children;
  }
  if (!isCheckListReady) {
    return (
      <Layout includeLayout={false}>
        <Container
          id="live-room-container-id"
          disableGutters
          maxWidth="sm"
          sx={{
            // py: 5,
            width: "100%",
            // pt: 4,
            // pb: 4,
            // pl: matches ? 15 : 4,
            // pr: matches ? 15 : 4,
            // pb: 5,
            paddingLeft: "16px",
            paddingRight: "16px",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <img
            style={{ width: "100%", height: "auto" }}
            src={LiveRoomLoading}
          ></img>

          <Typography
            variant="body1"
            sx={{
              mt: 4,
              textAlign: "center",
            }}
          >
            直播主控台內建預設商品曝光模板，一鍵展示商品資訊及喊單範例，讓消費者更懂得如何參與喊單。
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: 2,
              mt: "auto",
              flexWrap: "wrap",
              marginBottom: 2,
              flexDirection: "column",
            }}
          >
            <CircularProgress />
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                textAlign: "center",
              }}
            >
              正在設置直播主控台
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }
  return (
    <Layout includeLayout={false}>
      <Container
        id="live-room-container-id"
        disableGutters
        maxWidth="md"
        sx={{
          background: "#fff",
          // mt: 3,
          // pt: 4,
          // pb: 4,
          // pl: matches ? 15 : 4,
          // pr: matches ? 15 : 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            background: "#fff",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mr: 1,
            ml: 1,
          }}
        >
          <img style={{ width: 200 }} src={ExpiredToken}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            尚未完成直播設定
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)", textAlign: "center" }}
          >
            請完成以下設定，才可繼續使用直播主控台。
          </Typography>
          <List
            sx={{
              mt: 2,
              width: "100%",
              maxWidth: 500,
              bgcolor: "background.paper",
            }}
          >
            {isCheckListReady &&
              checkListData
                .filter((i) => !(!i.display || i.isReady))
                .map((item, index, checkList) => {
                  return (
                    <Box key={index}>
                      <Accordion defaultExpanded={!item.isReady}>
                        <AccordionSummary
                          disabled={true}
                          sx={{ opacity: "1!important" }}
                          expandIcon={
                            !item.isReady ? (
                              <CancelOutlinedIcon
                                sx={{
                                  color: "warning.main",
                                  transform: "rotate(180deg)",
                                }}
                              />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )
                          }
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography>
                            {index + 1}. {item.title}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(0, 0, 0, 0.60)",
                            }}
                          >
                            {item.content}
                          </Typography>
                          {item.callToActionBtn && (
                            <Button
                              sx={{ mt: 2 }}
                              variant={"contained"}
                              onClick={item.callToActionBtn?.onClick}
                            >
                              {item.callToActionBtn?.content}
                            </Button>
                          )}
                        </AccordionDetails>
                      </Accordion>
                      {index !== checkList.length - 1 && (
                        <Divider
                          variant="inset"
                          component="li"
                          sx={{ ml: 0 }}
                        />
                      )}
                    </Box>
                  );
                })}
          </List>
          {isCheckListReady && (
            <Box sx={{ textAlign: "center", pt: 1, pb: 1 }}>
              <Button
                color="primary"
                variant="text"
                onClick={() => dispatch(setIsPrepared(true))}
              >
                堅持繼續使用
              </Button>
              <Typography variant="body2" color={"#ED6C02"}>
                溫馨提醒：繼續使用可能導致商品無法被系統加入購物車。
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Layout>
  );
}

export default NotPreparedRemind;
