import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  IG_REMIND_REMAINING_TIME_DIALOG_ID,
  IG_REMIND_REMAINING_TIME_SECOND,
} from "./utils";
import useIgRemainTime from "./useIgRemainTime";
import { useEffect, useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { setNotice } from "@store/commonSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { duplicateActivityPost } from "@pages/Activity/apis/legacy";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router";
import { LoadingButton } from "@mui/lab";
interface PROPS {}
function DialogIgStreamCountDownRemind(props: PROPS) {
  const [openRemindDialog, setOpenRemindDialog] = useState(false);
  const { isReachedRemainTime } = useIgRemainTime();
  const [isRequestingUpdatePosts, setIsRequestingUpdatePosts] = useState(false);
  useEffect(() => {
    if (isReachedRemainTime) {
      setOpenRemindDialog(true);
    }
  }, [isReachedRemainTime]);
  const { activityId, postId } = useParams();
  const handleRemindDialogClose = () => {
    if (isRequestingUpdatePosts) {
      return;
    }
    setOpenRemindDialog(false);
  };
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const duplicatePost = () => {
    setIsRequestingUpdatePosts(true);
    duplicateActivityPost(
      apis?.activity_duplicate_post as string,
      activityId as string,
      postId || "",
      "dummy",
      "dummy",
      `${postId as string}-${new Date().getTime()}`
    ).then((res) => {
      const { post_id } = res;
      dispatch(
        setNotice({
          isErroring: true,
          message: "成功將本場直播的商品及關鍵字設定複製為新的草稿。",
          type: "success",
        })
      );
      res["type"] = "dummy";
      setIsRequestingUpdatePosts(false);
      handleRemindDialogClose();
      window.open(
        `/liveroom/draft/activities/${activityId}/posts/${post_id}`,
        "_blank"
      );
    });
  };

  return (
    <>
      <Dialog
        id={IG_REMIND_REMAINING_TIME_DIALOG_ID}
        open={openRemindDialog}
        onClose={handleRemindDialogClose}
        maxWidth={"xs"}
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <WarningAmberIcon color={"warning"} sx={{ mr: 1 }} />
          即將被強制結束直播
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            距離 Instagram 直播結束還有 {IG_REMIND_REMAINING_TIME_SECOND / 60}{" "}
            分鐘，提醒您盡快將直播收尾。如需繼續直播，請複製直播，接著重新開播並連接到直播主控台。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleRemindDialogClose}>
            我瞭解了
          </Button>
          <LoadingButton
            loading={isRequestingUpdatePosts}
            variant="contained"
            onClick={duplicatePost}
          >
            複製直播
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DialogIgStreamCountDownRemind;
