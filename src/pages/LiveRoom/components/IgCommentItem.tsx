import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { IG_MEDIA_COMMENT } from "../apis/facebook";
import { ListChildComponentProps } from "react-window";
import dayjs from "dayjs";
import {
  selectFansPage,
  selectOrderNew,
  selectLiveBoradcastMode,
} from "@store/liveroomSlice";
import { useAppSelector } from "@store/hooks";
import Chip from "@mui/material/Chip";

import { PopperPlacementType } from "@mui/material/Popper";
import MemberDetailPopper from "./MemberDetailPopper";
import Tooltip from "@mui/material/Tooltip";
import { selectApis } from "@store/apiSlice";
import {
  MEMBER_DATA,
  checkIsMemberComment,
  getMemberDetail,
  getMemberActions,
  MEMBER_INFO,
} from "@pages/LiveRoom/apis/legacy";

interface PROPS extends ListChildComponentProps {
  comment: IG_MEDIA_COMMENT;
  onDelete: Function;
}
function IgCommentItem(props: PROPS) {
  const { comment } = props;
  const refAvata = useRef(null);
  const isLiveBoradcastMode = useAppSelector(selectLiveBoradcastMode);
  const apis = useAppSelector(selectApis);
  const curFanPage = useAppSelector(selectFansPage);
  const curOrder = useAppSelector(selectOrderNew);
  const [detailAnchorEl, setDetailAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const [memberInfo, setMemberInfo] = useState<null | MEMBER_INFO>(null);
  const { index, style } = props;

  const getOrderProd = () => {
    let product = "";
    if (!curOrder || isLiveBoradcastMode) {
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
        // if (comment.text?.toLocaleUpperCase()?.includes(arrKeys[i])) {
        if (value["comments"] && value["comments"].includes(comment.id)) {
          isOrder = true;
          break;
        }
      }
      if (
        isOrder &&
        comment.from.id !== curFanPage?.instagram_business_account?.id
      ) {
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
    if (memberInfo) {
      setDetailAnchorEl(detailAnchorEl ? null : refAvata?.current);
      setPlacement("left");
    }
  }, [memberInfo]);

  const getMemberInfo = async () => {
    if (
      !curFanPage ||
      comment?.from?.id === curFanPage.instagram_business_account?.id
    ) {
      return;
    }

    let memberList: MEMBER_INFO[] = [];
    await checkIsMemberComment(
      apis?.is_member as string,
      comment?.from?.username || ""
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
    <ListItem
      alignItems="flex-start"
      style={style}
      key={index}
      component="div"
      disablePadding
    >
      <ListItemAvatar>
        <Avatar
          sx={{ cursor: "pointer" }}
          aria-describedby={`detail-popper-${comment.id}`}
          alt={comment.from?.username}
          src={comment.from?.username}
          onClick={handleAvataClick("left")}
          ref={refAvata}
        >
          {comment.from?.username.charAt(0)}
        </Avatar>
        <MemberDetailPopper
          placement={placement}
          id={comment.id}
          anchorEl={detailAnchorEl}
          detail={memberInfo}
          igComment={comment}
          platform="instagram"
        />
      </ListItemAvatar>
      <ListItemText
        sx={{
          background: "rgba(0, 0, 0, 0.03)",
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
            >
              {comment.from?.username}
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
                <Box sx={{ maxWidth: "90%", maxHeight: 60, overflowY: "auto" }}>
                  <Tooltip title={comment.text} arrow placement="top-start">
                    <Typography variant="body2" sx={{ fontSize: "12px" }}>
                      {comment.text}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Typography
                    sx={{ fontSize: "10px", mr: 1, cursor: "pointer" }}
                  >
                    {dayjs(comment.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography>
                </Box>
              </Box>
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

export default IgCommentItem;
