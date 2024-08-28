import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { FANS_POST_COMMENT } from "../apis/facebook";
import { ListChildComponentProps } from "react-window";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";
import { selectFansPage } from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
import DeleteIcon from "@mui/icons-material/Delete";

interface PROPS extends ListChildComponentProps {
  comment: FANS_POST_COMMENT;
  replying: boolean;
  onReply: Function;
  onOpenReplyList: Function;
  onDelete: Function;
  onEdit: Function;
}

function FBCommentItem(props: PROPS) {
  const { comment, replying, onDelete, onEdit, index, style } = props;
  const refCommentMenu = useRef([
    { icon: DeleteIcon, name: "刪除", onClick: () => onDelete(comment) },
  ]);

  const refAvata = useRef(null);
  const curFanPage = useAppSelector(selectFansPage);

  useEffect(() => {
    if (curFanPage && comment?.from?.id === curFanPage?.id) {
      refCommentMenu.current = refCommentMenu.current.concat([
        { icon: EditIcon, name: "編輯", onClick: () => onEdit(index) },
      ]);
    }
  }, [curFanPage]);

  return (
    <ListItem
      alignItems="flex-start"
      key={index}
      component="div"
      disablePadding
      disableGutters
      style={style}
    >
      <ListItemAvatar>
        <Avatar
          aria-describedby={`detail-popper-${comment.id}`}
          alt={comment.from?.name}
          src={comment.from?.picture.data.url}
          onClick={() => {}}
          ref={refAvata}
        >
          {comment.from?.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{
          background: replying ? "#E0E0E0" : "#F5F5F5",
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
              {comment.from?.name}
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
                <Box
                  sx={{ maxWidth: "100%", maxHeight: 100, overflowY: "auto" }}
                >
                  <Tooltip title={comment.message} arrow placement="top-start">
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.3, fontSize: 15 }}
                    >
                      {comment.message}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Typography sx={{ fontSize: "12px", mr: 1 }}>
                    {dayjs(comment.created_time).format("YYYY-MM-DD HH:mm:ss")}
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

export default FBCommentItem;
