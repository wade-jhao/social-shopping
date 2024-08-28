import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CircularProgress } from "@mui/material";
import EditDraft from "@assets/editDraft.svg";
import FacebookChannelIcon from "@assets/facebook-channel.svg";
import FacebookGroupChannelIcon from "@assets/facebook-group-channel.svg";
import InstagramChannelIcon from "@assets/instagram-channel.svg";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import dayjs, { Dayjs } from "dayjs";
import { selectApis } from "@store/apiSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import Switch from "@mui/material/Switch";
import { setActivityPostDiscount } from "../apis/legacy";
import { setNotice } from "@store/commonSlice";
import { selectActivity } from "@store/activitySlice";
import { selectSocialAccounts } from "@store/liveroomSlice";
import { useNavigate } from "react-router-dom";
import Announcements from "@components/Announcements/AnnouncementsActivityChannelModal";
interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
  draftInfo: {
    acivityId: string;
    postId: string;
  } | null;
}
function SelectChannelDialog(props: PROPS) {
  const navigate = useNavigate();
  const { isVisible, onOk, onCancel, draftInfo } = props;
  const matches = useMediaQuery("(min-width:600px)");
  const refIgIcon = useRef<any>(null);
  const curActivity = useAppSelector(selectActivity);
  const curPlatform = useAppSelector(selectSocialAccounts);
  const defaultChannel =
    (curPlatform &&
      Object.entries(curPlatform).find(
        ([platform, value]) => value.length > 0
      )?.[0]) ??
    "";
  const [curChannel, setCurrentChannel] = useState(defaultChannel ?? "");
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const dispatch = useAppDispatch();
  const steps = ["選擇直播來源", "設定直播折扣"];
  const { register, setValue, handleSubmit, control } = useForm();
  const apis = useAppSelector(selectApis);
  const [isSetting, setIsSetting] = useState(false);
  const [startTime, setStartTime] = useState<Dayjs | null>();
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const refForm = useRef<any>(null);

  useEffect(() => {
    if (curActivity) {
      setStartTime(dayjs(curActivity.start_time));
      setEndTime(dayjs(curActivity.end_time));
    }
  }, [curActivity]);

  const discountList: { value: string; label: string }[] = [
    { value: "fix", label: "固定金額" },
  ];

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };
  const handlePrev = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const onSubmit = (data: any) => {
    setActivityPostDiscount(
      apis?.activity_post_discount as string,
      draftInfo?.acivityId || "",
      draftInfo?.postId || "",
      dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endTime).format("YYYY-MM-DD HH:mm:ss"),
      data.enable ? "fix" : "none",
      data.value
    ).then((res) => {
      if (res.success) {
        dispatch(
          setNotice({
            isErroring: true,
            message:
              res?.data?.type !== "none" ? "設定折扣成功" : "關閉折扣成功",
            type: "success",
          })
        );
        handleNext();
      } else {
        dispatch(
          setNotice({
            isErroring: true,
            message: "設定折扣失敗",
            type: "error",
          })
        );
      }
    });
  };

  useEffect(() => {
    if (draftInfo && isRequesting) {
      setIsRequesting(false);
      activeStep === 0 && handleNext();
    }
  }, [draftInfo]);
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
  const nextStepButtonDisabled = !curChannel || curChannel === "";

  useEffect(() => {
    setCurrentChannel(defaultChannel);
  }, [defaultChannel]);
  const ChannelCard = (channelCardInfo: {
    channel: string;
    img: string;
    title: string;
  }) => {
    const selected = curChannel === channelCardInfo.channel;
    const disabled =
      (curPlatform && curPlatform[channelCardInfo.channel].length === 0) ??
      false;
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
    <Dialog
      maxWidth="md"
      fullWidth={true}
      open={isVisible}
      onClose={() => {
        setActiveStep(0);
        onCancel();
      }}
    >
      <DialogTitle>新增直播</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 2 }}>
        <Box sx={{ width: "100%", mb: 1 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              if (isStepOptional(index)) {
                labelProps.optional = (
                  <Typography variant="caption">可稍後設定</Typography>
                );
              }
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Announcements />
        </Box>
        {activeStep === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Grid container spacing={3} alignItems="stretch">
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
          </Box>
        )}
        {activeStep === 1 && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": { m: 1, width: "25ch" },
                display: "flex",
                alignItems: "center",
              }}
              noValidate
              autoComplete="off"
            >
              <Typography variant="h6">直播折扣</Typography>
            </Box>
            <Box sx={{ color: "rgba(0, 0, 0, 0.60)", pl: 2 }}>
              <ul>
                <li>
                  <Typography variant="body2">
                    在指定留言時間內，只要在貼文中+1留言成功的消費者，即可享有此頁面所設定的折扣優惠。
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    請注意：若商品已放入消費者購物車，將無法新增或修改該商品的折扣優惠。
                  </Typography>
                </li>
              </ul>
            </Box>
            <form ref={refForm} onSubmit={handleSubmit(onSubmit)}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mt: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "row",
                    mt: 1,
                  }}
                >
                  <Controller
                    control={control}
                    name="enable"
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setIsSetting(event.target.checked);
                              setValue("enable", event.target.checked);
                            }}
                          />
                        }
                        label="啟用折扣設定"
                      />
                    )}
                  />
                </Box>
              </Box>
              {isSetting && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mt: 1,
                    }}
                  >
                    <Typography variant="subtitle2">折扣類型</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: "row",
                        mt: 1,
                      }}
                    >
                      <Controller
                        control={control}
                        name="type"
                        defaultValue={"fix"}
                        render={({ field }) => (
                          <RadioGroup
                            {...field}
                            aria-labelledby="type-radio-buttons-group-label"
                            name="radio-buttons-group"
                            row
                            aria-label="type"
                          >
                            {discountList.map((item, index) => (
                              <FormControlLabel
                                key={index}
                                value={item.value}
                                control={<Radio />}
                                label={item.label}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mt: 1,
                    }}
                  >
                    <Typography variant="subtitle2">折扣值</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: "row",
                        mt: 1,
                      }}
                    >
                      <Controller
                        control={control}
                        name="value"
                        defaultValue={0}
                        render={({ field }) => (
                          <TextField
                            placeholder="NT$"
                            margin="normal"
                            fullWidth
                            {...register("value")}
                            id="value"
                            label="折扣值"
                            type="number"
                            inputProps={{
                              step: 1,
                              min: 0,
                              max: 99999,
                            }}
                          />
                        )}
                      />{" "}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mt: 1,
                    }}
                  >
                    <Typography variant="subtitle2">活動有效期間</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: "row",
                        mt: 1,
                      }}
                    >
                      <Grid
                        container
                        spacing={1}
                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                        columns={12}
                      >
                        <Grid
                          item
                          xs={12}
                          sx={{ marginRight: "15px", marginTop: "10px" }}
                        >
                          {matches ? (
                            <DesktopDateTimePicker
                              label="開始時間"
                              value={startTime}
                              onChange={(value) => setStartTime(value)}
                            />
                          ) : (
                            <MobileDateTimePicker
                              label="開始時間"
                              value={startTime}
                              onChange={(value) => setStartTime(value)}
                            />
                          )}
                        </Grid>
                        <Grid item xs={12} sx={{ marginTop: "10px" }}>
                          {matches ? (
                            <DesktopDateTimePicker
                              label="結束時間"
                              value={endTime}
                              onChange={(value) => setEndTime(value)}
                            />
                          ) : (
                            <MobileDateTimePicker
                              label="結束時間"
                              value={endTime}
                              onChange={(value) => setEndTime(value)}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Box>
              )}
            </form>
          </LocalizationProvider>
        )}
        {activeStep === 2 && (
          <Box
            sx={{
              width: "100%",
              background: "#fff",
              textAlign: "center",
            }}
          >
            <img src={EditDraft}></img>
            <Typography variant="h6" sx={{ color: "#000" }}>
              您已準備好基本的直播設定
            </Typography>
            {curChannel === "instagram" && (
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                請確認您的 Instagram 商業帳號已開啟「
                <a
                  href="https://www.facebook.com/help/instagram/791161338412168/?helpref=uf_share"
                  target="_blank"
                >
                  允許使用訊息功能
                </a>
                」。 <br />
                Instagram 直播有 1
                小時的時長限制。如需更長的直播時間，請在結束直播前
                複製直播草稿，接著重新開播並連接到直播主控台。
              </Typography>
            )}
            <LoadingButton
              loading={isRequesting}
              variant="contained"
              sx={{ my: 3 }}
              onClick={() => {
                if (!draftInfo) return;
                setTimeout(() => {
                  navigate(
                    `/liveroom/draft/activities/${draftInfo.acivityId}/posts/${draftInfo.postId}`
                  );
                }, 1000);
              }}
            >
              繼續設定直播商品
            </LoadingButton>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep > 1 && (
          <Button
            sx={{ mr: "auto" }}
            onClick={() => {
              handlePrev();
            }}
          >
            上一步
          </Button>
        )}
        {activeStep <= 1 && (
          <Button
            onClick={() => {
              if (activeStep === 0) {
                setActiveStep(0);
                onCancel();
              } else {
                handleSkip();
              }
            }}
          >
            {activeStep === 0 ? "取消" : "略過"}
          </Button>
        )}

        {activeStep < 2 && (
          <LoadingButton
            loading={isRequesting}
            variant="contained"
            onClick={
              activeStep === 1
                ? handleSubmit(onSubmit)
                : () => {
                    // if (activeStep === 0 && !draftInfo) {
                    //   window.localStorage.setItem("is_new_draft", "true");
                    //   window.localStorage.setItem(
                    //     "draft_info",
                    //     `"${curChannel}"`
                    //   );
                    //   setIsRequesting(true);
                    //   onOk("create");
                    // }
                    if (activeStep === 0) {
                      // window.localStorage.setItem(
                      //   "draft_info",
                      //   `"${curChannel}"`
                      // );
                      // handleNext();
                      window.localStorage.setItem("is_new_draft", "true");
                      window.localStorage.setItem(
                        "draft_info",
                        `"${curChannel}"`
                      );
                      setIsRequesting(true);
                      if (nextStepButtonDisabled) {
                        return;
                      }
                      onOk("create");
                    } else {
                      handleNext();
                    }
                  }
            }
            disabled={nextStepButtonDisabled}
          >
            {activeStep === 0 ? "確認" : "保存"}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SelectChannelDialog;
