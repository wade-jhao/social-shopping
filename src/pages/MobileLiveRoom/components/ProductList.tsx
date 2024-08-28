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
import { useAppDispatch, useAppSelector } from "@store/hooks";
import Typography from "@mui/material/Typography";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Skeleton from "@mui/material/Skeleton";
import AddProductDialog from "./AddProductDialog-new";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CategoriesSelector from "@components/CategoriesSelector";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import _ from "lodash";
import CreateProductDialog from "@components/CreateProductForm/CreateProductDialog";

interface PROPS {
  onDeleteProds: Function;
  onCheckedChange: Function;
  onBroadcastProducts: Function;
  checkedList: string[];
}
function ProductList(props: PROPS) {
  const { onCheckedChange, checkedList, onDeleteProds, onBroadcastProducts } =
    props;
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const productList = useAppSelector(selectProducts);
  const curCategories = useAppSelector(selectProductCategories);
  const [searchingWord, setSearchingWord] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  // const [checked, setChecked] = useState<string[]>([]);
  const [moreActionAnchorEl, setMoreActionAnchorEl] =
    useState<null | HTMLElement>(null);
  const [addProductAnchorEl, setAddProductAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMoreActionMenu = Boolean(moreActionAnchorEl);
  const openAddProductMenu = Boolean(addProductAnchorEl);
  const [curCategoryId, setCurCategoryId] = useState("");
  const arrSkelton = new Array(8).fill(0);

  const settingMenu = [
    {
      icon: CampaignOutlinedIcon,
      name: "曝光多個商品",
      onClick: (e: any) => onBroadcastProducts(true),
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

  const onSelectAllChange = () => {
    if (getFilteredProducts().length === checkedList.length) {
      onCheckedChange([]);
    } else {
      onCheckedChange(getFilteredProducts().map((product) => product.id));
    }
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

  return (
    <>
      {productList && (
        <Box sx={{ background: "#fff", pr: 1, pl: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
    </>
  );
}

export default ProductList;
