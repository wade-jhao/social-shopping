import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ProductItem from "./ProductItem";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import { selectProducts, selectProductCategories } from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import CategoriesSelector from "@components/CategoriesSelector";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Skeleton from "@mui/material/Skeleton";
// import { useLocalStorage } from "@utils/index";
import _ from "lodash";

interface PROPS {
  onCheckedChange: Function;
  checkedList: string[];
}

function ProductList(props: PROPS) {
  let { activityId, postId } = useParams();
  // const [localDefaultProduct] = useLocalStorage(
  //   "default_product",
  //   JSON.stringify("")
  // );
  const { onCheckedChange, checkedList } = props;
  const productList = useAppSelector(selectProducts);
  const curCategories = useAppSelector(selectProductCategories);
  const [searchingWord, setSearchingWord] = useState("");
  const [curCategoryId, setCurCategoryId] = useState("");
  const arrSkelton = new Array(8).fill(0);

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

    const defaultProduct = window.localStorage.getItem("default_product")
      ? JSON.parse(
          JSON.parse(window.localStorage.getItem("default_product") || "") || ""
        )
      : {}; // get latest default_product because localDefaultProduct is not invoked on useEffect

    const displayId = defaultProduct[`${activityId}-${postId}`]
      ? defaultProduct[`${activityId}-${postId}`].toString()
      : "";
    let filterProducts = productList.filter(
      (product) => product.id.toString() !== displayId.toString()
    );
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
        <Box sx={{ mt: 1 }}>
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
                  } else {
                    onCheckedChange(checkedList.concat(id));
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
