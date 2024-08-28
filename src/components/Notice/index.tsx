import { forwardRef } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { selectNotice } from "@store/commonSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { setNotice } from "@store/commonSlice";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Notice(): JSX.Element {
  const notice = useAppSelector(selectNotice);
  const { isErroring, message, type } = notice;
  const dispatch = useAppDispatch();
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={isErroring}
      autoHideDuration={2000}
      onClose={() => dispatch(setNotice({ isErroring: false }))}
    >
      <Alert
        onClose={() => dispatch(setNotice({ isErroring: false }))}
        severity={type}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notice;
