import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Activity from "./components/Activity";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ProductList from "./components/ProductList";
import style from "./index.module.scss";
import AddProductDialog from "./components/AddProductDialog-new";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { selectApis } from "@store/apiSlice";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import ProductIcon from "@assets/empty-products-icon.svg";
import PercentIcon from "@mui/icons-material/Percent";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  selectProducts,
  enableActivityAsync,
  editKeywordsAsync,
  deleteProductAsync,
  selectActivity,
  getShopProductsAsync,
  getDiscountAsync,
  selectDiscount,
  getProdsAsync,
  getActivityProdsAsync,
  getProductCategoriesAsync,
  getAllSocialAccountsAtOnceAsync,
} from "@store/liveroomSlice";
import { setNotice } from "@store/commonSlice";
import LiveroomIcon from "@assets/liveroom.svg";
import CommentIcon from "@assets/commentIcon.svg";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import SocialPostSelector from "./components/SocialPostSelector-new";
import { replaceActivityPost } from "./apis/legacy";
import ActivityDiscount from "./components/ActivityDiscount";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SelectChannelDialog from "./components/SelectChannelDialog";
import OptionTabs from "./components/OptionTabs";
import Skeleton from "@mui/material/Skeleton";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useLocalStorage } from "@utils/index";
import CreateProductDialog from "@components/CreateProductForm/CreateProductDialog";
import DialogSetIgStreamCountDownTime from "@components/IgStreamCountDown/DialogSetIgStreamCountDownTime";
import useActivityPostIgCountDownTimeStorage from "@components/IgStreamCountDown/useActivityPostIgCountDownTimeStorage";
import { sendGaEvent } from "@utils/track";
import { getQueryParam } from "@utils/common";

interface PROPS {
  fansPageId: string;
  postId: string;
}

const ACTIVITY_HEIGHT = 48;

function Draft(props: PROPS) {
  const { activityId, postId } = useParams();
  const productList = useAppSelector(selectProducts);
  const activity = useAppSelector(selectActivity);
  const initDiscount = useAppSelector(selectDiscount);
  const arrSkelton = new Array(8).fill(0);
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const refAccordingProdSummary = useRef<any>(null);
  const [guideSteps] = useState<DriveStep[]>([
    {
      element: "#add-product-btn",
      popover: {
        title: `第一步：新增直播商品`,
        description: "新增活動商品到當前直播",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#more-action-btn",
      popover: {
        title: "第二步：設定關鍵字",
        description:
          "透過自動化關鍵字，輸入商品關鍵字前綴，快速編輯多個商品關鍵字，或單獨編輯商品關鍵字",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "#enable-live-btn",
      popover: {
        title: "第三步：啟用直播貼文",
        description: "確定+1活動已經開啟，關聯已開始直播社群貼文，啟用直播活動",
        side: "top",
        align: "start",
      },
    },
    {
      element: "#guide-fab",
      popover: {
        title: "新手引導",
        description: "再次查看新手引導",
        side: "left",
        align: "start",
      },
    },
  ]);
  const refGuide = useRef<any>(
    driver({
      allowClose: true,
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "我知道了",
      steps: guideSteps,
    })
  );
  const [liveRoomHeight, setLiveRoomHeight] = useState(0);
  const [prodContainerHeight, setProdContainerHeight] = useState(0);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [curLiveVideo, setCurLiveVideo] = useState("");
  const [draftInfo, setDraftInfo] = useLocalStorage("draft_info", "");
  const [isSelectingPost, setIsSelectingPost] = useState(false);
  const [isEnableActivity, setIsEnableActivity] = useState(false);
  const [isEnableDialog, setIsEnableDialog] = useState(false);
  const [
    isDialogSetIgStreamCountDownTimeOpen,
    setIsDialogSetIgStreamCountDownTimeOpen,
  ] = useState(false);
  const [curSocial, setCurSocial] = useState(draftInfo);
  const [isEmptyProducts, setIsEmptyProducts] = useState(true);
  const [isNewDraft, setIsNewDraft] = useLocalStorage("is_new_draft", true);
  const [isVisibleGuide, setIsVisibleGuide] = useState(isNewDraft === true);
  const [isSelectingChannel, setIsSelectingChannel] = useState(
    draftInfo === ""
  );
  const [checkedProducts, setCheckedProducts] = useState<string[]>([]);
  const [option, setOption] = useState(0);
  const [isDeletingProds, setIsDeletingProds] = useState<boolean>(false);
  const [moreActionAnchorEl, setMoreActionAnchorEl] =
    useState<null | HTMLElement>(null);
  const [addProductAnchorEl, setAddProductAnchorEl] =
    useState<null | HTMLElement>(null);
  const [, setLocalDefaultProduct] = useLocalStorage(
    "default_product",
    JSON.stringify("")
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const openMoreActionMenu = Boolean(moreActionAnchorEl);
  const openAddProductMenu = Boolean(addProductAnchorEl);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      keyword: "",
    },
  });
  const { streamTimeStorage, setStreamTimeStorage } =
    useActivityPostIgCountDownTimeStorage();
  const [curSocialDetail, setCurSocialDetail] = useState<any>(null);

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

  const optionList = [
    { label: "liveroom", icon: <LiveTvIcon /> },
    { label: "discount", icon: renderDiscountIcon() },
  ];

  const settingMenu = [
    {
      icon: EditIcon,
      name: "自動化關鍵字",
      onClick: (e: any) => {
        e.stopPropagation();
        setIsEditingKeywords(true);
      },
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

  useEffect(() => {
    dispatch(getShopProductsAsync({ url: apis?.products as string }));
    dispatch(
      getProdsAsync({
        urlProd: apis?.activity_post_products as string,
        urlNicknames: apis?.products_nicknames as string,
        activityId: activityId as string,
        postId: postId as string,
      })
    );
    dispatch(
      getActivityProdsAsync({
        urlProd: apis?.activity_products as string,
        activityId: activityId as string,
      })
    );
    dispatch(getProductCategoriesAsync({ url: apis?.categories as string }));
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
    if (activity) {
      setIsEnableActivity(activity.is_enable);
    }
  }, [activity]);

  useEffect(() => {
    dispatch(
      getAllSocialAccountsAtOnceAsync({
        url: apis?.social_accounts as string,
      })
    );
  }, [apis?.social_accounts, draftInfo, dispatch]);

  useEffect(() => {
    if (productList) {
      // const defaultProduct = JSON.parse(localDefaultProduct);
      const defaultProduct = window.localStorage.getItem("default_product")
        ? JSON.parse(
            JSON.parse(window.localStorage.getItem("default_product") || "") ||
              ""
          )
        : {}; // get latest default_product because localDefaultProduct is not invoked on useEffect
      const defaultProductId = defaultProduct[`${activityId}-${postId}`]
        ? defaultProduct[`${activityId}-${postId}`].toString()
        : "";
      if (
        productList.filter(
          (product) => product.id.toString() !== defaultProductId
        ).length > 0
      ) {
        setIsEmptyProducts(false);
        setProdContainerHeight(100);
        setTimeout(() => {
          if (liveRoomHeight) {
            if (refAccordingProdSummary?.current) {
              setProdContainerHeight(
                Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
                  refAccordingProdSummary?.current?.clientHeight
              );
            }
          }
        }, 10);
      } else {
        setIsEmptyProducts(true);
      }
      if (isVisibleGuide) {
        setIsNewDraft("false");
        setIsVisibleGuide(false);
        refGuide.current.drive();
      }
    }
  }, [productList]);

  // useEffect(() => {
  //   if (isVisibleGuide) {
  //     setIsNewDraft("false");
  //     setIsVisibleGuide(false);
  //     refGuide.current.drive();
  //   }
  // }, [isVisibleGuide]);

  useEffect(() => {
    if (liveRoomHeight) {
      if (refAccordingProdSummary?.current) {
        setProdContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
            refAccordingProdSummary?.current?.clientHeight
        );
      }
    }
  }, [liveRoomHeight]);

  useEffect(() => {
    if (option === 1 && prodContainerHeight === 0) {
      if (liveRoomHeight) {
        if (refAccordingProdSummary?.current) {
          setProdContainerHeight(
            Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
              refAccordingProdSummary?.current?.clientHeight
          );
        }
      }
    }
  }, [option]);

  const onResizeHandler = () => {
    setLiveRoomHeight(window.innerHeight);
  };

  const onSubmit = async (data: any) => {
    const promiseActions: any[] = [];
    if (data.keyword === "") {
      dispatch(
        setNotice({
          isErroring: true,
          message: "請輸入關鍵字前綴",
          type: "info",
        })
      );
      return;
    }
    setIsRequesting(true);
    let curProductList = productList;
    if (checkedProducts.length) {
      curProductList =
        productList?.filter((item1) =>
          checkedProducts.some((item2) => item1.id === item2)
        ) || null;
    }
    curProductList?.map((product, index) => {
      const curNicknames = product.nicknames || [];
      promiseActions.push(
        dispatch(
          editKeywordsAsync({
            url: apis?.products_nicknames as string,
            activityId: activityId as string,
            postId: postId as string,
            productId: product.id,
            nicknames: curNicknames?.concat([
              `${data.keyword}${index < 9 ? `0${index + 1}` : index + 1}`,
            ]),
            onSuccess: () => {
              // setIsEditingKeywords(false);
            },
          })
        )
      );
    });
    await Promise.all(promiseActions).catch(() => {
      setIsRequesting(false);
    });
    dispatch(
      setNotice({
        isErroring: true,
        message: "自動化關鍵字成功",
        type: "success",
      })
    );
    setIsRequesting(false);
    setIsEditingKeywords(false);
  };

  const onEnablePost = async () => {
    const defaultProduct = window.localStorage.getItem("default_product")
      ? JSON.parse(
          JSON.parse(window.localStorage.getItem("default_product") || "") || ""
        )
      : {};
    if (!curLiveVideo) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "請選擇直播貼文",
          type: "info",
        })
      );
      return;
    }
    const displayId = defaultProduct[`${activityId}-${postId}`]
      ? defaultProduct[`${activityId}-${postId}`].toString()
      : "";

    if (displayId !== "") {
      await dispatch(
        deleteProductAsync({
          url: apis?.activity_post_products as string,
          activityId: activityId as string,
          postId: postId as string,
          prodId: displayId,
          onSuccess: (val: any) => {},
        })
      );
    }

    await replaceActivityPost(
      apis?.activity_replace_post as string,
      activityId as string,
      postId as string,
      curSocial,
      curLiveVideo.split("_")[0],
      curSocial.includes("facebook") ? curLiveVideo : curLiveVideo.split("_")[1]
    ).then((res: any) => {
      if (res.success) {
        sendGaEvent<{
          channelType: string;
          channelName: string;
        }>("connect_liveroom", {
          channelType: curSocial,
          channelName: curSocialDetail?.name,
        });

        dispatch(
          setNotice({
            isErroring: true,
            message: "啟用貼文成功",
            type: "success",
          })
        );
        window.localStorage.removeItem("draft_info");
        window.localStorage.removeItem("is_new_draft");

        if (
          Object.prototype.hasOwnProperty.call(
            defaultProduct,
            `${activityId}-${postId}`
          )
        ) {
          delete defaultProduct[`${activityId}-${postId}`];
        }
        setLocalDefaultProduct(JSON.stringify(defaultProduct));
        setTimeout(
          () =>
            (window.location.href = `/liveroom/activities/${res.activity_id}/posts/${res.post_id}`),
          1000
        );
      } else {
        dispatch(
          setNotice({
            isErroring: true,
            message: res.error,
            type: "error",
          })
        );
      }
    });
  };

  const handleOptionChange = (newValue: number) => {
    setOption(newValue);
  };

  const handleEnableActivity = () => {
    dispatch(
      enableActivityAsync({
        url: apis?.activity as string,
        activityId: activityId as string,
        isEnable: true,
        onSuccess: (res: any) => {
          if (res?.success) {
            setIsEnableActivity(true);
            setIsEnableDialog(false);
            setIsSelectingPost(true);
          }
        },
      })
    );
  };

  return (
    <>
      <Container
        id="live-room-container-id"
        disableGutters
        maxWidth={false}
        sx={{
          background: "#f0f2f5",
          position: "relative",
          overflow: "hidden",
          height: `${liveRoomHeight}px`,
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
                <Activity
                  onSwitchChannel={() => setIsSelectingChannel(true)}
                  channel={curSocial}
                />
              </Grid>
              {option === 0 && (
                <Grid container spacing={0}>
                  <Grid item xs={4}>
                    {productList && !isEmptyProducts && (
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
                            <Typography variant="subtitle2">
                              直播商品
                            </Typography>
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
                    )}
                    {productList && isEmptyProducts && (
                      <Box
                        sx={{
                          height: Math.floor(liveRoomHeight - ACTIVITY_HEIGHT),
                          width: "100%",
                          background: "#fff",
                          textAlign: "center",
                        }}
                      >
                        <img style={{ marginTop: 64 }} src={ProductIcon}></img>
                        <Typography variant="h6" sx={{ color: "#000" }}>
                          添加商品至本場直播
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
                        >
                          請在直播開始前將需要的活動商品加入本場直播中。
                        </Typography>
                        <Button
                          id="add-product-btn"
                          size="medium"
                          variant="contained"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddProductAnchorEl(e.currentTarget);
                          }}
                          sx={{ textAlign: "center", mt: 2 }}
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
                    )}
                    {!productList && (
                      <Box sx={{ width: "100%", padding: 1 }}>
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          height={56}
                          sx={{ mt: 1, mb: 1 }}
                        />
                        {arrSkelton.map((item, index) => (
                          <Skeleton
                            key={index}
                            animation="wave"
                            variant="rectangular"
                            height={30}
                            sx={{ mt: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        height: Math.floor(liveRoomHeight - ACTIVITY_HEIGHT),
                        width: "100%",
                        background: "#37474F",
                        textAlign: "center",
                      }}
                    >
                      <img style={{ marginTop: 64 }} src={LiveroomIcon}></img>
                      <Typography variant="h6" sx={{ color: "#FAFAFA" }}>
                        開始直播了嗎？
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#E0E0E0", mt: 1 }}
                      >
                        {`請確保您已在 ${
                          curSocial.includes("facebook")
                            ? "Facebook"
                            : "Instagram"
                        } 開啟直播，接著連接至此平台。`}
                      </Typography>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelectingChannel(true);
                        }}
                        sx={{ textAlign: "center", mt: 2, mr: 1 }}
                      >
                        切換直播來源
                      </Button>
                      <Button
                        id="enable-live-btn"
                        size="medium"
                        variant="contained"
                        startIcon={<InsertLinkIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            curSocial === "instagram" &&
                            (!streamTimeStorage || streamTimeStorage === "")
                          ) {
                            setIsDialogSetIgStreamCountDownTimeOpen(true);
                            return;
                          }
                          if (isEnableActivity) {
                            setIsSelectingPost(true);
                          } else {
                            setIsEnableDialog(true);
                          }
                        }}
                        sx={{ textAlign: "center", mt: 2 }}
                      >
                        {`連接${
                          curSocial.includes("facebook")
                            ? "Facebook"
                            : "Instagram"
                        }直播`}
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        height: Math.floor(liveRoomHeight - ACTIVITY_HEIGHT),
                        width: "100%",
                        background: "#fff",
                        textAlign: "center",
                      }}
                    >
                      <img style={{ marginTop: 64 }} src={CommentIcon}></img>
                      <Typography variant="h6" sx={{ color: "#000" }}>
                        目前沒有留言
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
                      >
                        連接直播後，您將能夠即時看到觀眾留言，並在此進行互動。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
              {option === 1 && (
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
        fullWidth={true}
        open={isEditingKeywords}
        onClose={() => setIsEditingKeywords(false)}
      >
        <DialogTitle>自動化關鍵字</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <DialogContentText>
            只需輸入前綴，系統會自動將尚未擁有關鍵字的商品依序給予關鍵字。例如，輸入「A」作為前綴，系統會自動設定A01，A02，A03，依此類推。
          </DialogContentText>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="keyword"
              render={({ field }) => (
                <TextField
                  autoFocus
                  margin="dense"
                  id="keyword"
                  label="關鍵字"
                  type="keyword"
                  fullWidth
                  placeholder="A"
                  variant="outlined"
                  {...register("keyword")}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              reset();
              setIsEditingKeywords(false);
            }}
          >
            取消
          </Button>
          <LoadingButton
            loading={isRequesting}
            onClick={handleSubmit(onSubmit)}
            variant="contained"
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth={true}
        open={isEnableDialog}
        onClose={() => setIsEnableDialog(false)}
      >
        <DialogTitle>活動尚未啟用</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <DialogContentText>
            請先啟用活動，在連接直播貼文，系統才會開始抓取留言並進行分析。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsEnableDialog(false);
            }}
          >
            稍後再啟用
          </Button>
          <Button onClick={handleEnableActivity}>啟用活動</Button>
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
            onClick={(e) => {
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
        open={isSelectingPost}
        onClose={() => setIsSelectingPost(false)}
        aria-labelledby="post-dialog-title"
        aria-describedby="post-dialog-description"
      >
        <DialogTitle id="select-post-dialog">
          {`選擇 ${
            curSocial.includes("facebook") ? "Facebook" : "Instagram"
          } 直播`}
        </DialogTitle>
        <DialogContent>
          <SocialPostSelector
            onPostChange={(val: string, liveVideo: any) => {
              setCurLiveVideo(val);
              setCurSocialDetail(liveVideo);
            }}
            channel={curSocial}
            onChannelChange={(val: string) => {
              setIsSelectingChannel(true);
              setCurSocial(val);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSelectingPost(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              onEnablePost();
            }}
            autoFocus
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
      <SelectChannelDialog
        isVisible={isSelectingChannel}
        onCancel={() => setIsSelectingChannel(false)}
        onOk={(val: string) => {
          setCurSocial(val);
          setDraftInfo(val);
          setIsSelectingChannel(false);
        }}
      />
      <DialogSetIgStreamCountDownTime
        open={isDialogSetIgStreamCountDownTimeOpen}
        setOpen={setIsDialogSetIgStreamCountDownTimeOpen}
        onSetCountdownTime={() => {
          setIsDialogSetIgStreamCountDownTimeOpen(false);
          if (isEnableActivity) {
            setIsSelectingPost(true);
          } else {
            setIsEnableDialog(true);
          }
        }}
        confirmButtonText="下一步"
        streamTimeStorage={streamTimeStorage}
        setStreamTimeStorage={setStreamTimeStorage}
      />
    </>
  );
}

export default Draft;
