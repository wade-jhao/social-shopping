import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import dayjs, { Dayjs } from "dayjs";
import { selectApis } from "@store/apiSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import Switch from "@mui/material/Switch";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import { setActivityPostDiscount } from "../apis/legacy";
import {
  selectActivity,
  getDiscountAsync,
  setDiscount,
  selectDiscount,
} from "@store/liveroomSlice";
import { setNotice } from "@store/commonSlice";

interface PROPS {
  onAction: Function;
}

function ActivityDiscount(props: PROPS) {
  const { onAction } = props;
  const refForm = useRef<any>(null);
  const { activityId, postId } = useParams();
  const activity = useAppSelector(selectActivity);
  const initDiscount = useAppSelector(selectDiscount);
  const matches = useMediaQuery("(min-width:600px)");
  const apis = useAppSelector(selectApis);
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [isReady, setIsReady] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [isEnable, setIsEnable] = useState(false);
  const dispatch = useAppDispatch();
  const arrSkelton = new Array(5).fill(0);
  useEffect(() => {
    if (initDiscount) {
      setIsReady(true);
      if (initDiscount?.start_time && initDiscount?.end_time) {
        setStartTime(dayjs(initDiscount?.start_time));
        setEndTime(dayjs(initDiscount?.end_time));
      } else {
        setStartTime(dayjs(activity?.start_time));
        setEndTime(dayjs(activity?.end_time));
      }
    } else {
      dispatch(
        getDiscountAsync({
          url: apis?.activity_post_discount as string,
          activityId: activityId as string,
          postId: postId as string,
        })
      );
    }
  }, [initDiscount]);

  useEffect(() => {
    checkIsDataBetween();
    setIsSetting(initDiscount?.type === "fix");
  }, [initDiscount]);

  const onSubmit = (data: any) => {
    setActivityPostDiscount(
      apis?.activity_post_discount as string,
      activityId as string,
      postId as string,
      dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endTime).format("YYYY-MM-DD HH:mm:ss"),
      data.enable ? "fix" : "none",
      data.value
    ).then((res) => {
      if (res.success) {
        dispatch(setDiscount(res.data));
        dispatch(
          setNotice({
            isErroring: true,
            message: "設定折扣成功",
            type: "success",
          })
        );
        setTimeout(() => onAction(), 1000);
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
  console.log(errors);
  const discountList: { value: string; label: string }[] = [
    { value: "fix", label: "固定金額" },
  ];

  const checkIsDataBetween = () => {
    if (!initDiscount) {
      return;
    }
    const startTime = new Date(initDiscount?.start_time);
    const endTime = new Date(initDiscount?.end_time);
    const currentTime = new Date();
    setIsEnable(
      initDiscount.type === "fix" &&
        currentTime >= startTime &&
        currentTime <= endTime
    );
  };

  return (
    <>
      {isReady && (
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
            <Chip
              color={isEnable ? "primary" : "default"}
              label={isEnable ? "已生效" : "未生效"}
              size="small"
              sx={{ opacity: 0.8, ml: 1 }}
            />
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
                  defaultValue={initDiscount?.type === "fix"}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            if (!event.target.checked) {
                              const newValue = getValues();
                              newValue["enable"] = false;
                              onSubmit(newValue);
                            }

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
                      defaultValue={Number(initDiscount?.value) || 0}
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
                <Box sx={{ width: "100%" }}>
                  <Button
                    size="large"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit(onSubmit)}
                    sx={{ mt: 2, textAlign: "center" }}
                    //   disabled={comments.length === 0}
                  >
                    保存
                  </Button>
                </Box>
              </Box>
            )}
          </form>
        </LocalizationProvider>
      )}
      {!isReady &&
        arrSkelton.map((item, index) => (
          <Skeleton
            key={index}
            animation="wave"
            variant="rectangular"
            height={40}
            sx={{ mt: 1, mb: 1 }}
          />
        ))}
    </>
  );
}

export default ActivityDiscount;
