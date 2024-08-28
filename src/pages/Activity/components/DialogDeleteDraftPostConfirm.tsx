import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import dayjs from "dayjs";

interface PROPS {
  isRequesting: boolean;
  open: boolean;
  onDeleteConfirm: Function;
  onCancel: Function;
  postCreatedTime: string;
}
function DialogDeleteDraftPostConfirm(props: PROPS) {
  const { isRequesting, open, onDeleteConfirm, onCancel, postCreatedTime } =
    props;

  return (
    <Dialog open={open} maxWidth={"xs"}>
      <DialogTitle>確認刪除草稿</DialogTitle>
      <DialogContent>
        {postCreatedTime
          ? `確定要刪除於 ${dayjs(postCreatedTime).format(
              "YYYY-MM-DD HH:mm:ss"
            )}
        建立的草稿嗎？刪除後將無法復原。`
          : `確定要刪除草稿嗎？刪除後將無法復原。`}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onCancel();
          }}
          color="inherit"
        >
          取消
        </Button>
        <LoadingButton
          variant="contained"
          loading={isRequesting}
          onClick={() => {
            onDeleteConfirm();
          }}
          autoFocus
        >
          確定
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default DialogDeleteDraftPostConfirm;
