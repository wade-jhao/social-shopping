import { useState, useCallback } from "react";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import AddProductDataTable from "./AddProductDataTable";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import CategoriesSelector from "@components/CategoriesSelector";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import IconButton from "@mui/material/IconButton";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { PRODUCT, addActivityProducts } from "../apis/legacy";
import CloseIcon from "@mui/icons-material/Close";
import { selectApis } from "@store/apiSlice";
import { setNotice } from "@store/commonSlice";
import {
  selectProducts,
  selectProductCategories,
  addCurProductAsync,
  getProdsAsync,
  selectShopProducts,
} from "@store/liveroomSlice";
import { useLocalStorage } from "@utils/index";
import _ from "lodash";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { filterProducts } from "@utils/productSearch";

interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
}
function AddProductDialog(props: PROPS) {
  const { activityId, postId } = useParams();
  const { isVisible, onCancel, onOk } = props;
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectShopProducts);
  const apis = useAppSelector(selectApis);
  const postProducts = useAppSelector(selectProducts);
  const categories = useAppSelector(selectProductCategories);
  const [checked, setChecked] = useState<string[]>([]);
  const [curCategoryId, setCurCategoryId] = useState("default");
  const [searchingWordName, setSearchingWordName] = useState("");
  const [searchingWordSn, setSearchingWordSn] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const arrSkelton = new Array(8).fill(0);
  const [filterProductStatus, setFilterProductStatus] = useState<
    PRODUCT["status"][]
  >([]);
  const [localDefaultProduct, setLocalDefaultProduct] = useLocalStorage(
    "default_product",
    JSON.stringify("")
  );
  const productStatusList: PRODUCT["status"][] = ["上架", "下架", "半隱藏"];
  const getFilteredList = filterProducts(
    products,
    postProducts
      ? postProducts?.filter((item) => {
          const defaultProduct = JSON.parse(localDefaultProduct);
          const defaultProductId = defaultProduct[`${activityId}-${postId}`];
          return item.id !== defaultProductId;
        })
      : [],
    categories,
    {
      name: searchingWordName,
      sn: searchingWordSn,
      curCategoryId: curCategoryId,
      status: filterProductStatus,
    }
  );
  const debounceSearch = _.debounce((val: string, dispatch: Function) => {
    dispatch(val);
  }, 300);

  const searchedCallback = useCallback((val: string, dispatch: Function) => {
    debounceSearch(val, dispatch);
  }, []);

  const onAddedCurProduct = async () => {
    setChecked([]);
    if (!checked.length) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "請選擇要新增的商品",
          type: "info",
        })
      );
      return;
    }
    const defaultProduct = JSON.parse(localDefaultProduct);
    const defaultProductId = defaultProduct[`${activityId}-${postId}`]
      ? defaultProduct[`${activityId}-${postId}`].toString()
      : "";
    for (let i = 0; i < checked.length; i++) {
      if (checked[i].toString() === defaultProductId) {
        if (
          Object.prototype.hasOwnProperty.call(
            defaultProduct,
            `${activityId}-${postId}`
          )
        ) {
          delete defaultProduct[`${activityId}-${postId}`];
        }
        await setLocalDefaultProduct(JSON.stringify(defaultProduct));
        break;
      }
    }

    setIsRequesting(true);
    await addActivityProducts(
      apis?.activity_create_product as string,
      activityId as string,
      checked.toString()
    )
      .then(() => {
        dispatch(
          addCurProductAsync({
            url: apis?.activity_post_products as string,
            activityId: activityId as string,
            postId: postId as string,
            prodIds: checked.toString(),
            onSuccess: () => {
              dispatch(
                getProdsAsync({
                  urlProd: apis?.activity_post_products as string,
                  urlNicknames: apis?.products_nicknames as string,
                  activityId: activityId as string,
                  postId: postId as string,
                })
              );
              dispatch(
                setNotice({
                  isErroring: true,
                  message: "新增直播商品成功",
                  type: "success",
                })
              );
              resetFilterState();
              setIsRequesting(false);
              onOk();
            },
          })
        ).catch(() => {
          setIsRequesting(false);
        });
      })
      .catch((e) => {
        setIsRequesting(false);
      });
  };

  const resetFilterState = () => {
    setCurCategoryId("default");
    setSearchingWordName("");
    setSearchingWordSn("");
    setFilterProductStatus([]);
  };

  return (
    <Dialog
      fullScreen={true}
      open={isVisible}
      scroll={"paper"}
      onClose={() => {
        resetFilterState();
        onCancel();
      }}
    >
      <DialogTitle>新增直播商品</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          resetFilterState();
          onCancel();
        }}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers={true} sx={{ pt: 1, padding: 1 }}>
        {products && (
          <Box>
            <Box sx={{ mt: 1 }}>
              <Box>
                <Grid container spacing={0} sx={{ gap: 1 }}>
                  <Grid item xs={4} sm={2}>
                    <CategoriesSelector
                      value={curCategoryId}
                      categories={categories}
                      onChange={(val: string) => {
                        setCurCategoryId(val);
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <AutoCompleteSearchBar
                      label="商品名稱"
                      placeholder="搜索商家商品"
                      options={getFilteredList}
                      onSelect={(val: string) =>
                        searchedCallback(val, setSearchingWordName)
                      }
                      value={searchingWordName}
                      setValue={setSearchingWordName}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <AutoCompleteSearchBar
                      label="商品編號"
                      placeholder="搜索商品編號"
                      isAutoFocus={false}
                      options={getFilteredList}
                      onSelect={(val: string) =>
                        searchedCallback(val, setSearchingWordSn)
                      }
                      value={searchingWordSn}
                      setValue={setSearchingWordSn}
                    />
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <Autocomplete
                      sx={{ mt: -1 }}
                      fullWidth
                      multiple
                      options={productStatusList}
                      getOptionLabel={(option) => option}
                      value={filterProductStatus}
                      onChange={(e, value: PRODUCT["status"][]) => {
                        setFilterProductStatus(value);
                      }}
                      renderTags={(
                        value: readonly PRODUCT["status"][],
                        getTagProps
                      ) =>
                        value.map(
                          (option: PRODUCT["status"], index: number) => (
                            <Chip
                              size="small"
                              label={option}
                              {...getTagProps({ index })}
                            />
                          )
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="outlined"
                          label={"商品狀態"}
                          placeholder={
                            filterProductStatus.length === 0
                              ? `商品狀態（${productStatusList.length}）`
                              : ""
                          }
                          margin="dense"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <AddProductDataTable
              products={getFilteredList}
              onSelect={(val: string[]) => setChecked(val)}
            />
          </Box>
        )}

        {!products &&
          arrSkelton.map((item, index) => (
            <Skeleton
              key={index}
              animation="wave"
              variant="rectangular"
              height={60}
              sx={{ mt: 1, mb: 1 }}
            />
          ))}
      </DialogContent>
      <DialogActions>
        <Button
          size="large"
          onClick={() => {
            resetFilterState();
            onCancel();
          }}
        >
          取消
        </Button>
        <LoadingButton
          size="large"
          loading={isRequesting}
          onClick={onAddedCurProduct}
          variant="contained"
        >
          確定
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddProductDialog;
