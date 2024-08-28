import { IconButton } from "@mui/material";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import useLiveLink from "@hooks/useLiveLink";
import { useAppDispatch } from "@store/hooks";
import { setNotice } from "@store/commonSlice";
import Tooltip from "@mui/material/Tooltip";

function CopyLiveLinkButton() {
  const liveLink = useLiveLink();
  const dispatch = useAppDispatch();

  return (
    <Tooltip title={"複製直播連結"} arrow placement="top">
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          if (liveLink === null) return;
          // Copy live link to clipboard
          navigator.clipboard.writeText(liveLink);
          // Show snackbar
          dispatch(
            setNotice({
              isErroring: true,
              message: "已複製直播連結",
              type: "info",
            })
          );
        }}
      >
        <LinkOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
}
export default CopyLiveLinkButton;
