import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea, CircularProgress, Grid } from "@mui/material";
import FacebookChannelIcon from "@assets/facebook-channel.svg";
import FacebookGroupChannelIcon from "@assets/facebook-group-channel.svg";
import InstagramChannelIcon from "@assets/instagram-channel.svg";
import { useAppSelector } from "@store/hooks";
import { selectSocialAccounts } from "@store/liveroomSlice";
import AnnouncementsActivityChannelModal from "@components/Announcements/AnnouncementsActivityChannelModal";
interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
}
function SelectChannelDialog(props: PROPS) {
  const { isVisible, onOk, onCancel } = props;
  const curPlatform = useAppSelector(selectSocialAccounts);

  const refIgIcon = useRef<any>(null);
  const defaultChannel =
    (curPlatform &&
      Object.entries(curPlatform).find(
        ([platform, value]) => value.length > 0
      )?.[0]) ??
    "";
  const [curChannel, setCurrentChannel] = useState(defaultChannel ?? "");
  const channelCardInfo = [
    {
      channel: "facebook.page",
      img: FacebookChannelIcon,
      title: "Facebook 粉絲專頁",
    },
    {
      channel: "facebook.group",
      img: FacebookGroupChannelIcon,
      title: "Facebook 社團",
    },
    {
      channel: "instagram",
      img: InstagramChannelIcon,
      title: "Instagram",
    },
  ];

  useEffect(() => {
    setCurrentChannel(defaultChannel);
  }, [defaultChannel]);

  const nextStepButtonDisabled = !curChannel || curChannel === "";

  const ChannelCard = (channelCardInfo: {
    channel: string;
    img: string;
    title: string;
  }) => {
    const selected = curChannel === channelCardInfo.channel;
    const disabled = curPlatform
      ? curPlatform[channelCardInfo.channel].length === 0
      : false;
    return (
      <Grid item xs={12} sm={4}>
        <Card
          sx={{
            outline: selected ? "2px solid rgb(25, 118, 210)" : "unset",
            height: "100%",
            cursor: disabled ? "default" : "pointer",
          }}
          onClick={() => {
            if (disabled) return;
            setCurrentChannel(channelCardInfo.channel);
          }}
        >
          <CardActionArea sx={{ height: "100%" }} disabled={disabled}>
            <CardMedia
              component="img"
              src="img"
              alt={channelCardInfo.channel}
              image={channelCardInfo.img}
              sx={{
                height: refIgIcon.current
                  ? refIgIcon?.current?.clientHeight
                  : "auto",
                filter: disabled ? "grayscale(100%)" : "unset",
              }}
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                textAlign={"center"}
                color={disabled ? "text.disabled" : "text.primary"}
              >
                {channelCardInfo.title}
                {disabled && (
                  <>
                    <br />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      尚未綁定
                    </Typography>
                  </>
                )}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>選擇直播來源</DialogTitle>
      <DialogContent dividers={true}>
        <Box sx={{ mb: 2 }}>
          <AnnouncementsActivityChannelModal />
        </Box>
        <Grid container spacing={3} alignItems="stretch" sx={{ pt: 2 }}>
          {!curPlatform && (
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <CircularProgress />
            </Grid>
          )}
          {curPlatform &&
            channelCardInfo.map((item, index) => (
              <ChannelCard key={index} {...item} />
            ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCancel()}>取消</Button>
        <Button
          onClick={() => {
            window.localStorage.setItem("is_new_draft", "true");
            if (nextStepButtonDisabled) {
              return;
            }
            onOk(curChannel);
          }}
          disabled={nextStepButtonDisabled}
        >
          下一步
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectChannelDialog;
