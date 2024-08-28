import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface PROPS {
  isOpen: boolean;
  setOpen: Function;
}
function DialogPostIsDeleteRemind(props: PROPS) {
  const { isOpen, setOpen } = props;
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => {
          setOpen(false);
        }}
        maxWidth={"xs"}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          貼文已刪除
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            此貼文已被刪除，您無法查看直播影片、貼文及留言。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
            }}
          >
            我瞭解了
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DialogPostIsDeleteRemind;
