import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ExpiredToken from "@assets/expired-token.svg";

import {
  selectFansPage,
  selectPost,
  getPostAsync,
  selectActivity,
  selectLiveVideo,
  selectVideo,
  updateLiveVideoDescriptionAsync,
  updateVideoDescriptionAsync,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Button, Grid, TextField } from "@mui/material";
import { useStreamStatus } from "@hooks/streamStatus";
import { setNotice } from "@store/commonSlice";
import LoadingButton from "@mui/lab/LoadingButton";
import { LIVE_VIDEO, VIDEO } from "../apis/facebook";

interface PROPS {
  isvisible: boolean;
  height: number;
}

function TextPost(props: PROPS) {
  const { height = 0, isvisible } = props;
  const dispatch = useAppDispatch();
  const curFanPage = useAppSelector(selectFansPage);
  const curPost = useAppSelector(selectPost);
  const curActivity = useAppSelector(selectActivity);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
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
    setEditingText(postDescription() || "");
  };
  return (
    <Box
      sx={{
        height: height,
        overflowY: "scroll",
        boxSizing: "-moz-initial",
        display: isvisible ? "flex" : "none",
        flexDirection: "column",
      }}
    >
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          p: 1,
        }}
        disablePadding
      >
        <ListItem
          disablePadding
          disableGutters
          secondaryAction={
            <Box sx={{}}>
              {!isEditing && (
                <Button variant="contained" onClick={onStartEditing}>
                  編輯
                </Button>
              )}
              {isEditing && (
                <>
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
                </>
              )}
            </Box>
          }
        >
          <ListItemAvatar>
            <Avatar alt={curFanPage?.name} src={curFanPage?.picture?.data?.url}>
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
            {!isEditing && (
              <Typography
                variant="body2"
                sx={{ whiteSpace: "break-spaces", wordBreak: "break-all" }}
              >
                {postDescription()}
              </Typography>
            )}
            {isEditing && (
              <TextField
                sx={{ height: "100%" }}
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
          </Grid>
        </Grid>
      )}
      {curPost?.error && (
        <Box
          sx={{
            width: "100%",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <img style={{ marginTop: 64 }} src={ExpiredToken}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            無法載入貼文內容
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)" }}
          >
            該貼文可能已被刪除，或沒有權限查看該貼文
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TextPost;
