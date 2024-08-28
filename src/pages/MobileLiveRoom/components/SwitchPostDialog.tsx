import { useEffect } from "react";
import { ACTIVITY_POST } from "@pages/LiveRoom/apis/legacy";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Empty from "@components/Empty";
import Typography from "@mui/material/Typography";
import FacebookIcon from "@mui/icons-material/Facebook";
import ListItemButton from "@mui/material/ListItemButton";
import instgram from "@assets/instgram.png";
import dayjs from "dayjs";

interface PROPS {
  isVisible: boolean;
  activityPosts: ACTIVITY_POST[] | null;
  onCancel: Function;
}
function SwitchPostDialog(props: PROPS) {
  const navigate = useNavigate();
  const { activityPosts, isVisible, onCancel } = props;

  useEffect(() => {}, []);
  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>切換貼文</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 1 }}>
        <List
          sx={{ width: "100%", bgcolor: "background.paper" }}
          disablePadding
        >
          {activityPosts?.map((post, index) => (
            <ListItem
              key={index}
              disablePadding
              disableGutters
              secondaryAction={
                <Box>
                  {" "}
                  {post.fanspage && (
                    <FacebookIcon sx={{ color: "rgb(25, 118, 210)" }} />
                  )}
                  {post.instagram_business_account && (
                    <img
                      src={instgram}
                      style={{ height: 24 }}
                      alt="instagram"
                    />
                  )}
                </Box>
              }
            >
              <ListItemButton
                role={undefined}
                onClick={() =>
                  navigate(
                    `/liveroom/activities/${post.id.split("_")[0]}/posts/${
                      post.id.split("_")[1]
                    }`
                  )
                }
                dense
                disableGutters
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ background: "#fff" }}
                    alt={post.detail?.from?.name}
                    src={post.detail?.from?.picture.data.url}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {post.detail?.message}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(0,0,0,.55)",
                      }}
                    >
                      {dayjs(post.detail?.created_time).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {!activityPosts?.length && <Empty message="沒有更多貼文" />}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SwitchPostDialog;
