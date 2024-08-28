import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useParams } from "react-router-dom";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Textarea from "@mui/joy/Textarea";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import IconMegaphone from "./Broadcast";
import Chip from "@mui/material/Chip";
import TableViewIcon from "@mui/icons-material/TableView";
import DialogContentText from "@mui/material/DialogContentText";
import EditVariantsDialog from "@pages/Draft/components/EditVariantsDialog";
import SizeTableDialog from "./SizeTableDialog";
import Tooltip from "@mui/material/Tooltip";
import { selectApis } from "@store/apiSlice";
import {
  selectOrderNew,
  selectFansPage,
  selectActivity,
  setCommentAsync,
  deleteProductAsync,
  editKeywordsAsync,
  updateProductAsync,
} from "@store/liveroomSlice";
import { setNotice } from "@store/commonSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { PRODUCT } from "../apis/legacy";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import ChipTextField from "@components/ChipTextField";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Thumbnail from "@assets/thumbnail.svg";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LaunchIcon from "@mui/icons-material/Launch";
import Link from "@mui/material/Link";
import { getSizeContent } from "@utils/sizeTable";
import useBroadcastContent, {
  getBroadCastFormat,
  getPullOffVariantsContent,
} from "@hooks/broadcastContent";
import { FormControlLabel, FormGroup } from "@mui/material";

interface PROPS {
  product: PRODUCT;
  checkedList: string[];
  onChange: Function;
  products: PRODUCT[];
}

function ProductItem(props: PROPS) {
  let { activityId, postId } = useParams();
  const { product, checkedList, onChange } = props;
  const curOrder = useAppSelector(selectOrderNew);
  const curFanPage = useAppSelector(selectFansPage);
  const curActivity = useAppSelector(selectActivity);
  const apis = useAppSelector(selectApis);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isDeletingProd, setIsDeletingProd] = useState(false);
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVisibleSizeTable, setIsVisibleSizeTable] = useState(false);
  const [productInfo, setProductInfo] = useState("");
  const [isEditingVariants, setIsEditingVariants] = useState(false);
  const [isValidProduct, setIsValidProduct] = useState(true);
  const open = Boolean(anchorEl);
  const { getSingleProductContent, getDiscountContent } = useBroadcastContent();
  const [boardCastContentStatus, setBoardCastContentStatus] = useState<{
    isAddSizeList: boolean;
    isAddLiveDiscountPrice: boolean;
    isAddPullOffVariants: boolean;
  }>({
    isAddSizeList: false,
    isAddLiveDiscountPrice: false,
    isAddPullOffVariants: false,
  });
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
    {
      icon: TableViewIcon,
      name: "尺寸表",
      onClick: () => {
        setIsVisibleSizeTable(true);
      },
    },
    { icon: DeleteIcon, name: "刪除商品", onClick: () => onDeleteProduct() },
  ];

  useEffect(() => {
    if (product) {
      let isValidProduct = true;
      if (product.status === "下架") {
        isValidProduct = false;
      }
      if (product?.variants) {
        for (let i = 0; i < product?.variants?.length; i++) {
          if (product?.variants[i].price === "0") {
            isValidProduct = false;
            break;
          }
        }
      }
      setIsValidProduct(isValidProduct);
    }
  }, [product]);

  const onDeleteProduct = () => {
    setIsDeletingProd(true);
  };

  const onSendRequest = () => {
    if (!productInfo) {
      return;
    }

    if (curActivity?.dispatch?.platform !== "facebook.page") {
      navigator.clipboard.writeText(productInfo).then(() => {
        dispatch(
          setNotice({
            isErroring: true,
            message: "複製商品規格成功",
            type: "success",
          })
        );
        setIsBroadcasting(false);
        setProductInfo("");
      });
    } else {
      if (curFanPage && curActivity) {
        setIsRequesting(true);
        dispatch(
          setCommentAsync({
            accessToken: curFanPage.access_token,
            postId: curActivity?.dispatch?.fb_post_id as string,
            comment: productInfo,
            onSuccess: () => {
              setIsRequesting(false);
              setIsBroadcasting(false);
              setProductInfo("");
              dispatch(
                setNotice({
                  isErroring: true,
                  message: "曝光商品成功",
                  type: "success",
                })
              );
            },
          })
        );
      }
    }
  };

  const getOrderNumber = () => {
    let orderNum = 0;
    if (!curOrder) {
      return orderNum;
    }
    let curOrderNewMap: any = new Map(JSON.parse(curOrder));
    let arrOrderPanel: PRODUCT[] = Array.from(curOrderNewMap.values());
    for (let i = 0; i < arrOrderPanel.length; i++) {
      if (product.id === arrOrderPanel[i].id) {
        if (arrOrderPanel[i].shopCarts) {
          for (const key in arrOrderPanel[i].shopCarts) {
            if (
              Object.prototype.hasOwnProperty.call(
                arrOrderPanel[i].shopCarts,
                key
              )
            ) {
              orderNum += arrOrderPanel[i].shopCarts[key];
            }
          }
        }
        break;
      }
    }
    curOrderNewMap.clear();
    curOrderNewMap = null;
    return orderNum;
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
                    <ListItem disablePadding disableGutters>
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

  const onBroadCast = () => {
    let info = getSingleProductContent(product, boardCastContentStatus);
    setProductInfo(info);
    setIsBroadcasting(true);
    // if (curActivity?.dispatch?.platform !== "facebook.page") {
    //   navigator.clipboard.writeText(info).then(() => {
    //     dispatch(
    //       setNotice({
    //         isErroring: true,
    //         message: "複製商品規格成功",
    //         type: "success",
    //       })
    //     );
    //   });
    // } else {
    //   setProductInfo(info);
    //   setIsBroadcasting(true);
    // }
  };

  const onBroadCastStatusChange = (options: {
    isAddSizeList: boolean;
    isAddLiveDiscountPrice: boolean;
    isAddPullOffVariants: boolean;
  }) => {
    const { isAddSizeList, isAddLiveDiscountPrice, isAddPullOffVariants } =
      options;
    const sizeListContent =
      product?.size_table === ""
        ? ""
        : getSizeContent(product?.size_table || "");
    const discountContent = getDiscountContent(product);
    const pullOffVariantsContent = getPullOffVariantsContent(product);
    if (sizeListContent === "" && isAddSizeList) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "商品沒有設定尺寸表",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({ ...prev, isAddSizeList: false }));
      return;
    }
    if (discountContent === "" && isAddLiveDiscountPrice) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "活動沒有設定直播折扣",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({
        ...prev,
        isAddLiveDiscountPrice: false,
      }));
      return;
    }
    if (pullOffVariantsContent === "" && isAddPullOffVariants) {
      dispatch(
        setNotice({
          isErroring: true,
          message: "該商品沒有下架的規格",
          type: "warning",
        })
      );
      setBoardCastContentStatus((prev) => ({
        ...prev,
        isAddPullOffVariants: false,
      }));
      return;
    }
    let info = getSingleProductContent(product, options);
    setProductInfo(info);
    setIsBroadcasting(true);
    setBoardCastContentStatus(options);
    dispatch(
      setNotice({
        isErroring: true,
        message: "成功更新曝光商品內文",
        type: "success",
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

  const updateProduct = () => {
    dispatch(
      updateProductAsync({
        url: apis?.product as string,
        productId: product.id,
        onSuccess: (value: any) => {},
      })
    );
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
        <Checkbox
          edge="start"
          checked={checkedList.filter((id) => id === product.id).length > 0}
          tabIndex={-1}
          disableRipple
          onChange={(e) => {
            onChange(product.id);
          }}
          onClick={(e) => e.stopPropagation()}
          // inputProps={{ "aria-labelledby": labelId }}
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
              <Typography
                variant="body2"
                sx={{ display: "flex", wordBreak: "break-all" }}
              >
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
                aria-label="edit-custom-variant-name"
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
        <Stack
          direction={"row"}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title="+1留言數" placement="top" arrow>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ShoppingCartIcon sx={{ opacity: 0.6, width: 20 }} />
              <Typography variant="body2" sx={{ display: "flex" }}>
                {getOrderNumber()}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="曝光商品" placement="top" arrow>
            <IconButton
              edge="end"
              aria-label="broadCast"
              onClick={() => onBroadCast()}
            >
              <IconMegaphone side_length="21" />
            </IconButton>
          </Tooltip>
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
                width: "17ch",
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
      <Collapse in={isOpenDetail} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Divider light />
          {renderNewDeatilList("color")}
          <Divider light />
          {renderNewDeatilList("size")}
          <Divider light />
        </List>
      </Collapse>
      <Dialog
        fullWidth={true}
        open={isBroadcasting}
        onClose={() => setIsBroadcasting(false)}
        maxWidth={!isValidProduct ? "md" : "sm"}
      >
        <DialogTitle>曝光商品</DialogTitle>
        <DialogContent dividers={true} sx={{ pt: 1 }}>
          <>
            {!isValidProduct && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  minHeight: 48,
                  background: "#FDEDED",
                  mb: 1,
                  padding: 1,
                  gap: 1,
                }}
              >
                <WarningAmberIcon color="error" sx={{ ml: 1, mr: 1 }} />
                <Typography color="#5F2120" variant="body2">
                  商品未上架或價格為0，消費者對此商品喊單將不會被加入購物車。
                </Typography>
                <Link
                  href={product.links.edit}
                  target="_blank"
                  sx={{ flex: "0 0 auto" }}
                >
                  <Button
                    color="error"
                    variant="outlined"
                    endIcon={<LaunchIcon />}
                    size="small"
                  >
                    編輯商品
                  </Button>
                </Link>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    updateProduct();
                  }}
                >
                  更新商品
                </Button>
              </Box>
            )}
            <Box sx={{ my: 2 }}>
              <FormGroup sx={{ display: "block" }}>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="加入尺寸表"
                  checked={boardCastContentStatus.isAddSizeList}
                  onChange={(e, checked) => {
                    onBroadCastStatusChange({
                      ...boardCastContentStatus,
                      isAddSizeList: checked,
                    });
                  }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="加入直播價"
                  checked={boardCastContentStatus.isAddLiveDiscountPrice}
                  onChange={(e, checked) => {
                    onBroadCastStatusChange({
                      ...boardCastContentStatus,
                      isAddLiveDiscountPrice: checked,
                    });
                  }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="加入下架規格提示"
                  checked={boardCastContentStatus.isAddPullOffVariants}
                  onChange={(e, checked) => {
                    onBroadCastStatusChange({
                      ...boardCastContentStatus,
                      isAddPullOffVariants: checked,
                    });
                  }}
                />
              </FormGroup>
            </Box>
            <Box
              noValidate
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                width: "100%",
              }}
            >
              <Textarea
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                  padding: 1,
                }}
                autoFocus
                size="lg"
                placeholder="請輸入商品規格"
                variant="outlined"
                minRows={3}
                maxRows={10}
                color="neutral"
                value={productInfo}
                onChange={(e) => {
                  setProductInfo(e.target.value);
                }}
              />
            </Box>
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBroadcasting(false)}>取消</Button>
          <LoadingButton
            variant="contained"
            disabled={!isValidProduct}
            loading={isRequesting}
            onClick={onSendRequest}
          >
            {curActivity?.dispatch?.platform !== "facebook.page"
              ? "複製"
              : "送出"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
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
      <SizeTableDialog
        isVisible={isVisibleSizeTable}
        product={product}
        onCancel={() => setIsVisibleSizeTable(false)}
      />
    </>
  );
}
export default ProductItem;
