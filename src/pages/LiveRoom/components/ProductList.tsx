import { useEffect, useState, useCallback } from "react";
import ProductItem from "./ProductItem";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import { selectApis } from "@store/apiSlice";
import { useParams } from "react-router-dom";
import {
  selectProducts,
  getProdsAsync,
  getActivityProdsAsync,
  getProductCategoriesAsync,
  selectProductCategories,
} from "@store/liveroomSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import Skeleton from "@mui/material/Skeleton";
import CategoriesSelector from "@components/CategoriesSelector";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import _ from "lodash";

interface PROPS {
  onCheckedChange: Function;
  checkedList: string[];
}
function ProductList(props: PROPS) {
  const { onCheckedChange, checkedList } = props;
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const productList = useAppSelector(selectProducts);
  const curCategories = useAppSelector(selectProductCategories);
  const [searchingWord, setSearchingWord] = useState("");
  const [curCategoryId, setCurCategoryId] = useState("");
  const arrSkelton = new Array(8).fill(0);
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (curCategories && curCategories.length) {
      setCurCategoryId(curCategories[0].id);
    }
  }, [curCategories]);

  const debounceSearch = _.debounce((val: string) => {
    setSearchingWord(val);
    onCheckedChange([]);
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

  const getFilteredProducts = () => {
    if (!productList) {
      return [];
    }
    let filterProducts = productList;
    const curCategory: string =
      curCategories?.find((category) => category.id === curCategoryId)?.title ||
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
            product.name
              .toLocaleUpperCase()
              .includes(curSearchingWord.toLocaleUpperCase()) ||
            product.sn
              .toLocaleUpperCase()
              .includes(curSearchingWord.toLocaleUpperCase()) ||
            (product.nicknames &&
              product.nicknames
                .map((nickname) => nickname.toLocaleUpperCase())
                ?.find((nickname) =>
                  nickname.includes(curSearchingWord.toLocaleUpperCase())
                ))
        );
      } else {
        const val = filterProducts.filter((product) => {
          return (
            product.name
              .toLocaleUpperCase()
              .includes(arrSearchingWords[0].toLocaleUpperCase()) &&
            product.sn
              .toLocaleUpperCase()
              .includes(arrSearchingWords[1].toLocaleUpperCase())
          );
        });
        return val;
      }
    }
    return filterProducts;
  };

  const onSelectAllChange = () => {
    if (getFilteredProducts().length === checkedList.length) {
      onCheckedChange([]);
    } else {
      onCheckedChange(getFilteredProducts().map((product) => product.id));
    }
  };

  return (
    <>
      {productList && (
        <Box>
          <Box sx={{ mb: 1 }}>
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
                  label="商品名稱/編號/關鍵字"
                  placeholder="搜索已新增直播商品"
                  options={productList}
                  onSelect={(val: string) => searchedCallback(val)}
                />
              </Grid>
            </Grid>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={getFilteredProducts().length === checkedList.length}
                indeterminate={
                  checkedList.length > 0 &&
                  checkedList.length !== getFilteredProducts().length
                }
                onChange={onSelectAllChange}
              />
            }
            label="全選"
          />
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            disablePadding
          >
            {getFilteredProducts()?.map((item, index) => (
              <ProductItem
                key={index}
                product={item}
                checkedList={checkedList}
                onChange={(id: string) => {
                  if (checkedList.includes(id)) {
                    onCheckedChange(
                      checkedList.filter((check) => check !== id)
                    );
                    // setChecked(checkedList.filter((check) => check !== id));
                  } else {
                    onCheckedChange(checkedList.concat(id));
                    // setChecked(checkedList.concat(id));
                  }
                }}
                products={getFilteredProducts()}
              />
            ))}
          </List>
        </Box>
      )}
      {!productList && (
        <Box sx={{ width: "100%" }}>
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
    </>
  );
}

export default ProductList;
