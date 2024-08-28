import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { useParams } from "react-router-dom";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
// import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";
import ActivityDiscount from "./ActivityDiscount";
// import { selectUserInfo } from "@store/userSlice";
// import { clearUserInfo } from "@store/userSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  selectActivity,
  enableActivityAsync,
  getDiscountAsync,
  selectDiscount,
} from "@store/liveroomSlice";
import PercentIcon from "@mui/icons-material/Percent";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { selectApis } from "@store/apiSlice";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
// import Cookies from "js-cookie";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
interface PROPS {
  height?: number;
}

function MyProfile(props: PROPS) {
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const initDiscount = useAppSelector(selectDiscount);
  // const userInfo = useAppSelector(selectUserInfo);
  const curActivity = useAppSelector(selectActivity);
  const apis = useAppSelector(selectApis);
  const [isSettingDiscount, setIsSettingDiscount] = useState(false);
  const [isEnableActivity, setIsEnableActivity] = useState(false);
  // const onLogout = async () => {
  //   await clearAllStorageUserInfo();
  //   await setTimeout(() => {
  //     window.location.href = "/login";
  //   }, 1000);
  // };

  const renderDiscountIcon = () => {
    const statusIcon = () => {
      if (!initDiscount) {
        return null;
      }
      if (initDiscount.type === "none") {
        return (
          <div
            style={{
              width: 6,
              height: 6,
              background: "red",
              borderRadius: "50%",
              position: "absolute",
              right: 23,
              bottom: 0,
            }}
          />
        );
      } else {
        return (
          <CheckCircleOutlineIcon
            style={{
              width: 10,
              height: 10,
              position: "absolute",
              right: 23,
              bottom: 0,
            }}
            color="success"
          />
        );
      }
    };
    return (
      <Box sx={{ position: "relative" }}>
        <PercentIcon />
        {statusIcon()}
      </Box>
    );
  };

  useEffect(() => {
    if (curActivity) {
      setIsEnableActivity(curActivity.is_enable);
    }
  }, [curActivity]);

  useEffect(() => {
    if (!initDiscount) {
      dispatch(
        getDiscountAsync({
          url: apis?.activity_post_discount as string,
          activityId: activityId as string,
          postId: postId as string,
        })
      );
    }
  }, [initDiscount]);

  // remove all storage user info, includes redux, localstorage, cookies
  // const clearAllStorageUserInfo = () => {
  //   window.localStorage.removeItem("user_id");
  //   window.localStorage.removeItem("user_info");
  //   Cookies.remove("fb_access_token");
  //   dispatch(clearUserInfo());
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
      <Box
        sx={{
          height: "fit-content",
          boxSizing: "-moz-initial",
          display: "block",
          background: "#fff",
          width: "100%",
          padding: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            right: "10px",
            minHeight: "48px",
            width: "100%",
          }}
        >
          <Typography
            color="rgba(0, 0, 0, 0.8)"
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center" }}
          >
            活動：{curActivity?.title}
          </Typography>
          <FormGroup sx={{ ml: 2 }}>
            <FormControlLabel
              control={
                <Switch
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
        </Box>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          disablePadding
        >
          <ListItem disablePadding disableGutters>
            <ListItemButton
              role={undefined}
              onClick={() => setIsSettingDiscount(true)}
              dense
              disableGutters
            >
              <ListItemAvatar>{renderDiscountIcon()}</ListItemAvatar>
              <ListItemText>折扣設定</ListItemText>
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding disableGutters>
            <ListItemAvatar>
              <Avatar
                alt={userInfo?.facebook_account.username}
                src={userInfo?.facebook_account.avatar_url}
              >
                {userInfo?.facebook_account.username.charAt(0) || ""}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1">
                  {`${userInfo?.facebook_account.username} (${userInfo?.facebook_account.asid})`}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: "rgba(0,0,0,.55)" }}>
                  {userInfo?.facebook_account.email}
                </Typography>
              }
            />
          </ListItem> */}
        </List>
        {/* <Button
          size="small"
          variant="contained"
          sx={{ width: "100%", mt: 2, mb: 1 }}
          onClick={onLogout}
        >
          登出
        </Button> */}
      </Box>
      <Dialog
        open={isSettingDiscount}
        onClose={() => setIsSettingDiscount(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">折扣設定</DialogTitle>
        <DialogContent>
          <ActivityDiscount
            onAction={() => {
              setIsSettingDiscount(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingDiscount(false)} autoFocus>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyProfile;
