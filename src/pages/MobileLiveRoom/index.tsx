import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import ProductList from "./components/ProductList";
import LivePost from "./components/LivePost";
import FBComments from "./components/FBComments";
import IgComments from "./components/IgComments";
import FBGroupComments from "./components/FBGroupComments";
import { selectApis } from "@store/apiSlice";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VideocamIcon from "@mui/icons-material/Videocam";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CommentIcon from "@mui/icons-material/Comment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import { setNotice } from "@store/commonSlice";
import DialogTitle from "@mui/material/DialogTitle";
import OrderPanel from "./components/OrderPanel";
import MyProfile from "./components/MyProfile";
import Activity from "./components/Activity";
import Typography from "@mui/material/Typography";
import Textarea from "@mui/joy/Textarea";
import {
  getNewFansPageAsync,
  selectActivity,
  deleteProductAsync,
  selectProducts,
  selectFansPage,
  setCommentAsync,
  selectPost,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import PostIsDeleteRemind from "@components/PostIsDeleteRemind";
import DialogPostIsDeleteRemind from "@pages/LiveRoom/components/DialogPostIsDeleteRemind";
import { useStreamStatus } from "@hooks/streamStatus";
import useBroadcastContent, {
  getPullOffVariantsContent,
} from "@hooks/broadcastContent";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface PROPS {
  fansPageId: string;
  postId: string;
}

function LiveRoom(props: PROPS) {
  const navigate = useNavigate();
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const curFanPage = useAppSelector(selectFansPage);
  const curPost = useAppSelector(selectPost);
  const curActivity = useAppSelector(selectActivity);
  const apis = useAppSelector(selectApis);
  const [liveRoomHeight, setLiveRoomHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const refBottomNavigation = useRef<any>(null);
  const [value, setValue] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeletingProds, setIsDeletingProds] = useState<boolean>(false);
  const productList = useAppSelector(selectProducts);
  const [checkedProducts, setCheckedProducts] = useState<string[]>([]);
  const [isBroadcastingProds, setIsBroadcastingProds] = useState(false);
  const [productInfo, setProductInfo] = useState("");
  const [isDialogPostIsDeleteRemindOpen, setIsDialogPostIsDeleteRemindOpen] =
    useState(false);
  const { IS_STREAMING } = useStreamStatus();
  const { getMultipleProductContent, getDiscountContent } =
    useBroadcastContent();
  const [boardCastContentStatus, setBoardCastContentStatus] = useState<{
    isAddSizeList: boolean;
    isAddLiveDiscountPrice: boolean;
    isAddPullOffVariants: boolean;
  }>({
    isAddSizeList: false,
    isAddLiveDiscountPrice: false,
    isAddPullOffVariants: false,
  });
  useEffect(() => {
    if (curPost?.error) {
      setIsDialogPostIsDeleteRemindOpen(true);
    }
  }, [curPost?.error]);
  const navigationList = [
    {
      label: "商品",
      icon: StorefrontIcon,
    },
    {
      label: "直播",
      icon: VideocamIcon,
    },
    {
      label: "喊單",
      icon: ShoppingCartIcon,
    },
    {
      label: "留言",
      icon: CommentIcon,
    },
    {
      label: "更多",
      icon: MoreHorizIcon,
    },
  ];

  useEffect(() => {
    setLiveRoomHeight(
      window.innerHeight - refBottomNavigation?.current?.clientHeight
    );
  }, []);

  useEffect(() => {
    if (typeof IS_STREAMING === "string" && IS_STREAMING === "UNKONWN") {
      setIsDialogPostIsDeleteRemindOpen(true);
    }
  }, [IS_STREAMING]);

  useEffect(() => {
    if (curActivity) {
      dispatch(
        getNewFansPageAsync({
          url: apis?.social_accounts as string,
          fansPageId: curActivity.dispatch?.fb_fanspage_id as string,
          platform: curActivity.dispatch?.platform as string,
        })
      );
    }
  }, [curActivity]);

  const onBroadCast = () => {
    if (!productList) {
      return;
    }
    let selectedList = productList.filter((item) =>
      checkedProducts.includes(item.id)
    );
    let info = getMultipleProductContent(selectedList, boardCastContentStatus);
    info = info.trim();
    setProductInfo(info);
    setIsBroadcastingProds(true);
    // if (curActivity?.dispatch?.platform !== "facebook.page") {
    //   navigator.clipboard.writeText(info).then(() => {
    //     dispatch(
    //       setNotice({
    //         isErroring: true,
    //         message: "複製商品規格成功",
    //         type: "success",
    //       })
    //     );
    //   });
    // } else {
    //   setProductInfo(info);
    //   setIsBroadcastingProds(true);
    // }
  };

  const onBroadCastStatusChange = (options: {
    isAddSizeList: boolean;
    isAddLiveDiscountPrice: boolean;
    isAddPullOffVariants: boolean;
  }) => {
    if (!productList) {
      return;
    }
    const { isAddSizeList, isAddLiveDiscountPrice, isAddPullOffVariants } =
      options;
    let selectedList = productList.filter((item) =>
      checkedProducts.includes(item.id)
    );
    let info = getMultipleProductContent(selectedList, options);
    const is_any_of_product_has_size_table = selectedList.some(
      (product) => product.size_table !== ""
    );
    const discountContent = getDiscountContent(selectedList[0]);
    const is_any_of_product_variants_pull_off = selectedList.some(
      (product) => getPullOffVariantsContent(product) !== ""
    );
    if (!is_any_of_product_has_size_table && isAddSizeList) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "選擇的商品沒有設定尺寸表",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({ ...prev, isAddSizeList: false }));
      return;
    }
    if (discountContent === "" && isAddLiveDiscountPrice) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "活動沒有設定直播折扣",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({
        ...prev,
        isAddLiveDiscountPrice: false,
      }));
      return;
    }
    if (!is_any_of_product_variants_pull_off && isAddPullOffVariants) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "所有商品皆沒有下架的規格",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({
        ...prev,
        isAddLiveDiscountPrice: false,
      }));
      return;
    }
    info = getMultipleProductContent(selectedList, options);
    setProductInfo(info);
    setBoardCastContentStatus(options);
    dispatch(
      setNotice({
        isErroring: true,
        message: "成功更新曝光商品內文",
        type: "success",
      })
    );
  };

  const onSendRequest = () => {
    if (!productInfo) {
      return;
    }
    if (curActivity?.dispatch?.platform !== "facebook.page") {
      navigator.clipboard.writeText(productInfo).then(() => {
        dispatch(
          setNotice({
            isErroring: true,
            message: "複製商品規格成功",
            type: "success",
          })
        );
        setIsBroadcastingProds(false);
        setProductInfo("");
      });
    } else {
      if (curFanPage && curActivity) {
        setIsRequesting(true);
        dispatch(
          setCommentAsync({
            accessToken: curFanPage.access_token,
            postId: curActivity?.dispatch?.fb_post_id as string,
            comment: productInfo,
            onSuccess: () => {
              setIsRequesting(false);
              dispatch(
                setNotice({
                  isErroring: true,
                  message: "曝光商品成功",
                  type: "success",
                })
              );
              setIsBroadcastingProds(false);
              setProductInfo("");
            },
          })
        );
      }
    }
  };

  const getSocialComment = () => {
    switch (curActivity?.dispatch?.platform) {
      case "facebook.page":
        return <FBComments height={liveRoomHeight} />;
      case "facebook.group":
        return <FBGroupComments isLoading={false} height={liveRoomHeight} />;
      case "instagram":
        return <IgComments height={liveRoomHeight} />;
      default:
        return null;
    }
  };
  return (
    <>
      <Box sx={{ pb: 7 }} ref={ref}>
        <Box id="mobile-header" />
        <Activity
          channel={curActivity?.dispatch?.platform as string}
          onSwitchChannel={() => {}}
        />
        <Box
          sx={{
            display: value === 0 ? "block" : "none",
            overflowX: "hidden",
          }}
        >
          <ProductList
            onBroadcastProducts={(value: boolean) => onBroadCast()}
            onDeleteProds={(isDeleting: boolean) =>
              setIsDeletingProds(isDeleting)
            }
            onCheckedChange={(checked: string[]) => setCheckedProducts(checked)}
            checkedList={checkedProducts}
          />
        </Box>
        <Box
          sx={{
            display: value === 1 ? "block" : "none",
          }}
        >
          {curPost?.error && <PostIsDeleteRemind />}
          <LivePost height={liveRoomHeight} />
        </Box>
        <Box
          sx={{
            display: value === 2 ? "block" : "none",
          }}
        >
          {curPost?.error && <PostIsDeleteRemind />}
          <OrderPanel height={liveRoomHeight} />
        </Box>
        <Box
          sx={{
            display: value === 3 ? "block" : "none",
            overflowX: "hidden",
          }}
        >
          {getSocialComment()}
        </Box>
        <Box
          sx={{
            display: value === 4 ? "block" : "none",
          }}
        >
          <MyProfile height={liveRoomHeight} />
        </Box>

        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <Box sx={{ width: "100%" }}>
            <BottomNavigation
              ref={refBottomNavigation}
              showLabels
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            >
              {navigationList.map((navigation, index) => (
                <BottomNavigationAction
                  key={index}
                  label={navigation.label}
                  icon={<navigation.icon />}
                />
              ))}
            </BottomNavigation>
          </Box>
        </Paper>
      </Box>
      <Dialog
        open={isDeletingProds}
        onClose={() => setIsDeletingProds(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">刪除商品</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ display: "flex" }}
          >
            <Typography>
              請確定您是否要刪除{checkedProducts.length}個商品
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeletingProds(false)}>取消</Button>
          <LoadingButton
            variant="contained"
            loading={isRequesting}
            onClick={() => {
              if (checkedProducts.length) {
                setIsRequesting(true);
                dispatch(
                  deleteProductAsync({
                    url: apis?.activity_post_products as string,
                    activityId: activityId as string,
                    postId: postId as string,
                    prodId: checkedProducts.toString(),
                    onSuccess: (val: any) => {
                      setIsRequesting(false);
                      if (val) {
                        setIsDeletingProds(false);
                        setCheckedProducts([]);
                        dispatch(
                          setNotice({
                            isErroring: true,
                            message: "刪除商品成功",
                            type: "success",
                          })
                        );
                      } else {
                        dispatch(
                          setNotice({
                            isErroring: true,
                            message: "至少保留一個直播商品",
                            type: "error",
                          })
                        );
                      }
                    },
                  })
                );
              } else {
                setIsDeletingProds(false);
                dispatch(
                  setNotice({
                    isErroring: true,
                    message: "請先選擇商品",
                    type: "info",
                  })
                );
              }
            }}
            autoFocus
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={false}
        onClose={() => navigate(`/liveroom/activities/${activityId}`)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">IG直播</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            此場IG直播已經結束，請至後台查看留言和喊單消息。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => navigate(`/liveroom/activities/${activityId}`)}
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth={true}
        open={isBroadcastingProds}
        onClose={() => setIsBroadcastingProds(false)}
      >
        <DialogTitle>曝光商品</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <Box sx={{ mt: 1, mb: 2 }}>
            <FormGroup sx={{ display: "block" }}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="加入尺寸表"
                checked={boardCastContentStatus.isAddSizeList}
                onChange={(e, checked) => {
                  onBroadCastStatusChange({
                    ...boardCastContentStatus,
                    isAddSizeList: checked,
                  });
                }}
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="加入直播價"
                checked={boardCastContentStatus.isAddLiveDiscountPrice}
                onChange={(e, checked) => {
                  onBroadCastStatusChange({
                    ...boardCastContentStatus,
                    isAddLiveDiscountPrice: checked,
                  });
                }}
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="加入下架規格提示"
                checked={boardCastContentStatus.isAddPullOffVariants}
                onChange={(e, checked) => {
                  onBroadCastStatusChange({
                    ...boardCastContentStatus,
                    isAddPullOffVariants: checked,
                  });
                }}
              />
            </FormGroup>
          </Box>
          <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              margin: "auto",
              width: "100%",
            }}
          >
            <Textarea
              sx={{
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                padding: 1,
              }}
              autoFocus
              size="lg"
              placeholder="請輸入商品規格"
              variant="outlined"
              minRows={3}
              maxRows={10}
              color="neutral"
              value={productInfo}
              onChange={(e: any) => {
                setProductInfo(e.target.value);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBroadcastingProds(false)}>取消</Button>
          <LoadingButton
            variant="contained"
            loading={isRequesting}
            onClick={onSendRequest}
          >
            {curActivity?.dispatch?.platform !== "facebook.page"
              ? "複製"
              : "送出"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <DialogPostIsDeleteRemind
        isOpen={isDialogPostIsDeleteRemindOpen}
        setOpen={setIsDialogPostIsDeleteRemindOpen}
      />
    </>
  );
}

export default LiveRoom;
