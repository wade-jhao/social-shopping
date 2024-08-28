import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { IG_MEDIA_COMMENT } from "../apis/facebook";
import { ListChildComponentProps } from "react-window";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";

interface PROPS extends ListChildComponentProps {
  comment: IG_MEDIA_COMMENT;
  onDelete: Function;
}
function IgCommentItem(props: PROPS) {
  const { comment } = props;
  const { index, style } = props;

  return (
    <ListItem
      alignItems="flex-start"
      style={style}
      key={index}
      component="div"
      disablePadding
    >
      <ListItemAvatar>
        <Avatar
          aria-describedby={`detail-popper-${comment.id}`}
          alt={comment.from?.username}
          src={comment.from?.username}
        >
          {comment.from?.username.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{
          background: "rgba(0, 0, 0, 0.03)",
          padding: "10px 15px",
          borderRadius: "20px",
        }}
        primary={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              sx={{
                display: "flex",
                fontWeight: "bold",
                mr: 1,
                alignItems: "center",
              }}
              component="span"
              variant="body1"
              color="text.primary"
            >
              {comment.from?.username}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Typography
              sx={{ display: "inline", fontWeight: "bold" }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ maxWidth: "90%", maxHeight: 60, overflowY: "auto" }}>
                  <Tooltip title={comment.text} arrow placement="top-start">
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.3, fontSize: 15 }}
                    >
                      {comment.text}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Typography sx={{ fontSize: "12px", mr: 1 }}>
                    {dayjs(comment.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography>
                </Box>
              </Box>
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

export default IgCommentItem;
