import { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import AddProductDataTable from "./AddProductDataTable";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CategoriesSelector from "@components/CategoriesSelector";
import AutoCompleteSearchBar from "@components/AutoCompleteSearchBar";
import { PRODUCT, PRODUCT_CATEGORY } from "../apis/legacy";
import _ from "lodash";
import { filterProducts } from "@utils/productSearch";

interface PROPS {
  isVisible: boolean;
  onOk: Function;
  onCancel: Function;
  products: PRODUCT[];
  activityProducts: PRODUCT[] | null;
  categories: PRODUCT_CATEGORY[] | null;
}
function AddProductDialog(props: PROPS) {
  const { isVisible, onCancel, products, categories, activityProducts } = props;
  const [curCategoryId, setCurCategoryId] = useState("default");
  const [searchingWordName, setSearchingWordName] = useState("");
  const [searchingWordSn, setSearchingWordSn] = useState("");
  const getFilteredList = filterProducts(
    products,
    activityProducts,
    categories,
    {
      name: searchingWordName,
      sn: searchingWordSn,
      curCategoryId: curCategoryId,
      status: [],
    }
  );

  const debounceSearch = _.debounce((val: string, dispatch: Function) => {
    dispatch(val);
  }, 300);

  const searchedCallback = useCallback((val: string, dispatch: Function) => {
    debounceSearch(val, dispatch);
  }, []);

  return (
    <Dialog
      fullScreen={true}
      open={isVisible}
      scroll={"paper"}
      onClose={() => onCancel()}
    >
      <DialogTitle>新增活動商品</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 1, padding: 1 }}>
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
          </Box>
        </Box>
        <AddProductDataTable products={getFilteredList} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          取消
        </Button>
        <Button onClick={() => {}} variant="contained">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProductDialog;
