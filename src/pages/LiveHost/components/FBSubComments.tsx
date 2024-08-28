import { FANS_POST_COMMENT } from "../apis/facebook";
import FBSubCommentItem from "./FBSubCommentItem";
import List from "@mui/material/List";
import { ListItemDecorator } from "@mui/joy";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { ListItemButton } from "@mui/material";
interface PROPS {
  comment: FANS_POST_COMMENT | null;
  contentHeight: number;
  onDelete: Function;
  onCancelReply: Function;
}
function FBSubComments(props: PROPS) {
  const { comment, contentHeight, onDelete, onCancelReply } = props;

  return (
    <>
      <List disablePadding sx={{ display: "flex", alignItems: "center" }}>
        <ListItemButton
          onClick={() => {
            onCancelReply && onCancelReply();
          }}
          sx={{ pl: 1 }}
        >
          <ListItemDecorator>
            <ArrowBackIosIcon sx={{ fontSize: 18 }} />
          </ListItemDecorator>
          返回所有留言
        </ListItemButton>
      </List>
      <List disablePadding sx={{ height: contentHeight, overflowY: "scroll" }}>
        <FBSubCommentItem
          comment={comment}
          onDelete={onDelete}
          replying={true}
        />
        {comment?.comments?.data.map((comment, index) => (
          <FBSubCommentItem
            key={comment.id}
            comment={comment}
            onDelete={onDelete}
            replying={false}
          />
        ))}
      </List>
    </>
  );
}

export default FBSubComments;
