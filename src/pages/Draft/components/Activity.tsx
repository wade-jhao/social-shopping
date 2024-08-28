import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
// import { selectUserInfo } from "@store/userSlice";
import {
  getActivityAsync,
  selectActivity,
  selectActivityPosts,
  enableActivityAsync,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
// import IconButton from "@mui/material/IconButton";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import SwitchPostDialog from "./SwitchPostDialog";
import instgram from "@assets/instgram.png";
import FacebookIcon from "@mui/icons-material/Facebook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface PROPS {
  channel: string;
  onSwitchChannel: Function;
}
function Activity(props: PROPS) {
  const { channel } = props;
  let { activityId, postId } = useParams();
  // const userInfo = useAppSelector(selectUserInfo);
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const [isEnableActivity, setIsEnableActivity] = useState(false);
  const dispatch = useAppDispatch();
  const curActivityPosts = useAppSelector(selectActivityPosts);
  const apis = useAppSelector(selectApis);
  const activity = useAppSelector(selectActivity);
  // const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    dispatch(
      getActivityAsync({
        urlActivity: apis?.activity as string,
        urlDispatch: apis?.post as string,
        activityId: activityId as string,
        postId: postId as string,
      })
    );
  }, []);

  useEffect(() => {
    if (activity) {
      setIsEnableActivity(activity.is_enable);
    }
  }, [activity]);

  const getplatformIcon = () => {
    if (!activity) {
      return null;
    }
    if (channel.includes("facebook")) {
      return (
        <FacebookIcon sx={{ cursor: "pointer", color: "rgb(25, 118, 210)" }} />
      );
    } else {
      return <img src={instgram} style={{ height: 24 }} alt="instagram" />;
    }
  };

  const getplatformName = () => {
    if (!activity) {
      return null;
    }
    if (channel === "facebook.page") {
      return "粉絲專頁";
    } else if (channel === "facebook.group") {
      return "社團";
    } else {
      return "Instagram";
    }
  };

  // const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorElUser(event.currentTarget);
  // };

  // const handleCloseUserMenu = (func?: Function) => {
  //   func && func();
  //   setAnchorElUser(null);
  // };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    dispatch(
      enableActivityAsync({
        url: apis?.activity as string,
        activityId: activityId as string,
        isEnable: value,
        onSuccess: (res: any) => {
          if (res?.success) {
            setIsEnableActivity(value);
          }
        },
      })
    );
  };

  return (
    <>
      {activity && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 48,
            background: "#fff",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              left: "24px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Typography
                color="rgba(0, 0, 0, 0.6)"
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center" }}
              >
                直播草稿
              </Typography>
              <ExpandMoreIcon sx={{ width: 16 }} />
            </Box>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1}
            >
              {channel !== "" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {getplatformIcon()}
                  {activity && (
                    <Typography sx={{ ml: 1 }} variant="body2">
                      {getplatformName()}
                    </Typography>
                  )}
                </Box>
              )}
              <Chip
                color="primary"
                label="草稿"
                size="small"
                sx={{ opacity: 0.8, ml: 1 }}
              />
            </Stack>
          </Box>
          <Typography
            color="rgba(0, 0, 0, 0.6)"
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {`活動：${activity?.title}`}
          </Typography>
          <FormGroup sx={{ ml: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  id="switch-activity"
                  checked={isEnableActivity}
                  onChange={handleSwitchChange}
                />
              }
              label={
                <Typography variant="body2">
                  {isEnableActivity ? "已啟用" : "未啟用"}
                </Typography>
              }
            />
          </FormGroup>
          {/* <Box
            sx={{
              flexGrow: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              right: "24px",
            }}
          >
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mr: 1 }}>
              <Avatar
                alt={userInfo?.facebook_account.username}
                src={userInfo?.facebook_account.avatar_url}
              >
                {userInfo?.facebook_account.username.charAt(0) || ""}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={() => handleCloseUserMenu()}
            >
              <MenuItem
                key={-1}
                children={
                  <>
                    <Avatar
                      alt={userInfo?.facebook_account.username}
                      src={userInfo?.facebook_account.avatar_url}
                      sx={{ mr: 1 }}
                    >
                      {userInfo?.facebook_account.username.charAt(0) || ""}
                    </Avatar>
                    <span>
                      <Typography variant="subtitle1">
                        {`${userInfo?.facebook_account.username} (${userInfo?.facebook_account.asid})`}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(0,0,0,.55)" }}
                      >
                        {userInfo?.facebook_account.email}
                      </Typography>
                    </span>
                  </>
                }
              ></MenuItem>
              <Divider />
            </Menu>
          </Box> */}
        </Box>
      )}
      {!activity && (
        <Skeleton
          animation="wave"
          variant="rectangular"
          height={26}
          sx={{ mt: 1, mb: 1 }}
        />
      )}
      <SwitchPostDialog
        isVisible={isSwitchingPost}
        activityPosts={curActivityPosts}
        onCancel={() => setIsSwitchingPost(false)}
      />
    </>
  );
}

export default Activity;
