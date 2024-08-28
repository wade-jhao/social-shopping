import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import style from "./LivePost.module.scss";
import {
  selectActivity,
  selectFansPage,
  getGroupPostsAsync,
  selectLiveVideo,
  getVideoAsync,
  getIgMediaAsync,
  selectIgMedia,
  selectIgMediaUrl,
  selectVideo,
  getLiveVideosAsync,
  selectPost,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import Skeleton from "@mui/material/Skeleton";
import TextPost from "./TextPost";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import LaunchIcon from "@mui/icons-material/Launch";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LiveroomIcon from "@assets/liveroom.svg";
import ReactPlayer from "react-player";
import IgStreamCountDown from "@components/IgStreamCountDown/IgStreamCountDown";
import useActivityPostIgCountDownTimeStorage from "@components/IgStreamCountDown/useActivityPostIgCountDownTimeStorage";
import DialogSetIgStreamCountDownTime from "@components/IgStreamCountDown/DialogSetIgStreamCountDownTime";
import { sendGaPageView } from "@utils/track";

interface PROPS {
  isVisible?: boolean;
  height?: number;
}

function LivePost(props: PROPS) {
  const { height = 0, isVisible = true } = props;
  const refIgMediaInterval = useRef<number | null>(null);
  const curFanPage = useAppSelector(selectFansPage);
  const curPost = useAppSelector(selectPost);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const curIgMedia = useAppSelector(selectIgMedia);
  const curIgMediaUrl = useAppSelector(selectIgMediaUrl);
  const curActivity = useAppSelector(selectActivity);
  const [igMediaSize, setIgMediaSize] = useState<number[]>([]);
  const dispatch = useAppDispatch();
  const videoBox = useRef<HTMLDivElement>(null);
  const videoBoxWidth = document.body.clientWidth;
  const [
    isDialogSetIgStreamCountDownTimeOpen,
    setIsDialogSetIgStreamCountDownTimeOpen,
  ] = useState(false);
  const { streamTimeStorage, setStreamTimeStorage } =
    useActivityPostIgCountDownTimeStorage();
  useEffect(() => {
    if (
      curIgMedia &&
      curIgMedia !== "not_live" &&
      (!streamTimeStorage || streamTimeStorage === "")
    ) {
      setIsDialogSetIgStreamCountDownTimeOpen(true);
    }
  }, [curIgMedia, streamTimeStorage]);
  useEffect(() => {
    if (curFanPage && curActivity) {
      // fetched by post id or live video id
      if (curActivity.dispatch?.platform === "facebook.page") {
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
            accessToken: curFanPage.access_token as string,
            groupId: curActivity?.dispatch?.fb_fanspage_id as string,
            postId: curActivity?.dispatch?.fb_post_id as string,
          })
        );
      } else {
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
    if (curActivity) {
      switch (curActivity.dispatch?.platform) {
        case "facebook.page":
          if (
            curVideo &&
            curVideo !== "not_found" &&
            curVideo?.live_status === "LIVE"
          ) {
            const title = `Facebook粉專直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        case "facebook.group":
          if (
            curLiveVideo &&
            curLiveVideo !== "not_found" &&
            curLiveVideo?.status === "LIVE"
          ) {
            const title = `Facebook社團直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        default:
          if (curIgMedia && curIgMedia !== "not_live") {
            const title = `Instagram直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
      }
    }
  }, [curActivity, curIgMedia, curLiveVideo, curVideo]);

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

  const renderFBVideo = () => {
    if (curPost?.error) {
      return null;
    }
    if (curLiveVideo === "not_found" || !curLiveVideo?.embed_html) {
      return null;
    }
    return (
      <Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 48,
            background: "#FFF4E5",
            mt: 1,
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
              直播
            </Button>
          </Link>
        </Box>
        {videoBox && (
          <ReactPlayer
            url={`https://www.facebook.com/video.php?v=${curLiveVideo.video.id}`}
            width={videoBoxWidth}
            height={"100%"}
            playing={true}
            muted={true}
            config={{
              facebook: {
                attributes: {
                  "data-allowfullscreen": true,
                  "data-autoplay": true,
                  "data-width": videoBoxWidth,
                },
              },
            }}
          />
        )}
      </Box>
    );
  };

  const renderFBPageVideo = () => {
    if (curPost?.error) {
      return null;
    }
    if (curVideo === "not_found" || !curVideo?.embed_html) {
      return null;
    }
    return (
      <>
        {videoBox && (
          <ReactPlayer
            url={`https://www.facebook.com/facebook/videos/${curVideo.id}`}
            width={videoBoxWidth}
            height="100%"
            muted={true}
            playing={true}
            config={{
              facebook: {
                attributes: {
                  "data-allowfullscreen": true,
                  "data-autoplay": true,
                  "data-width": videoBoxWidth,
                },
              },
            }}
          />
        )}
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
            paddingLeft: 1,
            paddingRight: 1,
          }}
        >
          <img style={{ marginTop: 26 }} src={LiveroomIcon}></img>
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
      <div
        style={{
          height: Math.floor(height / 2),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        className={
          igMediaSize[0] > igMediaSize[1]
            ? style.verticalContainer
            : style.horizontalContainer
        }
      >
        <img src={curIgMediaUrl || ""} style={{ height: "80%" }}></img>
      </div>
    );
  };

  return (
    <div ref={videoBox}>
      {(curIgMedia || curLiveVideo || curVideo) && (
        <Box
          className={style.videoContainer}
          sx={{
            display: isVisible ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            flexDirection: "column",
            background: "#f0f2f5",
            minHeight: Math.floor(height / 2),
          }}
        >
          {curActivity?.dispatch?.platform === "facebook.group" &&
            curLiveVideo &&
            renderFBVideo()}
          {curActivity?.dispatch?.platform === "facebook.page" &&
            curVideo &&
            renderFBPageVideo()}
          {curActivity?.dispatch?.platform === "instagram" && curIgMedia && (
            <Box
              sx={{
                display: isVisible ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                background: "#000",
                width: "100%",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: curIgMedia === "not_live" ? "none" : "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  minHeight: 48,
                  background: "#FFF4E5",
                  padding: 1,
                  position: "relative",
                }}
              >
                <WarningAmberIcon color="warning" sx={{ ml: 1, mr: 1 }} />
                <Typography color="#663C00" variant="body2">
                  由於Instagram的限制，您無法在此觀看即時直播畫面、回覆留言。
                </Typography>
                <Link
                  href={`https://www.instagram.com/${curFanPage?.name}/live/`}
                  target="_blank"
                >
                  <Button
                    color="warning"
                    variant="outlined"
                    endIcon={<LaunchIcon />}
                    size="small"
                  >
                    直播
                  </Button>
                </Link>
              </Box>
              {curIgMedia && streamTimeStorage && streamTimeStorage !== "" && (
                <Box
                  sx={{
                    textAlign: "center",
                    flex: "1 1 100%",
                    background: "#fff",
                    width: "100%",
                    py: 1,
                  }}
                >
                  <IgStreamCountDown />
                </Box>
              )}

              {renderIGVideo()}
            </Box>
          )}
          {curActivity?.dispatch?.platform !== "instagram" && <TextPost />}
        </Box>
      )}
      {((!curLiveVideo &&
        curActivity?.dispatch?.platform === "instagram" &&
        !curIgMedia) ||
        (curActivity?.dispatch?.platform === "facebook.group" &&
          !curLiveVideo) ||
        (curActivity?.dispatch?.platform === "facebook.page" && !curVideo)) && (
        <Box sx={{ width: "100%" }}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={Math.floor(height / 2)}
            sx={{ mt: 1, mb: 1 }}
          />
        </Box>
      )}
      <DialogSetIgStreamCountDownTime
        open={isDialogSetIgStreamCountDownTimeOpen}
        setOpen={setIsDialogSetIgStreamCountDownTimeOpen}
        onSetCountdownTime={() => {
          setIsDialogSetIgStreamCountDownTimeOpen(false);
        }}
        confirmButtonText="下一步"
        streamTimeStorage={streamTimeStorage}
        setStreamTimeStorage={setStreamTimeStorage}
      />
    </div>
  );
}

export default LivePost;
