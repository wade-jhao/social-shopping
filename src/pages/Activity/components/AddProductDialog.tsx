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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ActivityProductItem from "./ActivityProductItem";
import { selectApis } from "@store/apiSlice";
import Empty from "@components/Empty";
import { useAppSelector } from "@store/hooks";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import { PRODUCT, addActivityProducts, PRODUCT_CATEGORY } from "../apis/legacy";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@store/hooks";
import { setNotice } from "@store/commonSlice";
import CategoriesSelector from "@components/CategoriesSelector";
import _ from "lodash";

interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
  products: PRODUCT[];
  activityProducts: PRODUCT[] | null;
  categories: PRODUCT_CATEGORY[] | null;
}
function AddProductDialog(props: PROPS) {
  const { activityId } = useParams();
  const { isVisible, onOk, onCancel, products, activityProducts, categories } =
    props;
  const apis = useAppSelector(selectApis);
  const [searchingWord, setSearchingWord] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [value, setValue] = useState(0);
  const [curCategoryId, setCurCategoryId] = useState("");
  const dispatch = useAppDispatch();

  const tabList = [
    {
      label: `可新增商家商品（${
        activityProducts
          ? products.filter(
              (item1) =>
                !activityProducts.some((item2) => item1.id === item2.id)
            ).length
          : products.length
      })`,
      value: "all",
    },
    {
      label: `已新增活動商品（${activityProducts?.length || 0})`,
      value: "added",
    },
  ];
  useEffect(() => {
    if (categories && categories.length) {
      setCurCategoryId(categories[0].id);
    }
  }, [categories]);
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
    addActivityProducts(
      apis?.activity_create_product as string,
      activityId as string,
      checked.toString()
    ).then(() => {
      dispatch(
        setNotice({
          isErroring: true,
          message: "新增活動商品成功",
          type: "success",
        })
      );
      onOk();
    });
  };

  const debounceSearch = _.debounce((val: string) => {
    setSearchingWord(val);
  }, 300);

  const searchedCallback = useCallback((val: string) => {
    debounceSearch(val);
  }, []);

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
    if (!products) {
      return [];
    } else {
      let filterProducts = activityProducts
        ? products.filter(
            (item1) => !activityProducts.some((item2) => item1.id === item2.id)
          )
        : products;
      const curCategory: string =
        categories?.find((category) => category.id === curCategoryId)?.title ||
        "";
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

  const getActivityFilteredList = () => {
    if (!activityProducts) {
      return [];
    } else {
      let filterProducts = activityProducts;
      const curCategory: string =
        categories?.find((category) => category.id === curCategoryId)?.title ||
        "";
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (categories) {
      setCurCategoryId(categories[0].id);
    }
    searchedCallback("");
    setValue(newValue);
  };

  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>新增活動商品</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 1, padding: 1 }}>
        <Tabs value={value} onChange={handleChange} aria-label="products tabs">
          {tabList.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
        {value === 0 && (
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
                    categories={categories}
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
                    placeholder="搜索商家商品"
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
              {getFilteredList()?.length && searchingWord === "" ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={checked.length === getFilteredList()?.length}
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
              {getFilteredList()?.map((product, index) => (
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
              ))}
              {!getFilteredList()?.length && <Empty message="沒有更多商品" />}
            </Box>
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
                    categories={categories}
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
                    placeholder="搜索已新增活動商品"
                    options={getActivityFilteredList()}
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
              {getActivityFilteredList()?.map((product, index) => (
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
              {!getActivityFilteredList()?.length && (
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
