import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import CommentIcon from "@assets/commentIcon.svg";
import NotifyIcon from "@assets/notifyIcon.svg";
import OrderIcon from "@assets/orderIcon.svg";
import LaunchIcon from "@mui/icons-material/Launch";
import { useAppSelector } from "@store/hooks";
import { selectPostActions } from "@store/liveroomSlice";

interface PROPS {
  title: string;
  description: string;
  height?: number;
  type: "留言" | "統計" | "通知";
}

function PostOptionPanel(props: PROPS) {
  const { height, title, description, type } = props;
  const [isReady, setIsReady] = useState(false);
  const curPostActions = useAppSelector(selectPostActions);
  const arrSkelton = new Array(5).fill(0);
  useEffect(() => {
    setIsReady(true);
  }, []);

  const getPanelIcon = () => {
    switch (type) {
      case "留言":
        return CommentIcon;
      case "通知":
        return NotifyIcon;
      case "統計":
        return OrderIcon;
      default:
        return CommentIcon;
    }
  };

  const getActionLink = () => {
    if (!curPostActions) {
      return "";
    }

    const curAction = curPostActions?.find((action) => action.type === type);
    if (curAction) {
      return curAction.url;
    } else {
      return "";
    }
  };

  return (
    <>
      {isReady && (
        <Box
          component="form"
          sx={{
            height: height,
            "& .MuiTextField-root": { m: 1, width: "25ch" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          noValidate
          autoComplete="off"
        >
          <img style={{ marginTop: 64, width: 160 }} src={getPanelIcon()}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)" }}
          >
            {description}
          </Typography>
          <Link
            sx={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
            href={getActionLink()}
            target="_"
          >
            <Button variant="contained" endIcon={<LaunchIcon />}>
              前往查看
            </Button>
          </Link>
        </Box>
      )}
      {!isReady &&
        arrSkelton.map((item, index) => (
          <Skeleton
            key={index}
            animation="wave"
            variant="rectangular"
            height={40}
            sx={{ mt: 1, mb: 1 }}
          />
        ))}
    </>
  );
}

export default PostOptionPanel;
