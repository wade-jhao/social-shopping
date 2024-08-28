import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  getActivityAsync,
  selectActivity,
  getActivityProdsAsync,
  getActivityPostsAsync,
  selectProductCategories,
  selectActivityPosts,
  enableActivityAsync,
  addNewActivityPostToList,
  deleteDummyActivityPostAsync,
} from "@store/activitySlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import Skeleton from "@mui/material/Skeleton";
import PostList from "./components/PostList";
import Button from "@mui/material/Button";
import { useLocalStorage } from "@utils/index";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AddProductDialog from "./components/AddProductDialog-new";
import InfoIcon from "@mui/icons-material/Info";
import EmptyActivity from "./components/EmptyActivity";
import {
  getShopProducts,
  PRODUCT,
  addActivityProducts,
  duplicateActivityPost,
} from "./apis/legacy";
import {
  getAllSocialAccountsAtOnceAsync,
  selectActivityProducts,
  selectSocialAccounts,
} from "@store/liveroomSlice";
import { setNotice } from "@store/commonSlice";
import { createActivityPost } from "./apis/legacy";
import SelectChannelDialog from "./components/SelectChannelDialog";
import Loading from "@components/Loading";
import EmptySocialAccount from "./components/EmptySocialAccount";
import generateTemporaryId from "@utils/generateId";
import { useNavigate } from "react-router-dom";

function Activity() {
  const navigate = useNavigate();
  const curPlatform = useAppSelector(selectSocialAccounts);
  const activityProducts = useAppSelector(selectActivityProducts);
  const activityPosts = useAppSelector(selectActivityPosts);
  const curCategories = useAppSelector(selectProductCategories);
  const [activityHeight, setActivityHeight] = useState(0);
  const [isEnableActivity, setIsEnableActivity] = useState(false);
  const [shopProducts, setShopProducts] = useState<PRODUCT[]>([]);
  const [localDefaultProduct, setLocalDefaultProduct] = useLocalStorage(
    "default_product",
    JSON.stringify("")
  );
  const [isAddingActivityProducts, setIsAddingActivityProducts] =
    useState(false);
  const [isInit, setIsInit] = useState(true);
  const [isSelectingChannel, setIsSelectingChannel] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{
    acivityId: string;
    postId: string;
  } | null>(null);
  const [isDisplayedDraft, setIsDisplayedDraft] = useState(false);
  const [alignment, setAlignment] = useState("all");
  const { activityId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const activity = useAppSelector(selectActivity);
  const [isRequestingUpdatePosts, setIsRequestingUpdatePosts] = useState(false);
  const announcementsWrapperRef = useRef<HTMLDivElement>(null);
  const activityNameWrapperRef = useRef<HTMLDivElement>(null);
  const activityListTitleWrapperRef = useRef<HTMLDivElement>(null);
  const toggleOptions = [
    {
      value: "all",
      label: "全部",
    },
    {
      value: "facebook.page",
      label: "Facebook粉絲專頁",
    },
    {
      value: "facebook.group",
      label: "Facebook社團",
    },
    {
      value: "instagram",
      label: "Instagram",
    },
    {
      value: "draft",
      label: "草稿",
    },
  ];

  const arrSkelton = new Array(6).fill(0);

  useEffect(() => {
    dispatch(
      getAllSocialAccountsAtOnceAsync({
        url: apis?.social_accounts as string,
      })
    );
    dispatch(
      getActivityAsync({
        urlActivity: apis?.activity as string,
        activityId: activityId as string,
      })
    );
    getActivityProducts();

    window.addEventListener("resize", onResizeHandler);
    const headerHeight = document.getElementById("header")?.clientHeight || 0;
    const footerHeight = document.getElementById("footer")?.clientHeight || 0;
    const announcementsWrapperHeight =
      announcementsWrapperRef.current?.clientHeight || 0;
    setActivityHeight(
      window.innerHeight -
        headerHeight -
        footerHeight -
        announcementsWrapperHeight -
        10
    );
    return () => {
      window.removeEventListener("resize", onResizeHandler);
    };
  }, []);

  const getActivityProducts = () => {
    dispatch(
      getActivityProdsAsync({
        urlProd: apis?.activity_products as string,
        activityId: activityId as string,
      })
    );
  };

  useEffect(() => {
    if (activity) {
      setIsEnableActivity(activity.is_enable);
      dispatch(
        getActivityPostsAsync({
          urlActivityPosts: apis?.activity_posts as string,
          activityId: activityId as string,
        })
      );
    }
  }, [activity]);

  useEffect(() => {
    if (activityProducts) {
      if (!activityProducts.length) {
        getShopProducts(apis?.products as string)
          .then((res: any) => {
            setShopProducts(res);
            const randomIndex = Math.floor(Math.random() * res.length);
            const defaultProduct: PRODUCT = res[randomIndex];
            addActivityProducts(
              apis?.activity_create_product as string,
              activityId as string,
              defaultProduct.id
            ).then(() => {
              getActivityProducts();
              setIsInit(false);
            });
          })
          .catch((e) => {
            setIsInit(false);
          });
      } else {
        setIsInit(false);
      }
    }
  }, [activityProducts]);

  useEffect(() => {
    if (activityPosts) {
      const draft = activityPosts.find((post) => !post.platform);
      if (draft) {
        setDraftInfo({
          acivityId: activityId as string,
          postId: draft?.post?.id.toString(),
        });
      }
    }
  }, [activityPosts]);

  const onResizeHandler = () => {
    const headerHeight = document.getElementById("header")?.clientHeight || 0;
    const footerHeight = document.getElementById("footer")?.clientHeight || 0;
    const announcementsWrapperHeight =
      announcementsWrapperRef.current?.clientHeight || 0;
    setActivityHeight(
      window.innerHeight -
        headerHeight -
        footerHeight -
        announcementsWrapperHeight -
        10
    );
  };

  const onAddProductSuccess = () => {
    setIsAddingActivityProducts(false);
    dispatch(
      getActivityProdsAsync({
        urlProd: apis?.activity_products as string,
        activityId: activityId as string,
      })
    );
  };

  const onAddedCurProduct = () => {
    if (!activityProducts || (activityProducts && !activityProducts.length)) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "請先新增活動商品",
          type: "error",
        })
      );
      return;
    }
    setIsSelectingChannel(true);
  };

  const createNewPost = () => {
    if (!activityProducts || (activityProducts && !activityProducts.length)) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * activityProducts.length);
    const defaultProduct = activityProducts[randomIndex];
    createActivityPost(
      apis?.activity_create_post as string,
      activityId as string,
      "dummy",
      `${activityId as string}-${Math.random()}`,
      defaultProduct.id
    ).then((res) => {
      setDraftInfo({ acivityId: res.activity_id, postId: res.post_id });
      const curLocalDefaultPoducts =
        JSON.parse(localDefaultProduct) === ""
          ? {}
          : JSON.parse(localDefaultProduct);
      curLocalDefaultPoducts[`${res.activity_id}-${res.post_id}`] =
        defaultProduct.id;
      setLocalDefaultProduct(JSON.stringify(curLocalDefaultPoducts));
      dispatch(
        setNotice({
          isErroring: true,
          message: "新增活動草稿成功",
          type: "success",
        })
      );
      res["type"] = "dummy";
    });
  };

  const duplicatePost = (postId: string, postIdentity: string) => {
    if (!activityProducts || (activityProducts && !activityProducts.length)) {
      return;
    }
    setIsRequestingUpdatePosts(true);
    const randomIndex = Math.floor(Math.random() * activityProducts.length);
    const defaultProduct = activityProducts[randomIndex];
    duplicateActivityPost(
      apis?.activity_duplicate_post as string,
      activityId as string,
      postId.split("_")[1],
      "dummy",
      `${postId as string}-${generateTemporaryId()}`,
      defaultProduct.id
    ).then((res) => {
      setDraftInfo({ acivityId: res.activity_id, postId: res.post_id });
      dispatch(
        addNewActivityPostToList({
          id: `${res.activity_id}_${res.post_id}`,
          post: {
            id: res.post_id,
            fb_post_id: null,
            content: "草稿貼文",
            platform_name: "草稿",
            create_time: "",
          },
          detail: null,
        })
      );
      dispatch(
        setNotice({
          isErroring: true,
          message: "成功將本場直播的商品及關鍵字設定複製為新的草稿。",
          type: "success",
        })
      );
      res["type"] = "dummy";
      setIsRequestingUpdatePosts(false);
    });
  };

  const deletePost = (postId: string) => {
    setIsRequestingUpdatePosts(true);
    dispatch(
      deleteDummyActivityPostAsync({
        url: apis?.activity_posts as string,
        activityId: activityId as string,
        postId: postId.split("_")[1],
        onSuccess: () => {
          dispatch(
            setNotice({
              isErroring: true,
              message: "刪除草稿貼文成功",
              type: "success",
            })
          );
          setIsRequestingUpdatePosts(false);
        },
        onError: () => {
          dispatch(
            setNotice({
              isErroring: true,
              message: "刪除草稿貼文失敗",
              type: "error",
            })
          );
          setIsRequestingUpdatePosts(false);
        },
      })
    );
  };

  const handleAlignmentChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setAlignment(newAlignment);
  };

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

  if (curPlatform && Object.values(curPlatform).flat()?.length === 0) {
    return (
      <>
        <Container
          sx={{
            mt: 1,
          }}
          maxWidth="md"
          fixed={true}
        >
          <EmptySocialAccount />
          {/* <Typography sx={{ textAlign: "center" }}>
            前往教學{" "}
            <a href="" target="_blank">
              綁定外部網站
            </a>
          </Typography> */}
        </Container>
      </>
    );
  }

  return (
    <>
      <Container
        ref={announcementsWrapperRef}
        maxWidth="md"
        sx={{
          px: {
            md: 2,
            lg: 0,
            xl: 0,
          },
        }}
      ></Container>
      <Container
        sx={{
          mt: 1,
          background: "#fff",
          height: activityHeight,
        }}
        maxWidth="md"
        fixed={true}
      >
        <Box>
          {activity ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "left",
                alignItems: "center",
                // minHeight: 48,
                background: "#fff",
                mt: 1,
              }}
              ref={activityNameWrapperRef}
            >
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
          ) : (
            <Skeleton
              animation="wave"
              variant="rectangular"
              height={26}
              sx={{ mt: 1, mb: 1 }}
            />
          )}
          {activityPosts && activityPosts.length > 0 && (
            <>
              <Box ref={activityListTitleWrapperRef}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // minHeight: 48,
                    background: "#fff",
                  }}
                >
                  <Typography
                    color="rgba(0, 0, 0, 0.6)"
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    直播列表
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      size="medium"
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => setIsAddingActivityProducts(true)}
                      sx={{ textAlign: "center", display: "none" }}
                    >
                      新增活動商品
                    </Button>
                    <Button
                      size="medium"
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => {
                        if (draftInfo) {
                          setIsDisplayedDraft(true);
                        } else {
                          onAddedCurProduct();
                        }
                      }}
                      sx={{ textAlign: "center", ml: 1 }}
                    >
                      新增直播
                    </Button>
                  </Box>
                </Box>
                {/* <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  minHeight: 48,
                  background: "#E5F6FD",
                  mt: 1,
                  mb: 1,
                }}
              >
                <InfoIcon color="primary" sx={{ ml: 1, mr: 1 }} />
                <Typography color="#014361" variant="body2">
                  僅顯示您有管理權限的貼文。若未看見貼文，可能是您沒有相應的管理權限或尚未進行外部網站的關聯。
                </Typography>
              </Box> */}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    minHeight: 48,
                    background: "#fff",
                    mt: 1,
                    mb: 1,
                  }}
                >
                  <ToggleButtonGroup
                    size="small"
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleAlignmentChange}
                    aria-label="Platform"
                  >
                    {toggleOptions.map((item, index) => (
                      <ToggleButton key={index} value={item.value}>
                        {item.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Box>
              <PostList
                type={alignment}
                onDuplicatePost={duplicatePost}
                isRequestingUpdatePosts={isRequestingUpdatePosts}
                onDeletePost={deletePost}
                activityListHeight={
                  activityHeight -
                  (activityNameWrapperRef.current?.clientHeight || 0) -
                  (activityListTitleWrapperRef.current?.clientHeight || 0)
                }
              />
            </>
          )}
          {activityPosts && !activityPosts.length && (
            <EmptyActivity
              onAddProducts={() => setIsAddingActivityProducts(true)}
              onNewLive={() => onAddedCurProduct()}
              isDisable={activityProducts?.length === 0}
              activityListHeight={
                activityHeight -
                (activityNameWrapperRef.current?.clientHeight || 0) -
                (activityListTitleWrapperRef.current?.clientHeight || 0)
              }
            />
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
      </Container>
      <AddProductDialog
        products={shopProducts}
        activityProducts={activityProducts}
        isVisible={isAddingActivityProducts}
        categories={curCategories}
        onOk={() => onAddProductSuccess()}
        onCancel={() => setIsAddingActivityProducts(false)}
      />
      <SelectChannelDialog
        draftInfo={draftInfo}
        isVisible={isSelectingChannel}
        onCancel={() => setIsSelectingChannel(false)}
        onOk={(val: string) => {
          if (val === "create") {
            createNewPost();
          }
          // setIsSelectingChannel(false);
        }}
      />
      <Dialog
        open={isDisplayedDraft}
        onClose={() => setIsDisplayedDraft(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">直播草稿</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ display: "flex" }}
          >
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography>您有正在編輯的直播草稿</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDisplayedDraft(false)}>取消</Button>
          <Button
            onClick={() =>
              navigate(
                `/liveroom/draft/activities/${draftInfo?.acivityId}/posts/${draftInfo?.postId}`
              )
            }
          >
            編輯草稿
          </Button>
          <Button
            onClick={() => {
              setIsDisplayedDraft(false);
              onAddedCurProduct();
            }}
          >
            新增直播
          </Button>
        </DialogActions>
      </Dialog>
      <Loading isVisible={isInit} />
    </>
  );
}

export default Activity;
