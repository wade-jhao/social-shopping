import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { FANS_POST_COMMENT } from "../apis/facebook";
import { ListChildComponentProps } from "react-window";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import MemberDetailPopper from "@pages/LiveRoom/components/MemberDetailPopper";
import { PopperPlacementType } from "@mui/material/Popper";
import dayjs from "dayjs";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { selectApis } from "@store/apiSlice";
import {
  MEMBER_DATA,
  checkIsMemberComment,
  getMemberDetail,
  getMemberActions,
  MEMBER_INFO,
} from "@pages/LiveRoom/apis/legacy";
import { selectFansPage, selectOrderNew } from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";

interface PROPS extends ListChildComponentProps {
  comment: FANS_POST_COMMENT;
  replying: boolean;
  onReply: Function;
  onOpenReplyList: Function;
  onDelete: Function;
  onEdit: Function;
}

function FBCommentItem(props: PROPS) {
  const {
    comment,
    onReply,
    replying,
    onOpenReplyList,
    onDelete,
    onEdit,
    index,
    style,
  } = props;
  const refCommentMenu = useRef([
    { icon: DeleteIcon, name: "刪除", onClick: () => onDelete(comment) },
  ]);
  const refAvata = useRef(null);
  const apis = useAppSelector(selectApis);
  const curFanPage = useAppSelector(selectFansPage);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [detailAnchorEl, setDetailAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const [anchorReply, setAnchorReply] = useState<null | HTMLElement>(null);
  const [memberInfo, setMemberInfo] = useState<null | MEMBER_INFO>(null);
  const curOrder = useAppSelector(selectOrderNew);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (curFanPage && comment?.from?.id === curFanPage?.id) {
      refCommentMenu.current = refCommentMenu.current.concat([
        { icon: EditIcon, name: "編輯", onClick: () => onEdit(index) },
      ]);
    }
  }, [curFanPage]);

  const getOrderProd = () => {
    let product = "";
    if (!curOrder) {
      return product;
    }
    let arrOrderPanel: any[] = curOrder
      ? JSON.parse(curOrder).filter((order: any) => {
          if (order.length === 2) {
            return Object.prototype.hasOwnProperty.call(order[1], "shopCarts");
          }
        })
      : [];

    let curOrderNewMap: any = new Map(arrOrderPanel);

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
      if (isOrder && comment?.from?.id !== curFanPage?.id) {
        if (product !== "") {
          product += `,${value["name"]}`;
        } else {
          product = value["name"];
        }
      }
    }
    curOrderNewMap.clear();
    curOrderNewMap = null;
    return product;
  };

  useEffect(() => {
    if (anchorReply) {
      anchorReply.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [anchorReply]);

  const replyHandler = (e: any, index: number) => {
    onReply(index);
    setAnchorReply(e.currentTarget);
  };

  const getMemberInfo = async () => {
    let memberList: MEMBER_INFO[] = [];
    await checkIsMemberComment(
      apis?.is_member as string,
      comment?.from?.id || ""
    ).then((res) => (memberList = res));
    let memberIds: string = "";
    memberList.forEach((member) => {
      if (member.is_member) {
        memberIds = member.user_id;
      }
    });
    if (memberIds !== "") {
      const res = await Promise.all([
        getMemberDetail(apis?.member as string, memberIds),
        getMemberActions(apis?.member_actions as string, memberIds),
      ]);
      if (res && res.length === 2) {
        // fetch Member Detail and Member Actions
        const memberDetail: MEMBER_INFO = memberList[0];
        const memeberData: MEMBER_DATA = res[0][0];
        memeberData.member_actions = res[1][0].actions;
        memberDetail.data = memeberData;
        setMemberInfo(memberDetail);
      }
    } else {
      setMemberInfo(memberList[0]);
    }
  };

  useEffect(() => {
    if (memberInfo) {
      setDetailAnchorEl(detailAnchorEl ? null : refAvata?.current);
      setPlacement("left");
    }
  }, [memberInfo]);

  const handleAvataClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLElement>) => {
      if (!memberInfo) {
        getMemberInfo();
      } else {
        setDetailAnchorEl(detailAnchorEl ? null : event.currentTarget);
        setPlacement(newPlacement);
      }
    };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        style={style}
        key={index}
        component="div"
        disablePadding
        secondaryAction={
          <Box>
            <IconButton
              aria-label="more"
              id={`more-button-${Math.random()}`}
              aria-controls={open ? "more-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="true"
              onClick={(event: React.MouseEvent<HTMLElement>) =>
                setAnchorEl(event.currentTarget)
              }
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="more-menu"
              MenuListProps={{
                "aria-labelledby": "more-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                style: {
                  maxHeight: 48 * 4.5,
                  width: "10ch",
                },
              }}
            >
              {refCommentMenu.current.map((item, index) => (
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
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar
            aria-describedby={`detail-popper-${comment.id}`}
            alt={comment.from?.name}
            src={comment.from?.picture.data.url}
            onClick={handleAvataClick("left")}
            sx={{ cursor: "pointer" }}
            ref={refAvata}
          >
            {comment.from?.name.charAt(0)}
          </Avatar>
          <MemberDetailPopper
            placement={placement}
            id={comment.id}
            anchorEl={detailAnchorEl}
            detail={memberInfo}
            fbComment={comment}
            platform="facebook.page"
          />
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
                }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {comment.from?.name}
              </Typography>
              <Chip
                color={getOrderProd() !== "辨識失敗" ? "success" : "error"}
                label={getOrderProd()}
                size="small"
                sx={{
                  opacity: 0.8,
                  overflow: "hidden",
                  visibility: getOrderProd() ? "visible" : "hidden",
                }}
              />
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
                      <Typography variant="body2" sx={{ fontSize: "12px" }}>
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
                    <Link
                      variant="body2"
                      sx={{ fontSize: 10, cursor: "pointer", mr: 1 }}
                      onClick={(e) => {
                        replyHandler(e, index);
                      }}
                    >
                      {`回覆`}
                    </Link>
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
