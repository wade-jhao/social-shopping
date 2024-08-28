import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import FacebookIcon from "@mui/icons-material/Facebook";
import Divider from "@mui/material/Divider";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
import {
  getActivityAsync,
  selectActivity,
  selectActivityPosts,
  selectIgMedia,
  selectPost,
  selectLiveVideo,
  selectFansPage,
  selectVideo,
  selectLiveVideos,
  updateFbLiveStreamingStatus,
} from "@store/liveroomSlice";
import { setIsFullscreen } from "@store/commonSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import instgram from "@assets/instgram.png";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Skeleton from "@mui/material/Skeleton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SwitchPostDialog from "./SwitchPostDialog";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Tooltip from "@mui/material/Tooltip";
// import { selectUserInfo } from "@store/userSlice";
import { setNotice } from "@store/commonSlice";
// import Avatar from "@mui/material/Avatar";
import { finishedLiveVideo } from "../apis/facebook";

function Activity() {
  let { activityId, postId } = useParams();
  // const userInfo = useAppSelector(selectUserInfo);
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  // const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const curFanPage = useAppSelector(selectFansPage);
  const liveVideos = useAppSelector(selectLiveVideos);
  const curActivityPosts = useAppSelector(selectActivityPosts);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStopingLive, setIsStopingLive] = useState<boolean>(false);
  const apis = useAppSelector(selectApis);
  const activity = useAppSelector(selectActivity);
  const liveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const curPost = useAppSelector(selectPost);
  const igMedia = useAppSelector(selectIgMedia);

  const onFullscreenChange = (event: any) => {
    if (document.fullscreenElement) {
      dispatch(setIsFullscreen(true));
    } else {
      dispatch(setIsFullscreen(false));
    }
  };

  useEffect(() => {
    dispatch(
      getActivityAsync({
        urlActivity: apis?.activity as string,
        urlDispatch: apis?.post as string,
        activityId: activityId as string,
        postId: postId as string,
      })
    );

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const getplatformIcon = () => {
    if (!activity) {
      return null;
    }
    if (activity.dispatch?.platform.includes("facebook")) {
      return (
        <FacebookIcon sx={{ cursor: "pointer", color: "rgb(25, 118, 210)" }} />
      );
    } else {
      return <img src={instgram} style={{ height: 24 }} alt="instagram" />;
    }
  };

  const requestFullScreen = () => {
    if (!document.fullscreenElement) {
      let curPage = document.documentElement;
      if (curPage) {
        curPage.requestFullscreen({ navigationUI: "show" });
      }
    } else {
      document.exitFullscreen();
    }
  };

  const getPostTitle = () => {
    if (activity?.dispatch?.platform === "instagram") {
      return igMedia === "not_live"
        ? "結束直播"
        : `${activity?.dispatch?.platform_name}的直播`;
    } else if (activity?.dispatch?.platform === "facebook.group") {
      return liveVideo && liveVideo !== "not_found"
        ? liveVideo?.video?.title || liveVideo?.video?.description
        : curPost?.message;
    } else {
      return curVideo && curVideo !== "not_found"
        ? curVideo?.title || curVideo?.description
        : curPost?.message;
    }
  };

  const getplatformName = () => {
    if (!activity) {
      return null;
    }
    if (activity?.dispatch?.platform === "facebook.page") {
      return "粉絲專頁";
    } else if (activity?.dispatch?.platform === "facebook.group") {
      return "社團";
    } else {
      return "Instagram";
    }
  };

  const isSupportFinishdLiveVideo = () => {
    if (!activity) {
      return false;
    }
    if (
      activity?.dispatch?.platform === "facebook.page" &&
      curVideo !== "not_found" &&
      curVideo
    ) {
      return curVideo.live_status === "LIVE";
    }

    if (
      activity?.dispatch?.platform === "facebook.group" &&
      liveVideo !== "not_found" &&
      liveVideo
    ) {
      return liveVideo.status === "LIVE";
    }
    return false;
  };

  const onFinishedLiveVideo = async () => {
    if (
      curFanPage &&
      activity &&
      activity.dispatch?.platform === "facebook.page" &&
      curVideo &&
      curVideo !== "not_found"
    ) {
      const actions: any[] = [];
      let isError = false;
      liveVideos?.forEach((video) =>
        actions.push(
          finishedLiveVideo(
            curFanPage.access_token,
            video.id,
            (res: { id: string }) => {
              if (!res?.id) {
                isError = true;
              }
            }
          )
        )
      );
      if (actions.length) {
        setIsRequesting(true);
        await Promise.all(actions);
        if (!isError) {
          dispatch(
            setNotice({
              isErroring: true,
              message: "結束直播成功",
              type: "success",
            })
          );
          dispatch(updateFbLiveStreamingStatus("facebook.page"));
        } else {
          setNotice({
            isErroring: true,
            message: "結束直播失敗，請稍後再試",
            type: "error",
          });
        }
        setIsStopingLive(false);
        setIsRequesting(false);
      }
    }

    if (
      activity &&
      activity.dispatch?.platform === "facebook.group" &&
      liveVideo &&
      liveVideo !== "not_found"
    ) {
      setIsRequesting(true);
      finishedLiveVideo(
        curFanPage?.access_token as string,
        liveVideo.id,
        (res: any) => {
          if (res?.id) {
            dispatch(
              setNotice({
                isErroring: true,
                message: "結束直播成功",
                type: "success",
              })
            );
            dispatch(updateFbLiveStreamingStatus("facebook.group"));
          } else {
            setNotice({
              isErroring: true,
              message: "結束直播失敗，請稍後再試",
              type: "error",
            });
            setIsRequesting(false);
          }
        }
      );
    }
  };

  return (
    <>
      {activity && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 48,
            background: "#fff",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              left: "24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: 2,
              }}
            >
              <Box sx={{ display: "box", maxWidth: 200 }}>
                <Typography
                  color="rgba(0, 0, 0, 0.6)"
                  variant="subtitle1"
                  sx={{
                    alignItems: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {getPostTitle()}
                </Typography>
              </Box>
              <ExpandMoreIcon sx={{ width: 16 }} />
            </Box>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1}
              sx={{ display: "flex", alignItems: "center" }}
            >
              {(igMedia || liveVideo || curVideo) && (
                <Chip
                  label={
                    (igMedia && igMedia !== "not_live") ||
                    (liveVideo !== "not_found" &&
                      liveVideo?.status === "LIVE") ||
                    (curVideo !== "not_found" &&
                      curVideo?.live_status === "LIVE")
                      ? "直播中"
                      : "直播結束"
                  }
                  color={
                    (igMedia && igMedia !== "not_live") ||
                    (liveVideo !== "not_found" &&
                      liveVideo?.status === "LIVE") ||
                    (curVideo !== "not_found" &&
                      curVideo?.live_status === "LIVE")
                      ? "error"
                      : "default"
                  }
                  size="small"
                  sx={{ opacity: 0.8 }}
                />
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  ("");
                }}
              >
                {getplatformIcon()}
                {activity && (
                  <Typography sx={{ ml: 1 }} variant="body2">
                    {getplatformName()}
                  </Typography>
                )}
              </Box>
              {isSupportFinishdLiveVideo() && (
                <Button
                  disabled={isRequesting}
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStopingLive(true);
                  }}
                  sx={{ textAlign: "center", ml: 1 }}
                >
                  結束直播
                </Button>
              )}
            </Stack>
          </Box>
          <Typography
            color="rgba(0, 0, 0, 0.6)"
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            活動：{activity?.title}
          </Typography>

          <Box
            sx={{
              flexGrow: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              right: "24px",
            }}
          >
            <Tooltip title="全螢幕" placement="bottom" arrow>
              <IconButton onClick={() => requestFullScreen()}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      {!activity && (
        <Skeleton
          animation="wave"
          variant="rectangular"
          height={26}
          sx={{ mt: 1, mb: 1 }}
        />
      )}
      <SwitchPostDialog
        isVisible={isSwitchingPost}
        activityPosts={curActivityPosts}
        onCancel={() => setIsSwitchingPost(false)}
      />
      <Dialog
        open={isStopingLive}
        onClose={() => setIsStopingLive(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">結束直播</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ display: "flex" }}
          >
            <Typography>請確定您是否要結束Facebook直播?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStopingLive(false)}>取消</Button>
          <LoadingButton
            loading={isRequesting}
            onClick={() => {
              onFinishedLiveVideo();
            }}
            autoFocus
            variant="contained"
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Activity;
