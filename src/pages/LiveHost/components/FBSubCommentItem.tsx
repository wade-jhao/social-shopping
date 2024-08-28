import { useState } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { FANS_POST_COMMENT } from "../apis/facebook";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import { selectActivity } from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
// import { selectFansPage } from "@store/liveroomSlice";
// import { useAppSelector } from "@store/hooks";

interface PROPS {
  replying: boolean;
  comment: FANS_POST_COMMENT | null;
  onDelete: Function;
}

function FBSubCommentItem(props: PROPS) {
  const { comment, onDelete, replying } = props;
  // const curFanPage = useAppSelector(selectFansPage);
  const curActivity = useAppSelector(selectActivity);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const commentMenu =
    curActivity && curActivity?.dispatch?.platform === "facebook.page"
      ? [{ icon: DeleteIcon, name: "刪除", onClick: () => onDelete(comment) }]
      : [];
  // if (curFanPage?.id === comment?.from?.id) {
  //   commentMenu.push({ name: "編輯", onClick: () => {} });
  // }

  return comment ? (
    <ListItem
      alignItems="flex-start"
      component="div"
      disablePadding
      secondaryAction={
        <Box>
          <IconButton
            aria-label="more"
            id={`more-button-${Math.random()}`}
            aria-controls={open ? "more-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={(event: React.MouseEvent<HTMLElement>) =>
              setAnchorEl(event.currentTarget)
            }
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="more-menu"
            MenuListProps={{
              "aria-labelledby": "more-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5,
                width: "10ch",
              },
            }}
          >
            {commentMenu.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  item.onClick();
                  setAnchorEl(null);
                }}
              >
                <item.icon />
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar alt={comment.from?.name} src={comment.from?.picture.data.url}>
          {comment.from?.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{
          background: replying ? "#E0E0E0" : "#F5F5F5",
          padding: "10px 15px",
          borderRadius: "20px",
        }}
        primary={comment.from?.name}
        secondary={
          <Box>
            <Typography
              sx={{ display: "inline", fontWeight: "bold" }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ maxHeight: 50, maxWidth: "90%" }}>
                  <Typography variant="body2" sx={{ fontSize: "12px" }}>
                    {comment.message}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Typography
                    sx={{ fontSize: "10px", mr: 1, cursor: "pointer" }}
                  >
                    {dayjs(comment.created_time).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography>
                </Box>
              </Box>
            </Typography>
          </Box>
        }
      />
    </ListItem>
  ) : null;
}

export default FBSubCommentItem;
