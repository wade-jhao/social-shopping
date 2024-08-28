import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useParams } from "react-router-dom";
// import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Chip from "@mui/material/Chip";
import { selectApis } from "@store/apiSlice";
import Checkbox from "@mui/material/Checkbox";
import { deleteProductAsync, editKeywordsAsync } from "@store/liveroomSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { PRODUCT } from "../apis/legacy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChipTextField from "@components/ChipTextField";
import Divider from "@mui/material/Divider";
import { setNotice } from "@store/commonSlice";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditVariantsDialog from "@pages/Draft/components/EditVariantsDialog";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Thumbnail from "@assets/thumbnail.svg";
import { getBroadCastFormat } from "@hooks/broadcastContent";

interface PROPS {
  product: PRODUCT;
  onChange: Function;
  checkedList: string[];
  products: PRODUCT[];
}

function ProductItem(props: PROPS) {
  let { activityId, postId } = useParams();
  const { product, onChange, checkedList } = props;
  const apis = useAppSelector(selectApis);
  const dispatch = useAppDispatch();

  useEffect(() => {}, []);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeletingProd, setIsDeletingProd] = useState(false);
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);
  const [isEditingVariants, setIsEditingVariants] = useState(false);
  const open = Boolean(anchorEl);

  const productMenu = [
    {
      icon: EditIcon,
      name: "編輯商品",
      onClick: () => {
        window.open(product.links.edit, "_blank");
      },
    },
    {
      icon: StorefrontIcon,
      name: "在商店中查看",
      onClick: () => {
        window.open(product.links.front, "_blank");
      },
    },
    { icon: DeleteIcon, name: "刪除商品", onClick: () => onDeleteProduct() },
  ];

  const onDeleteProduct = () => {
    setIsDeletingProd(true);
  };

  const renderNewDeatilList = (type: "color" | "size") => {
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
        <Grid
          container
          spacing={0}
          sx={{ display: "flex", lineHeight: 24, pl: 4 }}
        >
          <Grid
            item
            xs={2}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">
              {type === "color" ? "顏色" : "尺寸"}
            </Typography>
          </Grid>
          <Grid
            item
            xs={9}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <List component="div" disablePadding>
              {detailList?.map(
                (
                  item: {
                    name: string;
                    nicknames: string[];
                  },
                  index: number
                ) => (
                  <Box key={index}>
                    <ListItem key={index} disablePadding disableGutters>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ display: "flex" }}>
                              <Typography variant="body2">
                                {item.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex" }}>
                              {item.nicknames.length ? (
                                item.nicknames.map(
                                  (nickname: string, index: number) => (
                                    <Chip
                                      sx={{ ml: 1 }}
                                      key={index}
                                      label={nickname}
                                      size="small"
                                    />
                                  )
                                )
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#ED6C02", ml: 1 }}
                                >
                                  沒有關鍵字
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider light />
                  </Box>
                )
              )}
            </List>
          </Grid>
          <Grid
            item
            xs={1}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => setIsEditingVariants(true)}
            >
              <EditIcon sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const onSubmit = (data: any, type: string) => {
    let newNicknames: string[] = [];

    if (type === "add") {
      newNicknames = [...(product?.nicknames || []), data];
    } else {
      newNicknames = product?.nicknames
        ? product?.nicknames?.filter((nickname) => nickname !== data)
        : [];
    }

    dispatch(
      editKeywordsAsync({
        url: apis?.products_nicknames as string,
        activityId: activityId as string,
        postId: postId as string,
        productId: product.id,
        nicknames: newNicknames,
        onSuccess: (value: any) => {
          if (type === "add" && value && value?.length > 0) {
            const curItem: {
              id: string;
              nicknames: string[];
            } = value[0];
            if (!curItem.nicknames.find((nickname) => nickname === data)) {
              dispatch(
                setNotice({
                  isErroring: true,
                  message: "關鍵字重複",
                  type: "warning",
                })
              );
              return;
            }
            setIsEditingKeyword(false);
          }
        },
      })
    );
  };

  const getKeywordDetail = () => {
    if (isEditingKeyword) {
      return (
        <Box sx={{ mt: 1 }}>
          <ChipTextField
            type="PRODUCT"
            onAdd={(val: string) => {
              onSubmit(val, "add");
            }}
            onDelete={(val: string) => {
              onSubmit(val, "delete");
            }}
            values={(product.nicknames as string[]) || []}
            placeholder="設定關鍵字"
            label="商品關鍵字"
          />
        </Box>
      );
    } else {
      return product?.nicknames?.length ? (
        product.nicknames.map((item: any, index: any) => (
          <Chip key={index} label={item} size="small" />
        ))
      ) : (
        <Typography variant="body2" sx={{ color: "#ED6C02" }}>
          沒有關鍵字
        </Typography>
      );
    }
  };

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

  return (
    <>
      <ListItem
        sx={{
          padding: 0,
        }}
        disablePadding
        disableGutters
      >
        {/* <ListItemButton
          role={undefined}
          // onClick={() => setIsOpenDetail(!isOpenDetail)}
          dense
          disableGutters
        > */}
        <Checkbox
          edge="start"
          checked={checkedList.filter((id) => id === product.id).length > 0}
          tabIndex={-1}
          disableRipple
          onChange={(e) => {
            onChange(product.id);
          }}
          onClick={(e) => e.stopPropagation()}
        />
        {isOpenDetail ? (
          <ExpandLessIcon
            sx={{ cursor: "pointer" }}
            onClick={() => setIsOpenDetail(false)}
          />
        ) : (
          <ExpandMoreIcon
            sx={{ cursor: "pointer" }}
            onClick={() => setIsOpenDetail(true)}
          />
        )}
        <ListItemAvatar sx={{ mr: 1, ml: 1 }}>
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
              <Typography
                variant="body2"
                sx={{ display: "flex", color: "rgba(0, 0, 0, 0.6)" }}
              >
                {product.sn}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", lineHeight: 1.43 }}
              >
                {product.name}
              </Typography>
              <Typography variant="body2" sx={{ display: "flex" }}>
                {`${getBroadCastFormat(product, "color")} ${getBroadCastFormat(
                  product,
                  "size"
                )} ${getProductPrice()}`}
              </Typography>
            </Box>
          }
          secondary={
            <Stack
              direction="row"
              sx={{
                flexWrap: "inherit",
                display: "flex",
                alignItems: "center",
              }}
              spacing={1}
              useFlexGap
            >
              {getKeywordDetail()}
              <IconButton
                edge="end"
                aria-label="edit-custom-keyword"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingKeyword(!isEditingKeyword);
                }}
              >
                {isEditingKeyword ? (
                  <CheckIcon color="primary" sx={{ width: 16, height: 16 }} />
                ) : (
                  <EditIcon sx={{ width: 16, height: 16 }} />
                )}
              </IconButton>
            </Stack>
          }
        />
        {/* </ListItemButton> */}
        <Stack direction={"row"} sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="end"
            aria-label="more"
            onClick={(event: React.MouseEvent<HTMLElement>) =>
              setAnchorEl(event.currentTarget)
            }
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5,
                width: "20ch",
              },
            }}
          >
            {productMenu.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  item.onClick();
                  setAnchorEl(null);
                }}
              >
                <item.icon />
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </ListItem>
      <Collapse in={isOpenDetail} timeout="auto" unmountOnExit sx={{ mb: 1 }}>
        <Divider light />
        {renderNewDeatilList("color")}
        <Divider light />
        {renderNewDeatilList("size")}
        <Divider light />
      </Collapse>
      <Dialog
        fullWidth={true}
        open={false}
        onClose={() => setIsEditingKeyword(false)}
      >
        <DialogTitle>編輯關鍵字</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <DialogContentText></DialogContentText>
          <Box sx={{ display: "flex", mt: 1 }}>
            <ChipTextField
              type="FORMAT"
              onAdd={(val: string) => {
                onSubmit(val, "add");
              }}
              onDelete={(val: string) => {
                onSubmit(val, "delete");
              }}
              values={(product.nicknames as string[]) || []}
              placeholder="設定關鍵字"
              label="商品關鍵字"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsEditingKeyword(false);
            }}
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeletingProd}
        onClose={() => setIsDeletingProd(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">刪除商品</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ display: "flex" }}
          >
            <Typography>請確定您是否要刪除{product.name}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeletingProd(false)}>取消</Button>
          <LoadingButton
            variant="contained"
            loading={isRequesting}
            onClick={() => {
              setIsRequesting(true);
              dispatch(
                deleteProductAsync({
                  url: apis?.activity_post_products as string,
                  activityId: activityId as string,
                  postId: postId as string,
                  prodId: product.id,
                  onSuccess: (res: any) => {
                    setIsRequesting(false);
                    if (res) {
                      dispatch(
                        setNotice({
                          isErroring: true,
                          message: "刪除商品成功",
                          type: "success",
                        })
                      );
                      if (checkedList.find((item) => item === product.id)) {
                        onChange(product.id);
                      }
                    } else {
                      dispatch(
                        setNotice({
                          isErroring: true,
                          message: "至少保留一個直播商品",
                          type: "error",
                        })
                      );
                    }
                    setIsDeletingProd(false);
                  },
                })
              );
            }}
            autoFocus
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <EditVariantsDialog
        product={product}
        isVisible={isEditingVariants}
        onCancel={() => setIsEditingVariants(false)}
      />
    </>
  );
}
export default ProductItem;
