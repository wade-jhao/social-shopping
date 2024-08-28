import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
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
  selectVideo,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import Skeleton from "@mui/material/Skeleton";
import SwitchPostDialog from "./SwitchPostDialog";

import instgram from "@assets/instgram.png";
import FacebookIcon from "@mui/icons-material/Facebook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import { getQueryParam } from "@utils/common";

interface PROPS {
  channel: string;
  onSwitchChannel: Function;
}
function Activity(props: PROPS) {
  const { channel } = props;
  let { activityId, postId } = useParams();
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const dispatch = useAppDispatch();
  const curActivityPosts = useAppSelector(selectActivityPosts);
  const apis = useAppSelector(selectApis);
  const activity = useAppSelector(selectActivity);
  const liveVideo = useAppSelector(selectLiveVideo);
  const video = useAppSelector(selectVideo);
  const curPost = useAppSelector(selectPost);
  const igMedia = useAppSelector(selectIgMedia);

  useEffect(() => {
    dispatch(
      getActivityAsync({
        urlActivity: apis?.activity as string,
        urlDispatch: apis?.post as string,
        activityId: activityId as string,
        postId: postId as string,
      })
    );
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

  const getPostTitle = () => {
    if (activity?.dispatch?.platform === "instagram") {
      return igMedia === "not_live"
        ? "結束直播"
        : `${activity?.dispatch?.platform_name}的直播`;
    } else if (activity?.dispatch?.platform === "facebook.page") {
      return video && video !== "not_found"
        ? video?.title || video?.description
        : curPost?.message;
    } else {
      return liveVideo && liveVideo !== "not_found"
        ? liveVideo?.video?.title || liveVideo?.video?.description
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

  return (
    <>
      {activity && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            minHeight: 48,
            background: "#fff",
            position: "relative",
            pr: 1,
            border: "1px solid rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Box>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    background: "#fff",
                    width: "48px",
                    height: "48px",
                    borderRight: "1px solid rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                  }}
                >
                  <IconButton
                    sx={{
                      display: "flex",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                    }}
                    component="a"
                    edge="end"
                    aria-label="back"
                    href={`/liveroom/activities/${activityId}?api=${
                      window.sessionStorage.getItem("api") ||
                      getQueryParam("api")
                    }`}
                  >
                    <ArrowBackIcon sx={{ width: 18 }} />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ display: "flex", maxWidth: 150 }}>
                  <Typography
                    color="rgba(0, 0, 0, 0.6)"
                    variant="subtitle1"
                    sx={{
                      alignItems: "center",
                      ml: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {getPostTitle()}
                  </Typography>
                  <ExpandMoreIcon sx={{ width: 16 }} />
                </Box>
              </Box>
            </Box>
            <Stack
              sx={{
                display: "flex",
                alignItems: "center",
              }}
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1}
            >
              {(igMedia || liveVideo || video) && (
                <Chip
                  label={
                    (igMedia && igMedia !== "not_live") ||
                    (video !== "not_found" && video?.live_status === "LIVE") ||
                    (liveVideo !== "not_found" && liveVideo?.status === "LIVE")
                      ? "直播中"
                      : "直播結束"
                  }
                  color={
                    (igMedia && igMedia !== "not_live") ||
                    (video !== "not_found" && video?.live_status === "LIVE") ||
                    (liveVideo !== "not_found" && liveVideo?.status === "LIVE")
                      ? "error"
                      : "default"
                  }
                  size="small"
                  sx={{ opacity: 0.8 }}
                />
              )}
              {channel !== "" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {getplatformIcon()}
                  {activity && (
                    <Typography sx={{ ml: 1 }} variant="body2">
                      {getplatformName()}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
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
    </>
  );
}

export default Activity;
