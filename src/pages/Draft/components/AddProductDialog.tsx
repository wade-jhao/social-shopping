import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import ActivityProductItem from "../../Activity/components/ActivityProductItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
import { setNotice } from "@store/commonSlice";
import {
  selectActivityProducts,
  selectProducts,
  addCurProductAsync,
  getProdsAsync,
  selectProductCategories,
} from "@store/liveroomSlice";
import Empty from "@components/Empty";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import CategoriesSelector from "@components/CategoriesSelector";
import _ from "lodash";

interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
}
function AddProductDialog(props: PROPS) {
  const { isVisible, onOk, onCancel } = props;
  const apis = useAppSelector(selectApis);
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const activityProducts = useAppSelector(selectActivityProducts);
  const curCategories = useAppSelector(selectProductCategories);
  const [searchingWord, setSearchingWord] = useState("");
  const curProducts = useAppSelector(selectProducts);
  const [checked, setChecked] = useState<string[]>([]);
  const [value, setValue] = useState(0);
  const [curCategoryId, setCurCategoryId] = useState("");

  useEffect(() => {
    if (curCategories && curCategories.length) {
      setCurCategoryId(curCategories[0].id);
    }
  }, [curCategories]);

  const tabList = [
    {
      label: `可新增活動商品（${
        curProducts && activityProducts
          ? activityProducts.filter(
              (item1) => !curProducts.some((item2) => item1.id === item2.id)
            ).length
          : 0
      })`,
      value: "all",
    },
    {
      label: `已新增直播商品（${curProducts?.length || 0})`,
      value: "added",
    },
  ];

  const checkSubCategory = (
    subCategorys: string[] | null,
    category: string
  ) => {
    if (!subCategorys) {
      return false;
    }
    for (let i = 0; i < subCategorys.length; i++) {
      if (subCategorys[i]?.includes(category)) {
        return true;
      }
    }
    return false;
  };

  const getFilteredList = () => {
    if (!activityProducts) {
      return [];
    } else {
      if (!curProducts) {
        return activityProducts;
      } else {
        let filterProducts = activityProducts.filter(
          (item1) => !curProducts.some((item2) => item1.id === item2.id)
        );
        const curCategory: string =
          curCategories?.find((category) => category.id === curCategoryId)
            ?.title || "";
        if (curCategory !== "" && curCategoryId !== "default") {
          filterProducts = filterProducts.filter(
            (product) =>
              product.main_category?.includes(curCategory) ||
              checkSubCategory(product.sub_categories, curCategory)
          );
        }
        if (searchingWord !== "") {
          const arrSearchingWords = searchingWord.trim().split(" ");
          if (arrSearchingWords.length === 1) {
            const curSearchingWord = arrSearchingWords[0];
            return filterProducts.filter(
              (product) =>
                product.name.includes(curSearchingWord) ||
                product.sn.includes(curSearchingWord)
            );
          } else {
            return filterProducts.filter((product) => {
              return (
                product.name.includes(arrSearchingWords[0]) &&
                product.sn.includes(arrSearchingWords[1])
              );
            });
          }
        }
        return filterProducts;
      }
    }
  };

  const getCurProdsFilteredList = () => {
    if (!curProducts) {
      return [];
    } else {
      let filterProducts = curProducts;
      const curCategory: string =
        curCategories?.find((category) => category.id === curCategoryId)
          ?.title || "";
      if (curCategory !== "" && curCategoryId !== "default") {
        filterProducts = filterProducts.filter(
          (product) =>
            product.main_category?.includes(curCategory) ||
            checkSubCategory(product.sub_categories, curCategory)
        );
      }
      if (searchingWord !== "") {
        const arrSearchingWords = searchingWord.trim().split(" ");
        if (arrSearchingWords.length === 1) {
          const curSearchingWord = arrSearchingWords[0];
          return filterProducts.filter(
            (product) =>
              product.name.includes(curSearchingWord) ||
              product.sn.includes(curSearchingWord)
          );
        } else {
          const val = filterProducts.filter((product) => {
            return (
              product.name.includes(arrSearchingWords[0]) &&
              product.sn.includes(arrSearchingWords[1])
            );
          });
          return val;
        }
      }
      return filterProducts;
    }
  };

  const debounceSearch = _.debounce((val: string) => {
    setSearchingWord(val);
  }, 300);

  const searchedCallback = useCallback((val: string) => {
    debounceSearch(val);
  }, []);

  const onAddedCurProduct = () => {
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
          onOk();
        },
      })
    );
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (curCategories) {
      setCurCategoryId(curCategories[0].id);
    }
    searchedCallback("");
    setValue(newValue);
  };

  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>新增直播商品</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="products tabs">
          {tabList.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
        {value === 0 && (
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={0} sx={{ display: "flex" }}>
              <Grid
                item
                xs={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CategoriesSelector
                  value={curCategoryId}
                  categories={curCategories}
                  onChange={(val: string) => {
                    setCurCategoryId(val);
                  }}
                />
              </Grid>
              <Grid
                item
                xs={9}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <AutoCompleteSearchBar
                  label="商品名稱/編號"
                  placeholder="搜索活動商品"
                  options={getFilteredList()}
                  onSelect={(val: string) => searchedCallback(val)}
                />
              </Grid>
            </Grid>
            <Grid container spacing={0} sx={{ display: "flex" }}>
              <Grid
                item
                xs={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              ></Grid>
              <Grid
                item
                xs={9}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.60)", pl: 1 }}
                >
                  支援跨欄位搜尋，中間以空白鍵分隔，如：正韓製 T2308
                </Typography>
              </Grid>
            </Grid>
            {getFilteredList().length && searchingWord === "" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={checked.length === getFilteredList().length}
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                    onClick={(e) => {
                      e.stopPropagation();
                      const filterList = getFilteredList();
                      if (checked.length !== filterList.length) {
                        setChecked(filterList.map((product) => product.id));
                      } else {
                        setChecked([]);
                      }
                    }}
                  />
                  <Typography variant="body2">全選</Typography>
                </Box>
              </Box>
            ) : null}
            {getFilteredList().length
              ? getFilteredList()?.map((product, index) => (
                  <ActivityProductItem
                    key={index}
                    product={product}
                    isChecked={
                      checked.filter((id) => id === product.id).length > 0
                    }
                    onChange={(id: string) => {
                      if (checked.includes(id)) {
                        setChecked(checked.filter((check) => check !== id));
                      } else {
                        setChecked(checked.concat(id));
                      }
                    }}
                  />
                ))
              : null}
            {!getFilteredList().length && <Empty message="沒有更多商品" />}
          </Box>
        )}
        {value === 1 && (
          <Box sx={{ mt: 1 }}>
            <Box>
              <Grid container spacing={0} sx={{ display: "flex" }}>
                <Grid
                  item
                  xs={3}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CategoriesSelector
                    value={curCategoryId}
                    categories={curCategories}
                    onChange={(val: string) => {
                      setCurCategoryId(val);
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={9}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AutoCompleteSearchBar
                    label="商品名稱/編號"
                    placeholder="搜索已新增直播商品"
                    options={getCurProdsFilteredList()}
                    onSelect={(val: string) => searchedCallback(val)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={0} sx={{ display: "flex" }}>
                <Grid
                  item
                  xs={3}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                ></Grid>
                <Grid
                  item
                  xs={9}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(0, 0, 0, 0.60)", pl: 1 }}
                  >
                    支援跨欄位搜尋，中間以空白鍵分隔，如：正韓製 T2308
                  </Typography>
                </Grid>
              </Grid>
              {getCurProdsFilteredList()?.map((product, index) => (
                <ActivityProductItem
                  isAdded={true}
                  key={index}
                  product={product}
                  isChecked={
                    checked.filter((id) => id === product.id).length > 0
                  }
                  onChange={(id: string) => {
                    if (checked.includes(id)) {
                      setChecked(checked.filter((check) => check !== id));
                    } else {
                      setChecked(checked.concat(id));
                    }
                  }}
                />
              ))}
              {!getCurProdsFilteredList()?.length && (
                <Empty message="沒有更多商品" />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setChecked([]);
            onCancel();
          }}
        >
          取消
        </Button>
        <Button variant="contained" onClick={onAddedCurProduct}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProductDialog;
