import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Empty from "@components/Empty";
import Typography from "@mui/material/Typography";
import FacebookIcon from "@mui/icons-material/Facebook";
import ListItemButton from "@mui/material/ListItemButton";
import instgram from "@assets/instgram.png";
import dayjs from "dayjs";
import { selectActivityPosts } from "@store/activitySlice";
import { useAppSelector } from "@store/hooks";
import Skeleton from "@mui/material/Skeleton";
import DraftsIcon from "@mui/icons-material/Drafts";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button, Grid, ListItemIcon } from "@mui/material";
import { useState } from "react";
import { ACTIVITY_POST } from "@pages/LiveRoom/apis/legacy";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogDeleteDraftPostConfirm from "./DialogDeleteDraftPostConfirm";
import { ListItemSecondaryAction } from "@mui/material";

interface PROPS {
  type: string;
  onDuplicatePost: (postId: string, postIdentity: string) => void;
  onDeletePost: (postId: string) => void;
  isRequestingUpdatePosts: boolean;
  activityListHeight: number;
}

function PostList(props: PROPS) {
  const { type, activityListHeight } = props;
  const activityPosts = useAppSelector(selectActivityPosts);
  const arrSkelton = new Array(6).fill(0);
  const getFilterActivityPost = () => {
    if (!activityPosts) {
      return [];
    }
    switch (type) {
      case "facebook.page":
        return activityPosts.filter(
          (post) => post.platform === "facebook.page"
        );
      case "facebook.group":
        return activityPosts.filter(
          (post) => post.platform === "facebook.group"
        );
      case "instagram":
        return activityPosts.filter((post) => post.platform === "instagram");
      case "draft":
        return activityPosts.filter((post) => !post.post.fb_post_id);
      default:
        return activityPosts;
    }
  };

  return (
    <Box
      sx={{
        padding: 1,
        transition: " box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        borderRadius: 4,
        boxShadow:
          "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
        mb: 2,
        height: activityListHeight - 24,
        overflowY: "scroll",
      }}
    >
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
        }}
        disablePadding
      >
        {getFilterActivityPost()?.map((post, index) => (
          <PostListItem key={post.id} {...props} post={post} />
        ))}
      </List>
      {activityPosts && !activityPosts?.length && (
        <Empty message="沒有關聯活動的貼文" />
      )}
      {!activityPosts &&
        arrSkelton.map((item, index) => (
          <Skeleton
            key={index}
            animation="wave"
            variant="rectangular"
            height={40}
            sx={{ mt: 1, mb: 1 }}
          />
        ))}
    </Box>
  );
}

function PostListItem(props: PROPS & { post: ACTIVITY_POST }) {
  const { onDuplicatePost, onDeletePost, isRequestingUpdatePosts, post } =
    props;
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [prepareDeletePostID, setPrepareDeletePostID] = useState<string | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleListButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseListButtonMenu = () => {
    setAnchorEl(null);
  };
  const isDraftPost = !post.platform;
  const getPlatformTitle = (platform: string, name: string) => {
    switch (platform) {
      case "instagram":
        return `${name}的直播`;
      case "facebook.page":
        return `${name}的粉絲專頁直播`;
      case "facebook.group":
        return `${name}的社團直播`;
      default:
        return `${name}的直播`;
    }
  };

  return (
    <>
      <ListItem
        disablePadding
        // disableGutters
      >
        <ListItemButton
          component="a"
          role={undefined}
          href={
            post.platform
              ? `/liveroom/activities/${post.id.split("_")[0]}/posts/${
                  post.id.split("_")[1]
                }?api=${window.sessionStorage.getItem("api") || ""}`
              : `/liveroom/draft/activities/${post.id.split("_")[0]}/posts/${
                  post.id.split("_")[1]
                }?api=${window.sessionStorage.getItem("api") || ""}`
          }
          dense
          disableGutters
        >
          <ListItemAvatar>
            {post.platform ? (
              <Avatar
                sx={{
                  background: post.platform.includes("facebook")
                    ? "rgb(25, 118, 210)"
                    : "#f72d7a",
                }}
                alt={post.post?.platform_name}
                src={post.post?.platform_name}
              />
            ) : (
              <Avatar
                sx={{ background: "rgba(0, 0, 0, 0.2)", color: "#000" }}
                alt="直播草稿"
              >
                <DraftsIcon sx={{ color: "rgba(0, 0, 0, 1)" }} />
              </Avatar>
            )}
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
                {post.post.content ||
                  getPlatformTitle(
                    post.platform as string,
                    post.post?.platform_name as string
                  )}
              </Typography>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(0,0,0,.55)",
                }}
              >
                {post.post.create_time && post.post.create_time !== ""
                  ? dayjs(post.post.create_time).format("YYYY-MM-DD HH:mm:ss")
                  : ""}
              </Typography>
            }
          />
          <ListItemSecondaryAction
            sx={{ position: "relative", transform: "none" }}
          >
            <Grid container alignItems={"center"} sx={{ flexWrap: "nowrap" }}>
              <Grid item xs>
                {!post.post.fb_post_id && (
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    -
                  </Typography>
                )}
                {post.post.fb_post_id && !post.instagram_business_account && (
                  <FacebookIcon sx={{ color: "rgb(25, 118, 210)" }} />
                )}
                {post.post.fb_post_id && post.instagram_business_account && (
                  <img src={instgram} style={{ height: 24 }} alt="instagram" />
                )}
              </Grid>
              <Grid item xs="auto">
                <Button
                  variant="text"
                  disabled={isRequestingUpdatePosts}
                  onClick={handleListButtonClick}
                  color="inherit"
                  sx={{ minWidth: 40 }}
                >
                  <MoreVertIcon sx={{ width: 16 }} />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseListButtonMenu}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isRequestingUpdatePosts) {
                        handleCloseListButtonMenu();
                        return;
                      }
                      onDuplicatePost(post.id, "");
                      handleCloseListButtonMenu();
                    }}
                  >
                    <ListItemIcon>
                      <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>複製直播</ListItemText>
                  </MenuItem>
                  {isDraftPost && (
                    <MenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenDeleteDialog(true);
                        setPrepareDeletePostID(post.id);
                      }}
                    >
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>刪除草稿</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </Grid>
            </Grid>
          </ListItemSecondaryAction>
        </ListItemButton>
      </ListItem>
      <DialogDeleteDraftPostConfirm
        isRequesting={isRequestingUpdatePosts}
        open={isOpenDeleteDialog}
        postCreatedTime={post.post.create_time || ""}
        onDeleteConfirm={() => {
          if (!prepareDeletePostID) {
            return;
          }
          onDeletePost(prepareDeletePostID);
          setIsOpenDeleteDialog(false);
          setPrepareDeletePostID(null);
        }}
        onCancel={() => {
          setIsOpenDeleteDialog(false);
          setPrepareDeletePostID(null);
        }}
      />
    </>
  );
}

export default PostList;
