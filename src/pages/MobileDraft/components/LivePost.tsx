import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import SocialPostSelector from "./SocialPostSelector-new";
import { selectApis } from "@store/apiSlice";
import { replaceActivityPost } from "../apis/legacy";
import { useParams } from "react-router-dom";
import { setNotice } from "@store/commonSlice";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LiveroomIcon from "@assets/liveroom.svg";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { useLocalStorage } from "@utils/index";
import {
  enableActivityAsync,
  selectActivity,
  deleteProductAsync,
} from "@store/liveroomSlice";
import DialogSetIgStreamCountDownTime from "@components/IgStreamCountDown/DialogSetIgStreamCountDownTime";
import useActivityPostIgCountDownTimeStorage from "@components/IgStreamCountDown/useActivityPostIgCountDownTimeStorage";

interface PROPS {
  isVisible?: boolean;
  height?: number;
  channel: string;
  onChannelChange: Function;
  onSwitchChannel: Function;
}

function LivePost(props: PROPS) {
  const { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const activity = useAppSelector(selectActivity);
  const [isEnableActivity, setIsEnableActivity] = useState(false);
  const [isEnableDialog, setIsEnableDialog] = useState(false);
  const [curLiveVideo, setCurLiveVideo] = useState("");
  const [isSelectingPost, setIsSelectingPost] = useState(false);
  const {
    // height = 0,
    // isVisible = true,
    channel,
    onChannelChange,
    onSwitchChannel,
  } = props;
  const [, setLocalDefaultProduct] = useLocalStorage(
    "default_product",
    JSON.stringify("")
  );
  const [
    isDialogSetIgStreamCountDownTimeOpen,
    setIsDialogSetIgStreamCountDownTimeOpen,
  ] = useState(false);
  const { streamTimeStorage, setStreamTimeStorage } =
    useActivityPostIgCountDownTimeStorage();

  useEffect(() => {
    if (activity) {
      setIsEnableActivity(activity.is_enable);
    }
  }, [activity]);

  const onEnablePost = async () => {
    if (!curLiveVideo) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "請選擇直播貼文",
          type: "info",
        })
      );
      return;
    }
    const defaultProduct = window.localStorage.getItem("default_product")
      ? JSON.parse(
          JSON.parse(window.localStorage.getItem("default_product") || "") || ""
        )
      : {};
    const displayId = defaultProduct[`${activityId}-${postId}`]
      ? defaultProduct[`${activityId}-${postId}`].toString()
      : "";
    if (displayId !== "") {
      await dispatch(
        deleteProductAsync({
          url: apis?.activity_post_products as string,
          activityId: activityId as string,
          postId: postId as string,
          prodId: displayId,
          onSuccess: (val: any) => {},
        })
      );
    }
    await replaceActivityPost(
      apis?.activity_replace_post as string,
      activityId as string,
      postId as string,
      channel,
      curLiveVideo.split("_")[0],
      channel.includes("facebook") ? curLiveVideo : curLiveVideo.split("_")[1]
    ).then((res: any) => {
      if (res.success) {
        dispatch(
          setNotice({
            isErroring: true,
            message: "啟用貼文成功",
            type: "success",
          })
        );
        window.localStorage.removeItem("draft_info");
        window.localStorage.removeItem("is_new_draft");
        if (
          Object.prototype.hasOwnProperty.call(
            defaultProduct,
            `${activityId}-${postId}`
          )
        ) {
          delete defaultProduct[`${activityId}-${postId}`];
        }
        setLocalDefaultProduct(JSON.stringify(defaultProduct));
        setTimeout(
          () =>
            (window.location.href = `/liveroom/activities/${res.activity_id}/posts/${res.post_id}`),
          1000
        );
      } else {
        dispatch(
          setNotice({
            isErroring: true,
            message: res.error,
            type: "error",
          })
        );
      }
    });
  };

  const handleEnableActivity = () => {
    dispatch(
      enableActivityAsync({
        url: apis?.activity as string,
        activityId: activityId as string,
        isEnable: true,
        onSuccess: (res: any) => {
          if (res?.success) {
            setIsEnableActivity(true);
            setIsEnableDialog(false);
            setIsSelectingPost(true);
          }
        },
      })
    );
  };

  return (
    <>
      <Box
        sx={{
          // height: Math.floor(liveRoomHeight - ACTIVITY_HEIGHT),
          width: "100%",
          background: "#37474F",
          textAlign: "center",
          pb: 2,
        }}
      >
        <img style={{ marginTop: 64 }} src={LiveroomIcon}></img>
        <Typography variant="h6" sx={{ color: "#FAFAFA" }}>
          開始直播了嗎？
        </Typography>
        <Typography variant="body2" sx={{ color: "#E0E0E0", mt: 1 }}>
          {`請確保您已在 ${
            channel.includes("facebook") ? "Facebook" : "Instagram"
          } 開啟直播，接著連接至此平台。`}
        </Typography>
        <Button
          size="medium"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onSwitchChannel();
          }}
          sx={{ textAlign: "center", mt: 2, mr: 1 }}
        >
          切換直播來源
        </Button>
        <Button
          size="medium"
          variant="contained"
          startIcon={<InsertLinkIcon />}
          onClick={(e) => {
            e.stopPropagation();
            if (
              channel === "instagram" &&
              (!streamTimeStorage || streamTimeStorage === "")
            ) {
              setIsDialogSetIgStreamCountDownTimeOpen(true);
              return;
            }
            if (isEnableActivity) {
              setIsSelectingPost(true);
            } else {
              setIsEnableDialog(true);
            }
          }}
          sx={{ textAlign: "center", mt: 2 }}
        >
          {`連接${channel.includes("facebook") ? "Facebook" : "Instagram"}直播`}
        </Button>
      </Box>
      <Dialog
        fullWidth={true}
        open={isEnableDialog}
        onClose={() => setIsEnableDialog(false)}
      >
        <DialogTitle>活動尚未啟用</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <DialogContentText>
            請先啟用活動，在連接直播貼文，系統才會開始抓取留言並進行分析。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsEnableDialog(false);
            }}
          >
            稍後再啟用
          </Button>
          <Button onClick={handleEnableActivity}>啟用活動</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isSelectingPost}
        onClose={() => setIsSelectingPost(false)}
        aria-labelledby="post-dialog-title"
        aria-describedby="post-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">
          選擇 {channel.includes("facebook") ? "Facebook" : "Instagram"} 直播
        </DialogTitle>
        <DialogContent>
          <SocialPostSelector
            onPostChange={(val: string) => {
              setCurLiveVideo(val);
            }}
            channel={channel}
            onChannelChange={(val: string) => onChannelChange(val)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSelectingPost(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              onEnablePost();
            }}
            autoFocus
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
      <DialogSetIgStreamCountDownTime
        open={isDialogSetIgStreamCountDownTimeOpen}
        setOpen={setIsDialogSetIgStreamCountDownTimeOpen}
        onSetCountdownTime={() => {
          setIsDialogSetIgStreamCountDownTimeOpen(false);
          if (isEnableActivity) {
            setIsSelectingPost(true);
          } else {
            setIsEnableDialog(true);
          }
        }}
        confirmButtonText="下一步"
        streamTimeStorage={streamTimeStorage}
        setStreamTimeStorage={setStreamTimeStorage}
      />
    </>
  );
}

export default LivePost;
