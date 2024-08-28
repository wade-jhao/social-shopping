import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useAppSelector } from "@store/hooks";
import { selectIgMedia } from "@store/liveroomSlice";
import { useState } from "react";

interface PROPS {
  onSetCountdownTime?: Function;
  open: boolean;
  setOpen: Function;
  confirmButtonText?: string;
  streamTimeStorage: string;
  setStreamTimeStorage: Function;
}
function DialogSetIgStreamCountDownTime(props: PROPS) {
  const {
    onSetCountdownTime,
    open,
    setOpen,
    confirmButtonText,
    streamTimeStorage,
    setStreamTimeStorage,
  } = props;

  const curIgMedia = useAppSelector(selectIgMedia);
  const [streamTime, setStreamTime] = useState("1"); // ["1", "4"]

  const onConfirm = () => {
    setStreamTimeStorage(streamTime);
    onSetCountdownTime && onSetCountdownTime();
  };
  return (
    <>
      <Dialog open={open} maxWidth={"xs"} disableEscapeKeyDown>
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          選擇 Instagram 直播時長
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Instagram 直播有 1 小時或 4 小時的時長限制，時間到將被 Instagram
            強制關閉直播。請根據您過去的直播經驗選擇您的直播時長。
          </DialogContentText>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
              value={streamTime}
              onChange={(e) => {
                setStreamTime(e.target.value);
              }}
            >
              <FormControlLabel value="1" control={<Radio />} label="1 小時" />
              <FormControlLabel value="4" control={<Radio />} label="4 小時" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {(streamTimeStorage !== "" || curIgMedia === null) && (
            <Button
              variant="text"
              onClick={() => {
                setOpen(false);
              }}
            >
              取消
            </Button>
          )}
          <Button variant="contained" onClick={onConfirm}>
            {confirmButtonText ?? "設定"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DialogSetIgStreamCountDownTime;
