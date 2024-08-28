import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import { useParams } from "react-router-dom";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { selectApis } from "@store/apiSlice";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ChipTextField from "@components/ChipTextField";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Stack from "@mui/material/Stack";
import { editVariantsKeywordsAsync } from "@store/liveroomSlice";
import { PRODUCT } from "../apis/legacy";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { Grid } from "@mui/material";
import Thumbnail from "@assets/thumbnail.svg";

interface PROPS {
  isVisible: boolean;
  product: PRODUCT;
  onCancel: Function;
}
function EditVariantsDialog(props: PROPS) {
  let { activityId, postId } = useParams();
  const { product, onCancel, isVisible } = props;

  const apis = useAppSelector(selectApis);
  const dispatch = useAppDispatch();
  const getProductPrice = () => {
    const priceList: number[] = [];
    product?.variants?.forEach((varient) => {
      if (!priceList.includes(Number(varient.price))) {
        priceList.push(Number(varient.price));
      }
    });
    priceList.sort();
    let res = "NT$ ";
    priceList?.forEach((pirce) => {
      if (res === "NT$ ") {
        res += pirce;
      } else {
        res += `/${pirce}`;
      }
    });
    return res;
  };

  const renderNewDetailList = (type: "color" | "size") => {
    const detailList: {
      name: string;
      nicknames: string[];
    }[] =
      type === "color"
        ? (product.colors as {
            name: string;
            nicknames: string[];
          }[])
        : (product.sizes as {
            name: string;
            nicknames: string[];
          }[]);
    return (
      <Box sx={{ pt: 1, pb: 1 }}>
        <List component="div" disablePadding>
          {detailList?.map(
            (
              item: {
                name: string;
                nicknames: string[];
              },
              index: number
            ) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Grid container spacing={1}>
                      <Grid item xs={4} sm={3}>
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {item.name.trim()}
                        </Typography>
                      </Grid>
                      <Grid item xs>
                        <ChipTextField
                          type="FORMAT"
                          onAdd={(val: string) => {
                            onSubmit(val, "add", type, item.name);
                          }}
                          onDelete={(val: string) => {
                            onSubmit(val, "delete", type, item.name);
                          }}
                          values={(item.nicknames as string[]) || []}
                          placeholder="設定關鍵字"
                          label={`${type === "color" ? "顏色" : "尺寸"}關鍵字`}
                        />
                      </Grid>
                    </Grid>
                  }
                />
              </ListItem>
            )
          )}
        </List>
      </Box>
    );
  };

  const onSubmit = (
    data: any,
    type: string,
    itemType: "color" | "size",
    variantValue: string
  ) => {
    let curVariantValue: { name: string; nicknames: string[] } | undefined =
      itemType === "color"
        ? product?.colors?.find((color) => color.name === variantValue)
        : product?.sizes?.find((size) => size.name === variantValue);
    if (curVariantValue) {
      curVariantValue = { ...curVariantValue };
      if (type === "add") {
        curVariantValue.nicknames = [
          ...(curVariantValue.nicknames || []),
          data,
        ];
      } else {
        curVariantValue.nicknames = curVariantValue.nicknames
          ? curVariantValue.nicknames?.filter((nickname) => nickname !== data)
          : [];
      }
      dispatch(
        editVariantsKeywordsAsync({
          url: apis?.product_variants_nicknames as string,
          activityId: activityId as string,
          postId: postId as string,
          productId: product.id,
          type: itemType,
          variantValue: variantValue,
          nicknames: curVariantValue?.nicknames,
          onSuccess: () => {},
          urlNicknames: apis?.products_nicknames as string,
        })
      );
    }
  };

  return (
    <Dialog fullWidth={true} open={isVisible} onClose={() => onCancel()}>
      <DialogTitle>編緝商品規格關鍵字</DialogTitle>
      <DialogContent dividers={true} sx={{ pt: 2 }}>
        <List
          sx={{ width: "100%", bgcolor: "background.paper", mb: 1 }}
          component="nav"
          aria-labelledby="nested-list-subheader"
          disablePadding
        >
          <ListItem
            sx={{
              padding: 0,
            }}
            disablePadding
            disableGutters
          >
            <ListItemAvatar sx={{ mr: 1 }}>
              <img
                style={{
                  width: "80px",
                  aspectRatio: 1,
                  objectFit: "contain",
                }}
                src={product.media_url || Thumbnail}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Stack
                    direction={"row"}
                    sx={{ display: "flex", alignItems: "center" }}
                    spacing={1}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      {product.name}
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", color: "rgba(0, 0, 0, 0.6)" }}
                      >
                        {`（${product.sn})`}
                      </Typography>
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ display: "flex", color: "rgba(0, 0, 0, 0.6)" }}
                  >
                    {getProductPrice()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>
        <Divider light />
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">顏色</Typography>
          <List component="div" disablePadding>
            {renderNewDetailList("color")}
          </List>
        </Box>
        <Divider light />
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">尺寸</Typography>
          <List component="div" disablePadding>
            {renderNewDetailList("size")}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onCancel()}>
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditVariantsDialog;
