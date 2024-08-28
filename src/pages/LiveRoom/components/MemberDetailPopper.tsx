import { useState } from "react";
import Box from "@mui/material/Box";
import Popper, { PopperPlacementType } from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import { MEMBER_INFO } from "@pages/LiveRoom/apis/legacy";
import { FANS_POST_COMMENT, IG_MEDIA_COMMENT } from "../apis/facebook";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm, Controller } from "react-hook-form";
import DialogActions from "@mui/material/DialogActions";
import { postBindMemberAsync } from "@store/liveroomSlice";
import { selectApis } from "@store/apiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setNotice } from "@store/commonSlice";
interface PROPS {
  anchorEl: null | HTMLElement;
  id: string;
  placement: PopperPlacementType | undefined;
  detail: MEMBER_INFO | null;
  fbComment?: FANS_POST_COMMENT;
  igComment?: IG_MEDIA_COMMENT;
  platform: "facebook.page" | "facebook.group" | "instagram";
}

function MemberDetailPopper(props: PROPS) {
  const { anchorEl, id, placement, detail, fbComment, igComment, platform } =
    props;
  const open = Boolean(anchorEl);
  const apis = useAppSelector(selectApis);
  const [isBinding, setIsBinding] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const dispatch = useAppDispatch();
  const detailId = open ? `detail-popper-${id}` : undefined;
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });
  const getDetailColor = (detail: MEMBER_INFO | null) => {
    if (!detail || !detail?.is_member) {
      return "warning";
    } else {
      return detail?.data?.is_enable ? "success" : "default";
    }
  };

  const getDetailName = (detail: MEMBER_INFO | null) => {
    if (!detail || !detail?.is_member) {
      return "未綁定";
    } else {
      return detail?.data?.is_enable ? detail?.data?.member_type : "黑名單";
    }
  };

  const onSubmit = async (data: any) => {
    setIsRequesting(true);
    dispatch(
      postBindMemberAsync({
        url: apis?.bind_member as string,
        detailUrl: apis?.member as string,
        userId: platform.includes("facebook")
          ? (fbComment?.from?.id as string)
          : (igComment?.from?.id as string),
        email: data?.email,
        onSuccess: (res: { success: boolean; error?: string }) => {
          if (!res.success) {
            dispatch(
              setNotice({
                isErroring: true,
                message: res.error,
                type: "error",
              })
            );
          } else {
            dispatch(
              setNotice({
                isErroring: true,
                message: "綁定會員成功",
                type: "success",
              })
            );
            setIsBinding(false);
          }
          setIsRequesting(false);
        },
      })
    );
  };

  return (
    <>
      <Popper
        id={detailId}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{ zIndex: 999 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box
              sx={{
                p: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow:
                  "0px 8px 10px -5px rgba(0, 0, 0, 0.20), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)",
              }}
            >
              <List
                disablePadding
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
              >
                <ListItem disablePadding>
                  <ListItemAvatar>
                    <Avatar
                      alt={
                        platform.includes("facebook")
                          ? fbComment?.from?.name
                          : igComment?.from?.username
                      }
                      src={
                        platform.includes("facebook")
                          ? fbComment?.from?.picture?.data?.url
                          : ""
                      }
                    >
                      {platform.includes("facebook")
                        ? fbComment?.from?.name.charAt(0)
                        : igComment?.from?.username.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="subtitle1">
                            {platform.includes("facebook")
                              ? fbComment?.from?.name
                              : igComment?.from?.username}
                          </Typography>
                          <Chip
                            color={getDetailColor(detail)}
                            label={getDetailName(detail)}
                            size="small"
                            variant="outlined"
                            sx={{ opacity: 0.8, ml: 1 }}
                          />
                        </Box>
                        {!detail?.is_member && (
                          <Tooltip title="綁定會員" placement="top" arrow>
                            <IconButton
                              onClick={() => setIsBinding(true)}
                              sx={{ display: "flex", ml: 3 }}
                            >
                              <PersonAddAltIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={detail?.data?.account || ""}
                  />
                </ListItem>
                <Divider />
                {detail?.is_member && (
                  <>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "rgba(0, 0, 0, 0.60)",
                              }}
                            >
                              <MonetizationOnIcon
                                sx={{ width: 16, color: "rgba(0, 0, 0, 0.60)" }}
                              />
                              消費：{detail?.data?.total_paid}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                ml: 2,
                                color: "rgba(0, 0, 0, 0.60)",
                              }}
                            >
                              <FormatListBulletedIcon
                                sx={{ width: 16, color: "rgba(0, 0, 0, 0.60)" }}
                              />
                              下單：{detail?.data?.total_order}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>

                    {detail.data?.member_actions?.map((action, index) => (
                      <Box key={index}>
                        <Divider />
                        <ListItem disablePadding>
                          <ListItemText
                            primary={
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Link
                                  sx={{
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    mt: 1,
                                  }}
                                  href={action.url}
                                  target="_"
                                >
                                  <Typography variant="body2">
                                    {action.name}
                                  </Typography>
                                </Link>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </>
                )}
                {!detail?.is_member && isBinding && (
                  <ListItem disablePadding>
                    <Box sx={{ width: "100%" }}>
                      <Box>
                        <Typography variant="subtitle1">綁定會員</Typography>
                      </Box>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <TextField
                              autoFocus
                              margin="dense"
                              id="email"
                              label="email"
                              type="email"
                              fullWidth
                              placeholder="請輸入要綁定的會員email"
                              variant="outlined"
                              {...register("email", {
                                required: true,
                                pattern: {
                                  value:
                                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                  message: "email格式不正確",
                                },
                              })}
                            />
                          )}
                        />
                        {errors.email && (
                          <Typography color={"error"} variant="body2">
                            {errors.email.message}
                          </Typography>
                        )}
                      </form>
                      <DialogActions>
                        <Button
                          onClick={() => {
                            setIsBinding(false);
                            reset();
                          }}
                        >
                          取消
                        </Button>
                        <LoadingButton
                          variant="contained"
                          loading={isRequesting}
                          onClick={handleSubmit(onSubmit)}
                        >
                          確定
                        </LoadingButton>
                      </DialogActions>
                    </Box>
                  </ListItem>
                )}
              </List>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}

export default MemberDetailPopper;
