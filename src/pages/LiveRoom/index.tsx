import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { selectApis } from "@store/apiSlice";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Activity from "./components/Activity";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ProductList from "./components/ProductList";
import LivePost from "./components/LivePost";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import style from "./index.module.scss";
import TextPost from "./components/TextPost";
import FBComments from "./components/FBComments";
import FBGroupComments from "./components/FBGroupComments";
import IgComments from "./components/IgComments";
import RefreshIcon from "@mui/icons-material/Refresh";
import OrderPanel from "./components/OrderPanel";
import AddProductDialog from "./components/AddProductDialog-new";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OptionTabs from "./components/OptionTabs";
import Textarea from "@mui/joy/Textarea";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import PercentIcon from "@mui/icons-material/Percent";
import DeleteIcon from "@mui/icons-material/Delete";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { setNotice } from "@store/commonSlice";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ActivityDiscount from "./components/ActivityDiscount";
import {
  getNewFansPageAsync,
  selectLiveVideo,
  selectActivity,
  // getCommentsAsync,
  selectFansPage,
  // getIgCommentsAsync,
  selectIgMedia,
  selectProducts,
  deleteProductAsync,
  setCommentAsync,
  getPostActionsAsync,
  getShopProductsAsync,
  selectVideo,
  getDiscountAsync,
  selectDiscount,
  selectLiveBoradcastMode,
  selectPost,
  setOrderNew,
  clearComments,
} from "@store/liveroomSlice";
import {
  useFetchFbAllComments,
  useFetchAllIgComments,
} from "@pages/LiveRoom/utils";
import CommentIcon from "@mui/icons-material/Comment";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import PostOptionPanel from "./components/PostOptionPanel";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useStreamStatus } from "@hooks/streamStatus";
import CopyLiveLinkButton from "./components/CopyLiveLinkButton";
import CreateProductDialog from "@components/CreateProductForm/CreateProductDialog";
import useLiveLink from "@hooks/useLiveLink";
import IgStreamCountDown from "@components/IgStreamCountDown/IgStreamCountDown";
import { IG_REMIND_REMAINING_TIME_DIALOG_ID } from "@components/IgStreamCountDown/utils";
import useActivityPostIgCountDownTimeStorage from "@components/IgStreamCountDown/useActivityPostIgCountDownTimeStorage";
import DialogSetIgStreamCountDownTime from "@components/IgStreamCountDown/DialogSetIgStreamCountDownTime";
import { sendGaPageView } from "@utils/track";
import DialogPostIsDeleteRemind from "./components/DialogPostIsDeleteRemind";
import PostIsDeleteRemind from "@components/PostIsDeleteRemind";
import { getQueryParam } from "@utils/common";
import useBroadcastContent, {
  getPullOffVariantsContent,
} from "@hooks/broadcastContent";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface PROPS {
  fansPageId: string;
  postId: string;
}

const ACTIVITY_HEIGHT = 48;

// post_actions
function LiveRoom(props: PROPS) {
  const navigate = useNavigate();
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const curFanPage = useAppSelector(selectFansPage);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const initDiscount = useAppSelector(selectDiscount);
  const curActivity = useAppSelector(selectActivity);
  const curPost = useAppSelector(selectPost);
  const curIgMedia = useAppSelector(selectIgMedia);
  const productList = useAppSelector(selectProducts);
  const { getAllComments } = useFetchFbAllComments();
  const { getAllIgComments } = useFetchAllIgComments();
  const isLiveBoradcastMode = useAppSelector(selectLiveBoradcastMode);
  const refAccordingPostSummary = useRef<any>(null);
  const refAccordingProdSummary = useRef<any>(null);
  const refAccordingCommentSummary = useRef<any>(null);
  const refAccordingOrderSummary = useRef<any>(null);
  const [liveRoomHeight, setLiveRoomHeight] = useState(0);
  const [postType, setPostType] = useState<"video" | "text">("video");
  const [videoContainerHeight, setVideoContainerHeight] = useState(0);
  const [prodContainerHeight, setProdContainerHeight] = useState(0);
  const [commentContainerHeight, setCommentContainerHeight] = useState(0);
  const [orderContainerHeight, setOrderContainerHeight] = useState(0);
  const [option, setOption] = useState(0);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCollapsedVideo, setIsCollapsedVideo] = useState(false);
  const [isCollapsedOrderList, setIsCollapsedOrderList] = useState(false);
  const [isNonLiveIgPost, setIsNonLiveIgPost] = useState(false);
  const [isBroadcastingProds, setIsBroadcastingProds] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [productInfo, setProductInfo] = useState("");
  const [isIgActionReady, setIsIgActionReady] = useState(false);
  const [isDeletingProds, setIsDeletingProds] = useState<boolean>(false);
  const [checkedProducts, setCheckedProducts] = useState<string[]>([]);

  const [moreActionAnchorEl, setMoreActionAnchorEl] =
    useState<null | HTMLElement>(null);
  const [addProductAnchorEl, setAddProductAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMoreActionMenu = Boolean(moreActionAnchorEl);
  const openAddProductMenu = Boolean(addProductAnchorEl);
  const liveLink = useLiveLink();
  const [
    isDialogSetIgStreamCountDownTimeOpen,
    setIsDialogSetIgStreamCountDownTimeOpen,
  ] = useState(false);
  const [isDialogPostIsDeleteRemindOpen, setIsDialogPostIsDeleteRemindOpen] =
    useState(false);
  const { streamTimeStorage, setStreamTimeStorage } =
    useActivityPostIgCountDownTimeStorage();
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
    if (
      curIgMedia &&
      curIgMedia !== "not_live" &&
      (!streamTimeStorage || streamTimeStorage === "")
    ) {
      setIsDialogSetIgStreamCountDownTimeOpen(true);
    }
  }, [curIgMedia, streamTimeStorage]);
  useEffect(() => {
    if (curPost?.error) {
      setIsDialogPostIsDeleteRemindOpen(true);
    }
  }, [curPost?.error]);
  const settingMenu = [
    {
      icon: CampaignOutlinedIcon,
      name: "曝光多個商品",
      onClick: (e: any) => onBroadCast(),
    },
    {
      icon: DeleteIcon,
      name: "刪除多個商品",
      onClick: (e: any) => {
        e.stopPropagation();
        if (!productList) {
          return;
        }
        if (productList.length <= 1) {
          dispatch(
            setNotice({
              isErroring: true,
              message: "至少保留一個直播商品",
              type: "error",
            })
          );
          return;
        }
        setIsDeletingProds(true);
      },
    },
  ];

  useEffect(() => {
    if (curActivity) {
      switch (curActivity.dispatch?.platform) {
        case "facebook.page":
          if (
            curVideo &&
            curVideo !== "not_found" &&
            curVideo?.live_status === "LIVE"
          ) {
            const title = `Facebook粉專直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        case "facebook.group":
          if (
            curLiveVideo &&
            curLiveVideo !== "not_found" &&
            curLiveVideo?.status === "LIVE"
          ) {
            const title = `Facebook社團直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        default:
          if (curIgMedia && curIgMedia !== "not_live") {
            const title = `Instagram直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
      }
    }
  }, [curActivity, curIgMedia, curLiveVideo, curVideo]);

  const addProductMenu = [
    {
      icon: SellOutlinedIcon,
      name: "選擇現有商品",
      onClick: (e: any) => {
        e.stopPropagation();
        setIsAddingProduct(true);
      },
    },
    {
      icon: StorefrontOutlinedIcon,
      name: "建立新商品",
      onClick: (e: any) => {
        e.stopPropagation();
        setIsCreatingProduct(true);
      },
    },
  ];

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
              right: 0,
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
              right: -3,
              bottom: -3,
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

  const { IS_STREAMING, IS_STREAM_ENDED } = useStreamStatus();

  const optionList = useMemo(() => {
    if (IS_STREAMING) {
      return [
        { label: "liveroom", icon: <LiveTvIcon /> },
        { label: "discount", icon: renderDiscountIcon() },
        {
          label: "comments",
          icon: <CommentIcon />,
        },
        {
          label: "order",
          icon: <BarChartIcon />,
        },
      ];
    }
    if (IS_STREAM_ENDED) {
      return [
        { label: "liveroom", icon: <LiveTvIcon /> },
        { label: "discount", icon: renderDiscountIcon() },
        {
          label: "comments",
          icon: <CommentIcon />,
        },
        {
          label: "notify",
          icon: <SendOutlinedIcon />,
        },
        {
          label: "order",
          icon: <BarChartIcon />,
        },
      ];
    }
    return [
      { label: "liveroom", icon: <LiveTvIcon /> },
      { label: "discount", icon: renderDiscountIcon() },
    ];
  }, [IS_STREAMING, IS_STREAM_ENDED]);

  useEffect(() => {
    if (curActivity && curActivity.dispatch?.platform !== "instagram") {
      if (
        (curVideo && curVideo !== "not_found") ||
        (curLiveVideo && curLiveVideo !== "not_found") ||
        curPost?.error
      ) {
        dispatch(
          getPostActionsAsync({
            url: apis?.post_actions as string,
            activityId: activityId as string,
            postId: postId as string,
          })
        );
      }
    }
  }, [curVideo, curLiveVideo, curPost]);

  useEffect(() => {
    if (typeof IS_STREAMING === "string" && IS_STREAMING === "UNKONWN") {
      setIsDialogPostIsDeleteRemindOpen(true);
    }
  }, [IS_STREAMING]);

  useEffect(() => {
    dispatch(getShopProductsAsync({ url: apis?.products as string }));
    window.addEventListener("resize", onResizeHandler);
    setLiveRoomHeight(window.innerHeight);
    return () => {
      window.removeEventListener("resize", onResizeHandler);
    };
  }, []);

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

  useEffect(() => {
    if (liveRoomHeight) {
      if (refAccordingOrderSummary?.current) {
        setOrderContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) / 2 - 64
        );
      }
      if (refAccordingProdSummary?.current) {
        setProdContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
            refAccordingProdSummary?.current?.clientHeight
        );
      }
      if (refAccordingCommentSummary?.current) {
        setCommentContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
            refAccordingCommentSummary?.current?.clientHeight
        );
      }
      if (refAccordingPostSummary?.current) {
        setVideoContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) / 2 - 64
        );
      }
    }
  }, [liveRoomHeight]);

  useEffect(() => {
    if (curIgMedia === "not_live") {
      setIsNonLiveIgPost(true);
    }

    if (curIgMedia && !isIgActionReady) {
      dispatch(
        getPostActionsAsync({
          url: apis?.post_actions as string,
          activityId: activityId as string,
          postId: postId as string,
        })
      );
      setIsIgActionReady(true);
    }
  }, [curIgMedia]);

  useEffect(() => {
    if (isCollapsedVideo && liveRoomHeight) {
      setOrderContainerHeight(
        Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
          refAccordingOrderSummary?.current?.clientHeight -
          refAccordingPostSummary?.current?.clientHeight
      );
    } else {
      if (refAccordingOrderSummary?.current) {
        setOrderContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) / 2 -
            refAccordingOrderSummary?.current?.clientHeight
        );
      }
    }
  }, [isCollapsedVideo]);

  useEffect(() => {
    if (
      curLiveVideo === "not_found" &&
      curActivity?.dispatch?.platform !== "instagram"
    ) {
      setPostType("text");
    }
  }, [curLiveVideo]);

  const onResizeHandler = () => {
    setLiveRoomHeight(window.innerHeight);
  };

  const onSwitchPost = (e: any) => {
    e.stopPropagation();
    if (postType === "video") {
      setPostType("text");
    } else {
      setPostType("video");
    }
  };

  const handleOptionChange = (newValue: number) => {
    if (newValue !== 0) {
      dispatch(setOrderNew(""));
      dispatch(clearComments());
    }
    setOption(newValue);
  };

  const onBroadCast = () => {
    if (!productList) {
      return;
    }
    let selectedList = productList.filter((item) =>
      checkedProducts.includes(item.id)
    );
    let info = getMultipleProductContent(selectedList, boardCastContentStatus);
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
        return <FBComments height={commentContainerHeight} />;
      case "facebook.group":
        return (
          <FBGroupComments isLoading={false} height={commentContainerHeight} />
        );
      case "instagram":
        return <IgComments height={commentContainerHeight} />;
      default:
        return null;
    }
  };

  const onGetComments = () => {
    if (
      curActivity?.dispatch?.platform === "facebook.page" &&
      curVideo !== "not_found"
    ) {
      getAllComments(
        true,
        curFanPage?.access_token as string,
        curVideo?.id as string
      );
    }

    if (
      curActivity?.dispatch?.platform === "facebook.group" &&
      curLiveVideo !== "not_found"
    ) {
      getAllComments(
        true,
        curFanPage?.access_token as string,
        curLiveVideo?.id as string
      );
    }
    if (curActivity?.dispatch?.platform === "instagram") {
      getAllIgComments(
        curFanPage?.access_token as string,
        curActivity.dispatch.fb_post_id
      );
    }
  };

  return (
    <>
      <Container
        id="live-room-container-id"
        disableGutters
        maxWidth={false}
        sx={{
          height: `${liveRoomHeight}px`,
          background: "#f0f2f5",
          overflow: "hidden",
          display: "flex",
        }}
        className={style.liveRoom}
      >
        <Box sx={{ width: "56px" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                background: "#fff",
                width: "100%",
                height: "48px",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
            >
              <IconButton
                sx={{
                  display: "flex",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
                component="a"
                edge="end"
                aria-label="back"
                href={`/liveroom/activities/${activityId}?api=${
                  window.sessionStorage.getItem("api") || getQueryParam("api")
                }`}
              >
                <ArrowBackIcon sx={{ width: 18 }} />
              </IconButton>
            </Box>
            <OptionTabs
              onTabChange={handleOptionChange}
              tabList={optionList}
              value={option}
            />
          </Box>
        </Box>
        <Grid container spacing={0} columns={30}>
          <Grid item xs={30}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Activity />
              </Grid>
              {option === 0 && (
                <Grid
                  container
                  spacing={0}
                  sx={{
                    justifyContent: isLiveBoradcastMode ? "center" : "unset",
                  }}
                >
                  <Grid
                    item
                    xs={4}
                    sx={{ display: isLiveBoradcastMode ? "none" : "unset" }}
                  >
                    <Accordion defaultExpanded disableGutters expanded>
                      <AccordionSummary
                        expandIcon={null}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        ref={refAccordingProdSummary}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography variant="subtitle2">直播商品</Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Button
                              id="more-action-btn"
                              size="medium"
                              variant="outlined"
                              onClick={(
                                event: React.MouseEvent<HTMLElement>
                              ) => {
                                event.stopPropagation();
                                setMoreActionAnchorEl(event.currentTarget);
                              }}
                              sx={{ textAlign: "center" }}
                            >
                              更多動作
                            </Button>
                            <Menu
                              id="more-action-menu"
                              MenuListProps={{
                                "aria-labelledby": "more-action-button",
                              }}
                              anchorEl={moreActionAnchorEl}
                              open={openMoreActionMenu}
                              onClose={() => setMoreActionAnchorEl(null)}
                              PaperProps={{
                                style: {
                                  maxHeight: 48 * 4.5,
                                  width: "18ch",
                                },
                              }}
                            >
                              {settingMenu.map((item, index) => (
                                <MenuItem
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick(e);
                                    setMoreActionAnchorEl(null);
                                  }}
                                >
                                  <item.icon />
                                  {item.name}
                                </MenuItem>
                              ))}
                            </Menu>
                            <Button
                              id="add-product-btn"
                              size="medium"
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={(
                                event: React.MouseEvent<HTMLElement>
                              ) => {
                                event.stopPropagation();
                                setAddProductAnchorEl(event.currentTarget);
                              }}
                              sx={{ textAlign: "center", ml: 1 }}
                            >
                              新增直播商品
                            </Button>
                            <Menu
                              id="add-product-menu"
                              MenuListProps={{
                                "aria-labelledby": "add-product-button",
                              }}
                              anchorEl={addProductAnchorEl}
                              open={openAddProductMenu}
                              onClose={() => setAddProductAnchorEl(null)}
                              PaperProps={{
                                style: {
                                  maxHeight: 48 * 4.5,
                                  width: "18ch",
                                },
                              }}
                            >
                              {addProductMenu.map((item, index) => (
                                <MenuItem
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick(e);
                                    setAddProductAnchorEl(null);
                                  }}
                                >
                                  <item.icon />
                                  {item.name}
                                </MenuItem>
                              ))}
                            </Menu>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <Divider />
                      <AccordionDetails
                        sx={{
                          maxHeight: prodContainerHeight,
                          overflowY: "scroll",
                        }}
                      >
                        <ProductList
                          checkedList={checkedProducts}
                          onCheckedChange={(val: any) => {
                            setCheckedProducts(val);
                          }}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                  <Grid item xs={isLiveBoradcastMode ? 5 : 4}>
                    {curPost?.error && (
                      <PostIsDeleteRemind
                        liveRoomHeight={liveRoomHeight}
                        activityHeight={ACTIVITY_HEIGHT}
                      />
                    )}
                    {!curPost?.error && (
                      <Box
                        sx={{
                          display: "grid",
                          gridAutoRows: `${
                            isCollapsedVideo ? "64px" : "calc(50vh - 24px)"
                          } ${
                            isCollapsedOrderList ? "48px" : "calc(50vh - 24px)"
                          }`,
                          gridAutoColumns: "100%",
                          height: "100%",
                        }}
                      >
                        <Accordion
                          defaultExpanded
                          disableGutters
                          expanded={!isCollapsedVideo}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="videoAccordion"
                            ref={refAccordingPostSummary}
                            onClick={(e) => {
                              if (
                                (e.target as any)?.closest(
                                  `#${IG_REMIND_REMAINING_TIME_DIALOG_ID}`
                                )
                              ) {
                                return;
                              }
                              setIsCollapsedVideo(!isCollapsedVideo);
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="subtitle2">
                                  直播影片/貼文
                                </Typography>
                                {liveLink !== null && <CopyLiveLinkButton />}
                                {curIgMedia &&
                                  streamTimeStorage &&
                                  streamTimeStorage !== "" && (
                                    <Box
                                      sx={{
                                        textAlign: "center",
                                        flex: "1 0 auto",
                                      }}
                                    >
                                      <IgStreamCountDown />
                                    </Box>
                                  )}
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    curLiveVideo === "not_found" ||
                                    curActivity?.dispatch?.platform ===
                                      "instagram"
                                      ? "none"
                                      : "flex",
                                }}
                              >
                                <ToggleButtonGroup
                                  color="primary"
                                  value={postType}
                                  exclusive
                                  onChange={(e) => onSwitchPost(e)}
                                  aria-label="Platform"
                                  size="small"
                                >
                                  <ToggleButton value="video">
                                    影片
                                  </ToggleButton>
                                  <ToggleButton value="text">貼文</ToggleButton>
                                </ToggleButtonGroup>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <Divider />
                          <AccordionDetails
                            sx={{
                              p: 0,
                            }}
                          >
                            <TextPost
                              isvisible={postType === "text"}
                              height={videoContainerHeight}
                            />
                            {((curActivity?.dispatch?.platform.includes(
                              "facebook"
                            ) &&
                              curLiveVideo !== "not_found") ||
                              curActivity?.dispatch?.platform ===
                                "instagram") && (
                              <LivePost
                                height={videoContainerHeight}
                                isVisible={postType === "video"}
                              />
                            )}
                          </AccordionDetails>
                        </Accordion>
                        <Accordion
                          defaultExpanded
                          disableGutters
                          expanded={!isCollapsedOrderList}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            ref={refAccordingOrderSummary}
                            onClick={() => {
                              setIsCollapsedOrderList((prev) => !prev);
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2">
                                喊單排行榜
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <Divider />
                          <AccordionDetails
                            sx={{
                              overflowY: "scroll",
                              padding: 0,
                            }}
                          >
                            <OrderPanel height={orderContainerHeight} />
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={isLiveBoradcastMode ? 6 : 4}>
                    <Accordion defaultExpanded disableGutters expanded>
                      <AccordionSummary
                        expandIcon={null}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        ref={refAccordingCommentSummary}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography variant="subtitle2">用戶留言</Typography>
                          <Box
                            sx={{ display: "none" }}
                            // sx={{
                            //   display:
                            //     (curActivity?.dispatch?.platform.includes(
                            //       "facebook"
                            //     ) &&
                            //       curVideo !== "not_found" &&
                            //       curVideo?.live_status === "LIVE") ||
                            //     (curLiveVideo !== "not_found" &&
                            //       curLiveVideo?.status === "LIVE") ||
                            //     curActivity?.dispatch?.platform === "instagram"
                            //       ? "flex"
                            //       : "none",
                            // }}
                          >
                            <Button
                              size="medium"
                              variant="contained"
                              startIcon={<RefreshIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onGetComments();
                              }}
                              sx={{
                                textAlign: "center",
                                display: isNonLiveIgPost ? "none" : "",
                              }}
                              color="inherit"
                            >
                              刷新
                            </Button>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <Divider />
                      <AccordionDetails>{getSocialComment()}</AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              )}
              {optionList[option].label === "discount" && (
                <Grid container spacing={0}>
                  <Grid item xs={4} />
                  <Grid item xs={4}>
                    <Accordion defaultExpanded disableGutters expanded>
                      <AccordionSummary
                        expandIcon={null}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        ref={refAccordingProdSummary}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            // justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography variant="subtitle2">折扣設定</Typography>
                        </Box>
                      </AccordionSummary>
                      <Divider />
                      <AccordionDetails
                        sx={{
                          maxHeight: prodContainerHeight,
                          overflowY: "scroll",
                        }}
                      >
                        <ActivityDiscount onAction={() => setOption(0)} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                  <Grid item xs={4} />
                </Grid>
              )}
              {optionList[option].label === "comments" && (
                <Grid container spacing={0}>
                  <Grid item xs={12} sx={{ background: "#fff" }}>
                    <PostOptionPanel
                      height={liveRoomHeight}
                      title="留言總覽"
                      description="即將推出此功能，請先至矽羽後台查看。"
                      type="留言"
                    />
                  </Grid>
                </Grid>
              )}
              {optionList[option].label === "notify" && (
                <Grid container spacing={0}>
                  <Grid item xs={12} sx={{ background: "#fff" }}>
                    <PostOptionPanel
                      height={liveRoomHeight}
                      title="發送通知"
                      description="即將推出此功能，請先至矽羽後台查看。"
                      type="通知"
                    />
                  </Grid>
                </Grid>
              )}
              {optionList[option].label === "order" && (
                <Grid container spacing={0}>
                  <Grid item xs={12} sx={{ background: "#fff" }}>
                    <PostOptionPanel
                      height={liveRoomHeight}
                      title="商品統計"
                      description="即將推出此功能，請先至矽羽後台查看。"
                      type="統計"
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <AddProductDialog
        isVisible={isAddingProduct}
        onOk={() => setIsAddingProduct(false)}
        onCancel={() => setIsAddingProduct(false)}
      />
      <CreateProductDialog
        isVisible={isCreatingProduct}
        onOk={() => setIsCreatingProduct(false)}
        onCancel={() => setIsCreatingProduct(false)}
      />
      <Dialog
        open={false}
        onClose={() => navigate(`/liveroom/activities/${activityId}`)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">IG直播</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Instagram
            貼文已自動被刪除，故無法查看當時的喊單排行。但您仍可透過矽羽後台查看貼文商品統計。
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
      <DialogSetIgStreamCountDownTime
        open={isDialogSetIgStreamCountDownTimeOpen}
        setOpen={setIsDialogSetIgStreamCountDownTimeOpen}
        onSetCountdownTime={() => {
          setIsDialogSetIgStreamCountDownTimeOpen(false);
        }}
        confirmButtonText="下一步"
        streamTimeStorage={streamTimeStorage}
        setStreamTimeStorage={setStreamTimeStorage}
      />
      <DialogPostIsDeleteRemind
        isOpen={isDialogPostIsDeleteRemindOpen}
        setOpen={setIsDialogPostIsDeleteRemindOpen}
      />
    </>
  );
}

export default LiveRoom;
