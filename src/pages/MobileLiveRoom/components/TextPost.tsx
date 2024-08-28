import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import SwitchPostDialog from "./SwitchPostDialog";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogContentText from "@mui/material/DialogContentText";
import Divider from "@mui/material/Divider";
import {
  selectFansPage,
  selectPost,
  getPostAsync,
  selectActivity,
  selectLiveVideo,
  selectVideo,
  selectActivityPosts,
  selectLiveVideos,
  updateFbLiveStreamingStatus,
  updateLiveVideoDescriptionAsync,
  updateVideoDescriptionAsync,
} from "@store/liveroomSlice";
import { setNotice } from "@store/commonSlice";
import { LIVE_VIDEO, VIDEO, finishedLiveVideo } from "../apis/facebook";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import useLiveLink from "@hooks/useLiveLink";
import CopyLiveLinkButton from "@pages/LiveRoom/components/CopyLiveLinkButton";
import { Grid, TextField } from "@mui/material";
import { useStreamStatus } from "@hooks/streamStatus";

interface PROPS {
  isvisible?: boolean;
  height?: number;
}

function TextPost(props: PROPS) {
  const curActivityPosts = useAppSelector(selectActivityPosts);
  const liveVideos = useAppSelector(selectLiveVideos);
  const { isvisible = true } = props;
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const dispatch = useAppDispatch();
  const curFanPage = useAppSelector(selectFansPage);
  const curPost = useAppSelector(selectPost);
  const curActivity = useAppSelector(selectActivity);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStopingLive, setIsStopingLive] = useState<boolean>(false);
  const liveLink = useLiveLink();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingText, setEditingText] = useState("");
  const { IS_STREAMING, IS_STREAM_ENDED } = useStreamStatus();
  useEffect(() => {
    if (curFanPage && curActivity && curLiveVideo) {
      if (curLiveVideo === "not_found") {
        const postId = curActivity.dispatch?.fb_post_id as string;
        dispatch(
          getPostAsync({
            postId: postId,
            accessToken: curFanPage.access_token,
          })
        );
      }
    }
    if (curFanPage && curActivity && curVideo) {
      if (curVideo === "not_found") {
        const postId = curActivity.dispatch?.fb_post_id as string;
        dispatch(
          getPostAsync({
            postId: postId,
            accessToken: curFanPage.access_token,
          })
        );
      }
    }
  }, [curFanPage, curActivity, curLiveVideo, curVideo]);

  const isPlatformFacebook =
    curActivity?.dispatch?.platform?.includes("facebook");
  const postDescription = () => {
    switch (curActivity?.dispatch?.platform) {
      case "facebook.page":
        return curVideo && curVideo !== "not_found"
          ? curVideo?.description || curVideo?.title
          : curPost?.message;
      case "facebook.group":
        return curLiveVideo && curLiveVideo !== "not_found"
          ? curLiveVideo?.description || curLiveVideo?.video?.title
          : curPost?.message;
    }
  };

  const onStartEditing = () => {
    setIsEditing(true);
  };

  const onSubmitEditing = (submitText: string) => {
    setIsSubmitting(true);
    const onSuccess = () => {
      dispatch(
        setNotice({
          isErroring: true,
          message: "更新貼文內容成功。",
          type: "success",
        })
      );
      setIsEditing(false);
    };
    const onError = () => {
      dispatch(
        setNotice({
          isErroring: true,
          message: "更新貼文內容失敗，請稍後再試。",
          type: "error",
        })
      );
    };
    if (IS_STREAMING) {
      dispatch(
        updateLiveVideoDescriptionAsync({
          description: submitText,
          pageId: curFanPage?.id || "",
          accessToken: curFanPage?.access_token || "",
        })
      )
        .then(() => {
          onSuccess();
        })
        .catch(() => {
          onError();
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
    if (IS_STREAM_ENDED) {
      dispatch(
        updateVideoDescriptionAsync({
          message: submitText,
          postId: (curVideo as any)?.id || "",
          accessToken: curFanPage?.access_token || "",
        })
      )
        .then(() => {
          onSuccess();
        })
        .catch(() => {
          onError();
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };
  const onCancelEditing = () => {
    setIsEditing(false);
  };

  const isSupportFinishdLiveVideo = () => {
    if (!curActivity) {
      return false;
    }

    if (
      curActivity?.dispatch?.platform === "facebook.page" &&
      curVideo !== "not_found" &&
      curVideo
    ) {
      return curVideo.live_status === "LIVE";
    }

    if (
      curActivity?.dispatch?.platform === "facebook.group" &&
      curLiveVideo !== "not_found" &&
      curLiveVideo
    ) {
      return curLiveVideo.status === "LIVE";
    }
    return false;
  };

  const onFinishedLiveVideo = async () => {
    if (
      curFanPage &&
      curActivity &&
      curActivity.dispatch?.platform === "facebook.page" &&
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
              type: "info",
            })
          );
          dispatch(updateFbLiveStreamingStatus("facebook.page"));
          // setTimeout(() => window.location.reload(), 2000);
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
      curActivity &&
      curActivity.dispatch?.platform === "facebook.group" &&
      curLiveVideo &&
      curLiveVideo !== "not_found"
    ) {
      setIsRequesting(true);
      finishedLiveVideo(
        curFanPage?.access_token as string,
        curLiveVideo.id,
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
            // setTimeout(() => window.location.reload(), 2000);
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
  if (curPost?.error) {
    return null;
  }
  return (
    <>
      <Box
        sx={{
          height: "fit-content",
          boxSizing: "-moz-initial",
          display: isvisible ? "block" : "none",
          background: "#fff",
          width: "100%",
          padding: 1,
        }}
      >
        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
          }}
          disablePadding
        >
          <ListItem
            disablePadding
            disableGutters
            secondaryAction={
              <>
                {liveLink !== null && <CopyLiveLinkButton />}
                {isSupportFinishdLiveVideo() && (
                  <Button
                    disabled={isRequesting}
                    size="medium"
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
              </>
            }
            sx={{
              padding: 0,
              width: "100%",
            }}
          >
            <ListItemAvatar>
              <Avatar
                alt={curFanPage?.name}
                src={curFanPage?.picture?.data?.url}
              >
                {curFanPage?.name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle2">{curFanPage?.name}</Typography>
              }
              secondary={dayjs(
                (curVideo &&
                  (curVideo as unknown as LIVE_VIDEO)?.creation_time) ||
                  (curVideo as VIDEO)?.created_time ||
                  curPost?.created_time
              ).format("YYYY-MM-DD HH:mm:ss")}
            />
          </ListItem>
        </List>
        {isPlatformFacebook && (
          <Grid
            container
            sx={{
              width: "100%",
              height: "100%",
              flexDirection: "column",
              flexWrap: "nowrap",
              px: 1,
            }}
          >
            <Grid item sx={{ width: "100%", flex: "1 0 auto" }}>
              {!isEditing ? (
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "break-spaces", wordBreak: "break-all" }}
                >
                  {postDescription()}
                </Typography>
              ) : (
                <TextField
                  sx={{ height: "100%", mt: 1 }}
                  label="編輯貼文"
                  multiline
                  minRows={6}
                  maxRows={10}
                  fullWidth
                  defaultValue={postDescription()}
                  onChange={(e) => setEditingText(e.target.value)}
                  autoFocus
                />
              )}
              <Divider sx={{ mt: 1, mb: 1 }} />
            </Grid>
            <Grid item sx={{ alignSelf: "flex-end", pb: 1 }}>
              {!isEditing ? (
                <Button variant="contained" onClick={onStartEditing}>
                  編輯
                </Button>
              ) : (
                <Box sx={{ mt: 1 }}>
                  <Button onClick={onCancelEditing}>取消</Button>
                  <LoadingButton
                    loading={isSubmitting}
                    variant="contained"
                    onClick={() => {
                      onSubmitEditing(editingText);
                    }}
                  >
                    確認
                  </LoadingButton>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
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
            variant="contained"
            loading={isRequesting}
            onClick={() => {
              onFinishedLiveVideo();
            }}
            autoFocus
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TextPost;
