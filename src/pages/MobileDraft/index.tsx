import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProductDialog from "./components/AddProductDialog-new";
import {
  getAllSocialAccountsAtOnceAsync,
  selectProducts,
} from "@store/liveroomSlice";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { selectApis } from "@store/apiSlice";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import VideocamIcon from "@mui/icons-material/Videocam";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";
import CommentIcon from "@mui/icons-material/Comment";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { setNotice } from "@store/commonSlice";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { editKeywordsAsync, deleteProductAsync } from "@store/liveroomSlice";
import DraftComment from "./components/DraftComment";
import SelectChannelDialog from "./components/SelectChannelDialog";
import Typography from "@mui/material/Typography";
import Activity from "./components/Activity";
import { useLocalStorage } from "@utils/index";
import LivePost from "./components/LivePost";
import MyProfile from "./components/MyProfile";
import CreateProductDialog from "@components/CreateProductForm/CreateProductDialog";
interface PROPS {
  fansPageId: string;
  postId: string;
}

function MobileDraft(props: PROPS) {
  const { activityId, postId } = useParams();
  const productList = useAppSelector(selectProducts);
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const [value, setValue] = useState(0);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [draftInfo, setDraftInfo] = useLocalStorage("draft_info", "");
  const [curSocial, setCurSocial] = useState(draftInfo);
  const [isDeletingProds, setIsDeletingProds] = useState<boolean>(false);
  const [checkedProducts, setCheckedProducts] = useState<string[]>([]);
  const [isSelectingChannel, setIsSelectingChannel] = useState(
    draftInfo === ""
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const refBottomNavigation = useRef<any>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      keyword: "",
    },
  });

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
      label: "留言",
      icon: CommentIcon,
    },
    {
      label: "更多",
      icon: MoreHorizIcon,
    },
  ];

  useEffect(() => {
    dispatch(
      getAllSocialAccountsAtOnceAsync({
        url: apis?.social_accounts as string,
      })
    );
  }, [apis?.social_accounts, draftInfo, dispatch]);

  const onDeleteProds = () => {
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
              // setIsEditingKeyword(false);
            },
          })
        )
      );
    });
    await Promise.all(promiseActions).catch(() => setIsRequesting(false));
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

  return (
    <>
      <Box sx={{ pb: 7 }} ref={ref}>
        <Box id="mobile-header" />
        <Activity channel={curSocial} onSwitchChannel={() => {}} />
        <Box
          sx={{
            display: value === 0 ? "block" : "none",
            overflowX: "hidden",
          }}
        >
          <ProductList
            onCheckedChange={(checked: string[]) => setCheckedProducts(checked)}
            onAddProducts={() => setIsAddingProduct(true)}
            onCreateProducts={() => setIsCreatingProduct(true)}
            onEditKeyWords={() => setIsEditingKeywords(true)}
            onDeleteProds={() => onDeleteProds()}
            checkedList={checkedProducts}
          />
        </Box>
        <Box
          sx={{
            display: value === 1 ? "block" : "none",
          }}
        >
          <LivePost
            channel={curSocial}
            onChannelChange={(val: string) => {
              setIsSelectingChannel(true);
              setCurSocial(val);
            }}
            onSwitchChannel={() => {
              setIsSelectingChannel(true);
            }}
          />
        </Box>
        <Box
          sx={{
            display: value === 2 ? "block" : "none",
          }}
        >
          <DraftComment />
        </Box>

        <Box
          sx={{
            display: value === 3 ? "block" : "none",
          }}
        >
          <MyProfile />
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
            variant="contained"
            loading={isRequesting}
            onClick={handleSubmit(onSubmit)}
          >
            確定
          </LoadingButton>
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
      <SelectChannelDialog
        isVisible={isSelectingChannel}
        onCancel={() => setIsSelectingChannel(false)}
        onOk={(val: string) => {
          setCurSocial(val);
          setDraftInfo(val);
          setIsSelectingChannel(false);
        }}
      />
    </>
  );
}

export default MobileDraft;
