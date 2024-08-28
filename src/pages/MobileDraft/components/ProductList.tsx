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
  getShopProductsAsync,
} from "@store/liveroomSlice";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CategoriesSelector from "@components/CategoriesSelector";
import FormControlLabel from "@mui/material/FormControlLabel";
import ProductIcon from "@assets/empty-products-icon.svg";
import Checkbox from "@mui/material/Checkbox";
import _ from "lodash";

interface PROPS {
  onAddProducts: Function;
  onCreateProducts: Function;
  onEditKeyWords: Function;
  onCheckedChange: Function;
  onDeleteProds: Function;
  checkedList: string[];
}

function ProductList(props: PROPS) {
  const {
    onAddProducts,
    onCreateProducts,
    onEditKeyWords,
    onCheckedChange,
    onDeleteProds,
    checkedList,
  } = props;
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const productList = useAppSelector(selectProducts);
  const curCategories = useAppSelector(selectProductCategories);
  const [isEmptyProducts, setIsEmptyProducts] = useState(true);
  const [searchingWord, setSearchingWord] = useState("");
  const [curCategoryId, setCurCategoryId] = useState("");
  // const [checked, setChecked] = useState<string[]>([]);
  const [moreActionAnchorEl, setMoreActionAnchorEl] =
    useState<null | HTMLElement>(null);
  const [addProductAnchorEl, setAddProductAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMoreActionMenu = Boolean(moreActionAnchorEl);
  const openAddProductMenu = Boolean(addProductAnchorEl);
  const arrSkelton = new Array(8).fill(0);

  const settingMenu = [
    {
      icon: EditIcon,
      name: "自動化關鍵字",
      onClick: (e: any) => {
        e.stopPropagation();
        onEditKeyWords(true);
      },
    },
    {
      icon: DeleteIcon,
      name: "刪除多個商品",
      onClick: (e: any) => {
        e.stopPropagation();
        onDeleteProds(true);
      },
    },
  ];

  const addProductMenu = [
    {
      icon: SellOutlinedIcon,
      name: "選擇現有商品",
      onClick: (e: any) => {
        e.stopPropagation();
        onAddProducts(true);
      },
    },
    {
      icon: StorefrontOutlinedIcon,
      name: "建立新商品",
      onClick: (e: any) => {
        e.stopPropagation();
        onCreateProducts(true);
      },
    },
  ];

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
    dispatch(getShopProductsAsync({ url: apis?.products as string }));
    dispatch(getProductCategoriesAsync({ url: apis?.categories as string }));
  }, []);

  useEffect(() => {
    if (productList) {
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
      } else {
        setIsEmptyProducts(true);
      }
    }
  }, [productList]);

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
      {productList && !isEmptyProducts && (
        <Box sx={{ background: "#fff", pr: 1, pl: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              right: "10px",
              minHeight: "48px",
              width: "100%",
            }}
          >
            <Typography
              color="rgba(0, 0, 0, 0.8)"
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center" }}
            >
              直播商品
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                size="medium"
                variant="outlined"
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.stopPropagation();
                  setMoreActionAnchorEl(event.currentTarget);
                }}
                sx={{ textAlign: "center" }}
              >
                更多動作
              </Button>
              <Menu
                id="long-menu"
                MenuListProps={{
                  "aria-labelledby": "long-button",
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
                size="medium"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={(event) => {
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
          <Box sx={{ mb: 1, mt: 1 }}>
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
      {productList && isEmptyProducts && (
        <Box
          sx={{
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
            size="medium"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={(event) => {
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
