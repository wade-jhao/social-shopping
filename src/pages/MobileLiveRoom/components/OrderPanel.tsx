import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import LaunchIcon from "@mui/icons-material/Launch";
import OrderIcon from "@assets/orderIcon.svg";
import {
  selectProducts,
  selectComments,
  setOrderNew,
  selectOrderNew,
  selectFansPage,
  selectIgMediaComments,
  selectIgMedia,
  selectPostActions,
  selectPost,
} from "@store/liveroomSlice";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import {
  FANS_POST_COMMENT,
  IG_MEDIA_COMMENT,
} from "@pages/LiveRoom/apis/facebook";
import { PRODUCT } from "../apis/legacy";
import Empty from "@components/Empty";
import Thumbnail from "@assets/thumbnail.svg";

interface PROPS {
  height?: number;
}

interface ORDER_PANEL {
  rank?: number;
  prod: string;
  cover: string;
  orderNum: number;
  history: { param: string; orderNum: number }[];
}

function OrderPanel(props: PROPS) {
  const { height } = props;
  const dispatch = useAppDispatch();
  const curPost = useAppSelector(selectPost);
  const curProducts = useAppSelector(selectProducts);
  const curComments = useAppSelector(selectComments);
  const curOrderNew = useAppSelector(selectOrderNew);
  const curFanPage = useAppSelector(selectFansPage);
  const curIgMedia = useAppSelector(selectIgMedia);
  const curPostActions = useAppSelector(selectPostActions);
  const curIgComments = useAppSelector(selectIgMediaComments);
  const firstLevelTableCell = ["", "排行", "商品", "+1留言數"];
  const secondLevelTableCell = ["規格", "+1留言數"];
  const [orderPanel, setOrderPanel] = useState<ORDER_PANEL[]>([]);
  const arrSkelton = new Array(5).fill(0);
  const refAnalysisIds = useRef<any>(new Set([]));
  useEffect(() => {
    if (curProducts && curComments) {
      getCurFbOrder();
    }
    if (curProducts && curIgComments) {
      getCurIgOrder();
    }
  }, [curProducts, curComments, curIgComments]);

  useEffect(() => {
    return () => {
      if (refAnalysisIds.current) {
        refAnalysisIds.current.clear();
        refAnalysisIds.current = null;
      }
    };
  }, []);

  function hasIntersection(str1: string, str2: string) {
    const set1 = new Set(str1);
    const set2 = new Set(str2);

    for (let char of set1) {
      if (set2.has(char)) {
        return true;
      }
    }

    return false;
  }

  const updateOrderPanel = (orderPanel: any[]) => {
    if (orderPanel && orderPanel.length) {
      let curOrderNewMap: any = new Map(orderPanel);
      if (curOrderNewMap) {
        let arrOrderPanel: PRODUCT[] = Array.from(curOrderNewMap.values());
        if (arrOrderPanel.length) {
          arrOrderPanel = arrOrderPanel.filter((order) =>
            Object.prototype.hasOwnProperty.call(order, "shopCarts")
          );
        }
        const curOrderPanel: ORDER_PANEL[] = [];
        arrOrderPanel.forEach((order) => {
          let orderAmount = 0;
          const history: { param: string; orderNum: number }[] = [];
          for (const key in order.shopCarts) {
            if (Object.prototype.hasOwnProperty.call(order.shopCarts, key)) {
              orderAmount += order.shopCarts[key];
              history.push({ param: key, orderNum: order.shopCarts[key] });
            }
          }
          const orderPanelItem: ORDER_PANEL = {
            prod: `${order.name}(${order.sn})`,
            cover: order.media_url,
            orderNum: orderAmount,
            history: history,
          };
          curOrderPanel.push(orderPanelItem);
        });
        setOrderPanel(curOrderPanel.sort((a, b) => b.orderNum - a.orderNum));
        curOrderNewMap.clear();
        curOrderNewMap = null;
      }
    }
  };

  const getCurFbOrder = () => {
    if (!curProducts) {
      return;
    }

    let mapProducts: any;
    if (curOrderNew) {
      mapProducts = new Map(JSON.parse(curOrderNew));
    } else {
      mapProducts = new Map(
        curProducts.map((product) => {
          return [
            [...(product?.nicknames || []), product.sn].toString(),
            product,
          ];
        })
      );
    }

    const filteredComments: FANS_POST_COMMENT[] = curComments.filter(
      (comment: FANS_POST_COMMENT) => {
        const curComment = { ...comment };
        if (
          !refAnalysisIds.current?.has(curComment.id) &&
          curComment?.from?.id !== curFanPage?.id &&
          (curComment.message?.includes("+") ||
            curComment.message?.includes("＋") ||
            curComment.message?.includes("十"))
        ) {
          curComment.message = curComment.message.replace(/＋/g, "+");
          curComment.message = curComment.message.replace(/十/g, "+");
          curComment.message = curComment.message.replace(/\s/g, "");
          curComment.message = curComment.message.toLocaleUpperCase();
          return curComment;
        }
      }
    );
    let keysArray: string[] = [];
    for (let item of mapProducts.keys()) {
      if (item.includes(",")) {
        keysArray.push(...item.split(","));
      } else {
        keysArray.push(item);
      }
    }
    let regex = new RegExp(
      `((${keysArray
        .map((i) => i.toLocaleUpperCase())
        .join("|")})[^]*?)(?=${keysArray
        .map((i) => i.toLocaleUpperCase())
        .join("|")}|$)`,
      "g"
    );
    for (let i = 0; i < filteredComments.length; i++) {
      const comment = filteredComments[i];

      if (refAnalysisIds.current?.has(comment.id)) {
        continue;
      } else {
        refAnalysisIds.current?.add(comment.id);
      }

      for (const [key, value] of mapProducts) {
        const curProduct = { ...value };
        for (let i = 0; i < key?.split(",").length; i++) {
          const tempMsg = comment.message
            ?.toLocaleUpperCase()
            .replace(/\s+/g, "");
          const curtMessages = tempMsg?.match(regex);
          const curKeyword = key?.split(",")[i];
          if (curtMessages) {
            for (let j = 0; j < curtMessages.length; j++) {
              const curMessage = curtMessages[j];
              if (!curMessage?.includes(curKeyword.toLocaleUpperCase())) {
                continue;
              } else {
                const curKey = curKeyword as string;
                const startIndex =
                  curMessage.indexOf(curKey.toLocaleUpperCase()) +
                  curKey.length;
                const endIndex = curMessage.indexOf("+");
                const format: string = curMessage
                  .substring(startIndex, endIndex)
                  .toUpperCase()
                  .replace(/ /g, "")
                  .trim();

                let isValidColor = false;
                if (value.colors) {
                  if (value.colors.length === 1) {
                    isValidColor = true;
                  } else {
                    for (let i = 0; i < value.colors.length; i++) {
                      if (hasIntersection(format, value.colors[i].name)) {
                        isValidColor = true;
                        break;
                      }
                    }
                  }
                }

                let isValidSize = false;
                if (value.sizes) {
                  if (value.sizes.length === 1) {
                    isValidSize = true;
                  } else {
                    for (let i = 0; i < value.sizes.length; i++) {
                      if (hasIntersection(format, value.sizes[i].name)) {
                        isValidSize = true;
                        break;
                      }
                    }
                  }
                }
                let isValidFormat = false;

                if (
                  format === "" ||
                  isNaN(Number(format.charAt(0))) ||
                  (format.length > 1 &&
                    !isNaN(Number(format.substring(0, 2)))) ||
                  (format.length > 1 && !isNaN(Number(format.charAt(1))))
                ) {
                  isValidFormat = true;
                }

                const orderNumIndex = endIndex + 1;
                const match = curMessage
                  .substring(orderNumIndex)
                  .toUpperCase()
                  .match(/\d+(?=[^\d]*$)/);
                const orderNum = match ? parseInt(match[0], 10) : 0;
                if (
                  isNaN(orderNum) ||
                  !isValidColor ||
                  !isValidSize ||
                  !isValidFormat
                ) {
                  continue;
                }

                if (!curProduct.shopCarts) {
                  const newShopCarts: any = {};
                  newShopCarts[format] = orderNum;
                  curProduct.shopCarts = newShopCarts;
                } else {
                  if (
                    !Object.prototype.hasOwnProperty.call(
                      curProduct.shopCarts,
                      format
                    )
                  ) {
                    curProduct.shopCarts[format] = orderNum;
                  } else {
                    curProduct.shopCarts[format] += orderNum;
                  }
                }

                if (!curProduct.comments) {
                  curProduct.comments = [comment.id];
                } else {
                  curProduct.comments.push(comment.id);
                }
              }
            }
          }
        }
        mapProducts.set(key, curProduct);
      }
    }
    const arrOrderPanel: any[] = Array.from(mapProducts);
    dispatch(setOrderNew(JSON.stringify(arrOrderPanel)));
    updateOrderPanel(arrOrderPanel);
    mapProducts.clear();
    mapProducts = null;
  };

  const getCurIgOrder = () => {
    if (!curProducts || !curIgComments) {
      return;
    }
    const filteredProducts = [];
    for (let i = 0; i < curProducts.length; i++) {
      const product = curProducts[i];
      if (!product?.nicknames || !product?.nicknames.length) {
        continue;
      }
      filteredProducts.push(product);
    }

    let mapProducts: any;
    if (curOrderNew) {
      mapProducts = new Map(JSON.parse(curOrderNew));
    } else {
      mapProducts = new Map(
        curProducts.map((product) => {
          return [
            [...(product?.nicknames || []), product.sn].toString(),
            product,
          ];
        })
      );
    }

    const filteredComments: IG_MEDIA_COMMENT[] = curIgComments.filter(
      (comment: IG_MEDIA_COMMENT) => {
        const curIgComment = { ...comment };
        if (
          !refAnalysisIds.current?.has(curIgComment.id) &&
          curIgComment.from.id !== curFanPage?.instagram_business_account_id &&
          (curIgComment.text?.includes("+") ||
            curIgComment.text?.includes("＋") ||
            curIgComment.text?.includes("十"))
        ) {
          curIgComment.text = curIgComment.text.replace(/＋/g, "+");
          curIgComment.text = curIgComment.text.replace(/十/g, "+");
          curIgComment.text = curIgComment.text.replace(/\s/g, "");
          curIgComment.text = curIgComment.text.toLocaleUpperCase();
          return curIgComment;
        }
      }
    );
    let keysArray: string[] = [];
    for (let item of mapProducts.keys()) {
      if (item.includes(",")) {
        keysArray.push(...item.split(","));
      } else {
        keysArray.push(item);
      }
    }
    let regex = new RegExp(
      `((${keysArray
        .map((i) => i.toLocaleUpperCase())
        .join("|")})[^]*?)(?=${keysArray
        .map((i) => i.toLocaleUpperCase())
        .join("|")}|$)`,
      "g"
    );
    for (let i = 0; i < filteredComments.length; i++) {
      const comment = filteredComments[i];

      if (refAnalysisIds.current?.has(comment.id)) {
        continue;
      } else {
        refAnalysisIds.current?.add(comment.id);
      }

      for (const [key, value] of mapProducts) {
        const curProduct = { ...value };
        for (let i = 0; i < key?.split(",").length; i++) {
          const tempMsg = comment.text?.toLocaleUpperCase().replace(/\s+/g, "");
          const curtMessages = tempMsg?.match(regex);
          const curKeyword = key?.split(",")[i];
          if (curtMessages) {
            for (let j = 0; j < curtMessages.length; j++) {
              const curMessage = curtMessages[j];
              if (!curMessage?.includes(curKeyword.toLocaleUpperCase())) {
                continue;
              } else {
                const curKey = curKeyword as string;
                const startIndex =
                  curMessage.indexOf(curKey.toLocaleUpperCase()) +
                  curKey.length;
                const endIndex = curMessage.indexOf("+");
                const format: string = curMessage
                  .substring(startIndex, endIndex)
                  .toUpperCase()
                  .replace(/ /g, "")
                  .trim();

                let isValidColor = false;
                if (value.colors) {
                  if (value.colors.length === 1) {
                    isValidColor = true;
                  } else {
                    for (let i = 0; i < value.colors.length; i++) {
                      if (hasIntersection(format, value.colors[i].name)) {
                        isValidColor = true;
                        break;
                      }
                    }
                  }
                }

                let isValidSize = false;
                if (value.sizes) {
                  if (value.sizes.length === 1) {
                    isValidSize = true;
                  } else {
                    for (let i = 0; i < value.sizes.length; i++) {
                      if (hasIntersection(format, value.sizes[i].name)) {
                        isValidSize = true;
                        break;
                      }
                    }
                  }
                }
                let isValidFormat = false;

                if (
                  format === "" ||
                  isNaN(Number(format.charAt(0))) ||
                  (format.length > 1 &&
                    !isNaN(Number(format.substring(0, 2)))) ||
                  (format.length > 1 && !isNaN(Number(format.charAt(1))))
                ) {
                  isValidFormat = true;
                }

                const orderNumIndex = endIndex + 1;
                const orderNum = Number(
                  curMessage.substring(orderNumIndex).toUpperCase()
                );
                if (
                  isNaN(orderNum) ||
                  !isValidColor ||
                  !isValidSize ||
                  !isValidFormat
                ) {
                  continue;
                }

                if (!curProduct.shopCarts) {
                  const newShopCarts: any = {};
                  newShopCarts[format] = orderNum;
                  curProduct.shopCarts = newShopCarts;
                } else {
                  if (
                    !Object.prototype.hasOwnProperty.call(
                      curProduct.shopCarts,
                      format
                    )
                  ) {
                    curProduct.shopCarts[format] = orderNum;
                  } else {
                    curProduct.shopCarts[format] += orderNum;
                  }
                }
                if (!curProduct.comments) {
                  curProduct.comments = [comment.id];
                } else {
                  curProduct.comments.push(comment.id);
                }
              }
            }
          }
        }
        mapProducts.set(key, curProduct);
      }
    }
    const arrOrderPanel: any[] = Array.from(mapProducts);
    dispatch(setOrderNew(JSON.stringify(arrOrderPanel)));
    updateOrderPanel(arrOrderPanel);
    mapProducts.clear();
    mapProducts = null;
  };

  function createData(
    rank: number,
    prod: string,
    cover: string,
    orderNum: number,
    history: { param: string; orderNum: number }[]
  ) {
    return {
      rank,
      prod,
      cover,
      orderNum,
      history,
    };
  }

  function Row(props: { row: ReturnType<typeof createData> }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    return (
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell variant="body" size="small" padding="normal">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell
            component="th"
            scope="row"
            variant="body"
            size="small"
            padding="normal"
          >
            {row.rank}
          </TableCell>
          <TableCell variant="body" size="small" padding="normal">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                style={{
                  width: "80px",
                  aspectRatio: 1,
                  objectFit: "contain",
                }}
                src={row.cover || Thumbnail}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {row.prod}
              </Typography>
            </Box>
          </TableCell>
          <TableCell variant="body" size="small" padding="normal">
            {row.orderNum}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={6}
            variant="body"
            size="small"
            padding="normal"
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      {secondLevelTableCell.map((item, index) => (
                        <TableCell
                          key={index}
                          variant="body"
                          size="small"
                          padding="normal"
                        >
                          {item}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.history.map((historyRow, index) => (
                      <TableRow key={index}>
                        <TableCell
                          component="th"
                          scope="row"
                          variant="body"
                          size="small"
                          padding="normal"
                        >
                          {historyRow.param}
                        </TableCell>
                        <TableCell variant="body" size="small" padding="normal">
                          {historyRow.orderNum}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  const createRows = () => {
    return orderPanel.map((order, index) => {
      return createData(
        index + 1,
        order.prod,
        order.cover,
        order.orderNum,
        order.history
      );
    });
  };

  const getActionLink = () => {
    if (!curPostActions) {
      return "";
    }
    const curAction = curPostActions?.find((action) => action.type === "統計");
    if (curAction) {
      return curAction.url;
    } else {
      return "";
    }
  };

  return (
    <>
      {curOrderNew &&
        JSON.parse(curOrderNew).length > 0 &&
        curIgMedia !== "not_live" && (
          <Box>
            {orderPanel.length ? (
              <TableContainer component={Paper}>
                <Table
                  stickyHeader
                  aria-label="sticky collapsible table"
                  size="small"
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          color: "rgb(47, 55, 70)",
                          backgroundColor: "rgb(248, 249, 250)",
                        },
                      }}
                    >
                      {firstLevelTableCell.map((item, index) => (
                        <TableCell
                          variant="head"
                          size="small"
                          padding="none"
                          key={index}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: "40px",
                            }}
                          >
                            {item}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {createRows().map((row, index) => (
                      <Row key={index} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  height: height,
                  width: "100%",
                  background: "#fff",
                  textAlign: "center",
                }}
              >
                <img style={{ marginTop: 26 }} src={OrderIcon}></img>
                <Typography variant="h6" sx={{ color: "#000" }}>
                  目前沒有消費者喊單
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
                >
                  系統將即時為您更新排行榜資訊，敬請留意！
                </Typography>
              </Box>
            )}
          </Box>
        )}
      {curOrderNew &&
        JSON.parse(curOrderNew).length === 0 &&
        curIgMedia !== "not_live" && <Empty message="請先設定商品關鍵字" />}

      {curIgMedia === "not_live" && (
        <Box
          sx={{
            height: height,
            width: "100%",
            background: "#fff",
            textAlign: "center",
            padding: 1,
          }}
        >
          <img src={OrderIcon}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            直播已結束
          </Typography>
          <Typography
            sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
            variant="body2"
          >
            Instagram貼文已自動被刪除，故無法查看當時的喊單排行。但您仍可透過矽羽後台查看留言商品統計。
          </Typography>
          <Link
            sx={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 1,
            }}
            href={getActionLink()}
            target="_"
          >
            <Button size="small" variant="contained" endIcon={<LaunchIcon />}>
              前往查看
            </Button>
          </Link>
        </Box>
      )}

      {curPost?.error && (
        <Box
          sx={{
            height: height,
            width: "100%",
            background: "#fff",
            textAlign: "center",
            padding: 1,
          }}
        >
          <img style={{ marginTop: 26 }} src={OrderIcon}></img>
          <Typography variant="h6" sx={{ color: "#000" }}>
            無法載入排行榜
          </Typography>
          <Typography
            sx={{ color: "rgba(0, 0, 0, 0.60)", mt: 1 }}
            variant="body2"
          >
            該貼文可能已被刪除或沒有權限查看，故無法查看當時的喊單排行。但您仍可透過矽羽後台查看留言商品統計。
          </Typography>
          <Link
            sx={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 1,
            }}
            href={getActionLink()}
            target="_"
          >
            <Button size="small" variant="contained" endIcon={<LaunchIcon />}>
              前往查看
            </Button>
          </Link>
        </Box>
      )}

      {curIgMedia !== "not_live" &&
        !curOrderNew &&
        !curPost?.error &&
        arrSkelton.map((item, index) => (
          <Skeleton
            key={index}
            animation="wave"
            variant="rectangular"
            height={30}
            sx={{ mt: 1, mb: 1 }}
          />
        ))}
    </>
  );
}

export default OrderPanel;
