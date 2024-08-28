import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { FANS_POST_COMMENT } from "../apis/facebook";
import { ListChildComponentProps } from "react-window";
import MemberDetailPopper from "@pages/LiveRoom/components/MemberDetailPopper";
import { PopperPlacementType } from "@mui/material/Popper";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";
import { MEMBER_INFO } from "@pages/LiveRoom/apis/legacy";
import { selectOrderNew, selectMemberList } from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import { ReactComponent as MemberIcon } from "@assets/member-Icon.svg";

interface PROPS extends ListChildComponentProps {
  comment: FANS_POST_COMMENT;
  replying: boolean;
  onDelete: Function;
  onOpenReplyList: Function;
  onEdit: Function;
}

function FBCommentItem(props: PROPS) {
  const { comment, index, style, replying, onOpenReplyList } = props;
  const curMemberList = useAppSelector(selectMemberList);
  const [detailAnchorEl, setDetailAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const [memberInfo, setMemberInfo] = useState<null | MEMBER_INFO>(null);
  const curOrder = useAppSelector(selectOrderNew);

  useEffect(() => {
    if (curMemberList.length) {
      const member = curMemberList.find(
        (member) => member.user_id === comment?.from?.id
      );
      if (member) {
        setMemberInfo(member);
      }
    }
  }, [curMemberList]);

  const getOrderProd = () => {
    let product = "";
    if (!curOrder) {
      return product;
    }
    let curOrderNewMap: any = new Map(JSON.parse(curOrder));
    for (const [key, value] of curOrderNewMap) {
      const arrKeys = key.split(",");
      let isOrder = false;
      for (let i = 0; i < arrKeys.length; i++) {
        // if (comment.message?.toLocaleUpperCase()?.includes(arrKeys[i])) {
        if (value["comments"] && value["comments"].includes(comment.id)) {
          isOrder = true;
          break;
        }
      }
      if (isOrder) {
        if (product !== "") {
          product += `,${value["name"]}`;
        } else {
          product = value["name"];
        }
      }
    }
    if (product !== "") {
      curOrderNewMap.clear();
      curOrderNewMap = null;
      return product;
    }
    curOrderNewMap.clear();
    curOrderNewMap = null;
    return product;
    // for (const [key] of curOrderNewMap) {
    //   const arrKeys = key.split(",");
    //   let isOrder = false;

    //   for (let i = 0; i < arrKeys.length; i++) {
    //     if (
    //       comment.message
    //         ?.toLocaleUpperCase()
    //         ?.includes(
    //           arrKeys[i] &&
    //             (comment?.message?.includes("+") ||
    //               comment?.message?.includes("＋") ||
    //               comment?.message?.includes("十"))
    //         )
    //     ) {
    //       isOrder = true;
    //       break;
    //     }
    //   }
    //   if (isOrder) {
    //     product = "辨識失敗";
    //     break;
    //   }
    // }
    // curOrderNewMap.clear();
    // curOrderNewMap = null;
    // return product;
  };

  const getMemberInfo = () => {
    if (!memberInfo) {
      return "";
    } else {
      return memberInfo.is_member ? "member" : "notMember";
    }
  };

  const handleAvataClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLElement>) => {
      setDetailAnchorEl(detailAnchorEl ? null : event.currentTarget);
      setPlacement(newPlacement);
    };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        style={style}
        key={index}
        component="div"
        disablePadding
      >
        <ListItemAvatar>
          <Avatar
            aria-describedby={`detail-popper-${comment.id}`}
            alt={comment.from?.name}
            src={comment.from?.picture.data.url}
            onClick={handleAvataClick("left")}
            sx={{ cursor: "pointer" }}
          >
            {comment.from?.name.charAt(0)}
          </Avatar>
          {memberInfo && (
            <MemberDetailPopper
              placement={placement}
              id={comment.id}
              anchorEl={detailAnchorEl}
              detail={memberInfo}
              fbComment={comment}
              platform="facebook.group"
            />
          )}
        </ListItemAvatar>
        <ListItemText
          sx={{
            background: replying ? "#E0E0E0" : "#F5F5F5",
            padding: "10px 15px",
            borderRadius: "20px",
          }}
          primary={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  display: "flex",
                  fontWeight: "bold",
                  mr: 1,
                  alignItems: "center",
                  cursor: "pointer",
                }}
                component="span"
                variant="body2"
                color="text.primary"
                onClick={handleAvataClick("left")}
              >
                {comment?.from?.name}
                {getMemberInfo() === "member" ? (
                  <Tooltip title={"官網會員"} arrow placement="top">
                    <MemberIcon style={{ marginLeft: 4 }} />
                  </Tooltip>
                ) : (
                  ""
                )}
              </Typography>
              {getOrderProd() && (
                <Chip
                  color={getOrderProd() !== "辨識失敗" ? "success" : "error"}
                  label={getOrderProd()}
                  size="small"
                  sx={{ opacity: 0.8 }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography
                sx={{ display: "inline", fontWeight: "bold" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{ maxWidth: "90%", maxHeight: 60, overflowY: "auto" }}
                  >
                    <Tooltip
                      title={comment.message}
                      arrow
                      placement="top-start"
                    >
                      <Typography
                        // sx={{
                        //   overflow: "hidden",
                        //   whiteSpace: "nowrap",
                        //   textOverflow: "ellipsis",
                        // }}
                        variant="body2"
                        sx={{ fontSize: "12px" }}
                      >
                        {comment.message}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <Typography
                      sx={{ fontSize: "10px", mr: 1, cursor: "pointer" }}
                    >
                      {dayjs(comment.created_time).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </Typography>
                    {(comment.comments?.data?.length || 0 > 0) && (
                      <Link
                        variant="body2"
                        sx={{ fontSize: 10, cursor: "pointer" }}
                        onClick={(e) => {
                          onOpenReplyList(index);
                        }}
                      >
                        {`查看留言串(${comment.comments?.data?.length || 0})`}
                      </Link>
                    )}
                  </Box>
                </Box>
              </Typography>
            </Box>
          }
        />
      </ListItem>
    </>
  );
}

export default FBCommentItem;
