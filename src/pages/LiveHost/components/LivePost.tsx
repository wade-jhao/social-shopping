import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import style from "./LivePost.module.scss";
import {
  selectActivity,
  selectFansPage,
  getGroupPostsAsync,
  selectLiveVideo,
  getIgMediaAsync,
  selectIgMedia,
  selectIgMediaUrl,
  getVideoAsync,
  selectVideo,
  getLiveVideosAsync,
  selectPost,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LaunchIcon from "@mui/icons-material/Launch";
import Button from "@mui/material/Button";
import LiveroomIcon from "@assets/liveroom.svg";
import Link from "@mui/material/Link";
import ReactPlayer from "react-player";

interface PROPS {
  isVisible: boolean;
  height: number;
}

function LivePost(props: PROPS) {
  const { height = 0, isVisible } = props;
  const refIgMediaInterval = useRef<number | null>(null);
  const curFanPage = useAppSelector(selectFansPage);
  const curPost = useAppSelector(selectPost);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const curActivity = useAppSelector(selectActivity);
  const curIgMedia = useAppSelector(selectIgMedia);
  const curIgMediaUrl = useAppSelector(selectIgMediaUrl);
  const dispatch = useAppDispatch();
  const [igMediaSize, setIgMediaSize] = useState<number[]>([]);
  const videoBox = useRef<HTMLDivElement>(null);
  const videoBoxWidth = videoBox.current?.clientWidth || 0;
  const windowHeight = window.innerHeight;

  const [videoElementSize, setVideoElementSize] = useState<
    undefined | { width: number; height: number }
  >();
  const aspectRatio = 16 / 9;
  const maxWidthFitWindowHalfHeight = (windowHeight - 48 - 48) / aspectRatio;
  const videoFrameWidth = Math.min(
    Math.floor(videoBoxWidth || 0),
    Math.floor(maxWidthFitWindowHalfHeight)
  );
  const videoFrameScale = videoFrameWidth > 220 ? 1 : videoFrameWidth / 220;

  useEffect(() => {
    if (curFanPage && curActivity) {
      // fetched by post id or live video id
      if (curActivity.dispatch?.platform === "facebook.page") {
        // const postId = curActivity.dispatch?.fb_post_id.split("_")[1];
        const postId = curActivity.dispatch?.fb_post_id;
        if (postId) {
          dispatch(getVideoAsync({ fanPage: curFanPage, postId: postId }));
          dispatch(getLiveVideosAsync({ fanPage: curFanPage, postId: postId }));
        }
      } else if (
        curActivity &&
        curActivity?.dispatch?.platform === "facebook.group"
      ) {
        dispatch(
          getGroupPostsAsync({
            accessToken: curFanPage.access_token,
            groupId: curActivity?.dispatch?.fb_fanspage_id as string,
            postId: curActivity?.dispatch?.fb_post_id as string,
          })
        );
      } else {
        dispatch(
          getIgMediaAsync({
            accessToken: curFanPage.access_token,
            postId: curActivity.dispatch?.fb_post_id as string,
          })
        );
        refIgMediaInterval.current = window.setInterval(() => {
          dispatch(
            getIgMediaAsync({
              accessToken: curFanPage.access_token,
              postId: curActivity.dispatch?.fb_post_id as string,
            })
          );
        }, 4000);
      }
    }

    return () => {
      if (refIgMediaInterval.current) {
        window.clearInterval(refIgMediaInterval.current);
      }
    };
  }, [curFanPage, curActivity]);

  useEffect(() => {
    if (curIgMedia !== "not_live" && curIgMedia?.media_type === "BROADCAST") {
      getIgMediaSize(curIgMediaUrl || "", (res: any) => {
        setIgMediaSize(res);
      });
    }
    if (curIgMedia === "not_live") {
      if (refIgMediaInterval.current) {
        window.clearInterval(refIgMediaInterval.current);
      }
    }
  }, [curIgMedia]);
  const getIgMediaSize = async (url: string, onSuccess: Function) => {
    if (!url) {
      return [];
    }
    let img = new Image();
    const action = new Promise((resolve) => {
      img.addEventListener("load", function () {
        resolve([this.height, this.width]);
      });
      img.src = url;
    });
    await action
      .then((res) => {
        onSuccess(res);
      })
      .finally(() => {
        img.removeEventListener("load", function () {});
      });
  };

  const renderFBVideo = () => {
    if (curPost?.error) {
      return null;
    }
    if (
      curLiveVideo === "not_found" ||
      !curLiveVideo?.embed_html ||
      !videoBox
    ) {
      return null;
    }
    return (
      <>
        <ReactPlayer
          url={`https://www.facebook.com/video.php?v=${curLiveVideo.video.id}`}
          width={videoElementSize?.width || videoFrameWidth}
          height={videoElementSize?.height || height}
          playing={true}
          muted={true}
          config={{
            facebook: {
              attributes: {
                "data-allowfullscreen": true,
                "data-autoplay": true,
                "data-width": videoFrameWidth,
                style: {
                  transform: `scale(${videoFrameScale})`,
                  "transform-origin": "top left",
                },
              },
            },
          }}
          onReady={() => {
            setVideoElementSize({ width: videoFrameWidth, height: height });
          }}
        />
      </>
    );
  };
  const renderFBPageVideo = () => {
    if (curPost?.error) {
      return null;
    }
    if (curVideo === "not_found" || !curVideo?.embed_html || !videoBox) {
      return null;
    }
    return (
      <>
        <ReactPlayer
          url={`https://www.facebook.com/facebook/videos/${curVideo.id}`}
          width={videoElementSize?.width || videoFrameWidth}
          height={videoElementSize?.height || height}
          playing={true}
          muted={true}
          config={{
            facebook: {
              attributes: {
                "data-allowfullscreen": true,
                "data-autoplay": true,
                "data-width": videoFrameWidth,
                style: {
                  transform: `scale(${videoFrameScale})`,
                  "transform-origin": "top left",
                },
              },
            },
          }}
          onReady={() => {
            setVideoElementSize({ width: videoFrameWidth, height: height });
          }}
        />
      </>
    );
  };

  const renderIGVideo = () => {
    if (!curIgMedia) {
      return null;
    }
    if (curIgMedia === "not_live") {
      return (
        <Box
          sx={{
            height: height,
            width: "100%",
            textAlign: "center",
          }}
        >
          <img style={{ marginTop: 64 }} src={LiveroomIcon}></img>
          <Typography variant="h6" sx={{ color: "#fff" }}>
            直播已結束
          </Typography>
          <Typography sx={{ color: "#fff", mt: 1 }} variant="body2">
            Instagram 貼文已自動被刪除，故無法查看當時的直播畫面。
          </Typography>
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 1,
        }}
        className={
          igMediaSize[0] > igMediaSize[1]
            ? style.verticalContainer
            : style.horizontalContainer
        }
      >
        <img src={curIgMediaUrl || ""} style={{ height: "100%" }}></img>
      </Box>
    );
  };

  return (
    <div ref={videoBox}>
      {curActivity?.dispatch?.platform === "facebook.group" &&
        curLiveVideo &&
        curLiveVideo !== "not_found" && (
          <Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "left",
                alignItems: "center",
                minHeight: 48,
                background: "#FFF4E5",
                mb: 1,
                padding: 1,
              }}
            >
              <WarningAmberIcon color="warning" sx={{ ml: 1, mr: 1 }} />
              <Typography color="#663C00" variant="body2">
                由於Facebook粉絲團的限制，您可能無法在此觀看即時直播畫面、回覆留言。
              </Typography>
              <Link
                href={`https://www.facebook.com/${curLiveVideo?.id}/videos/${curLiveVideo?.video?.id}/?idorvanity=${curActivity?.dispatch?.fb_fanspage_id}`}
                target="_blank"
                sx={{ flex: "1 0 auto" }}
              >
                <Button
                  color="warning"
                  variant="outlined"
                  endIcon={<LaunchIcon />}
                  size="small"
                >
                  前往直播
                </Button>
              </Link>
            </Box>
            <Box
              className={style.videoContainer}
              sx={{
                display: isVisible ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                background: "#000",
                position: "relative",
              }}
            >
              {renderFBVideo()}
            </Box>
          </Box>
        )}
      {curActivity?.dispatch?.platform.includes("facebook.page") &&
        curVideo && (
          <Box
            className={style.videoContainer}
            sx={{
              display: isVisible ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              background: "#000",
              height: height,
            }}
          >
            {renderFBPageVideo()}
          </Box>
        )}
      {curActivity?.dispatch?.platform === "instagram" && curIgMedia && (
        <Box>
          <Box
            className={style.videoContainer}
            sx={{
              display: isVisible ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              height: height,
              background: "#000",
              flexDirection: "column",
            }}
          >
            {renderIGVideo()}
          </Box>
        </Box>
      )}
      {((curActivity?.dispatch?.platform === "instagram" && !curIgMedia) ||
        (curActivity?.dispatch?.platform === "facebook.group" &&
          !curLiveVideo) ||
        (curActivity?.dispatch?.platform === "facebook.page" && !curVideo)) && (
        <Box sx={{ width: "100%" }}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={height}
            sx={{ mt: 1, mb: 1 }}
          />
        </Box>
      )}
    </div>
  );
}

export default LivePost;