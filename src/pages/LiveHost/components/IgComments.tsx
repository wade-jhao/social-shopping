import { useRef, useEffect, memo } from "react";
import Box from "@mui/material/Box";
import { IG_MEDIA_COMMENT } from "../apis/facebook";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
} from "react-window";
import Empty from "@components/Empty";
import IgCommentItem from "./IgCommentItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import CommentIcon from "@assets/commentIcon.svg";
import {
  selectActivity,
  selectIgMediaComments,
  selectFansPage,
  selectIgMedia,
  getNewIgCommentsAsync,
} from "@store/liveroomSlice";
import { useFetchAllIgComments } from "@pages/LiveRoom/utils";
import { useAppDispatch, useAppSelector } from "@store/hooks";

interface PROPS {
  height: number;
}
function IgComments(props: PROPS) {
  const { height } = props;
  const refInterval = useRef<number | null>(null);
  const refList = useRef<any>(null);
  const curFanPage = useAppSelector(selectFansPage);
  const curActivity = useAppSelector(selectActivity);
  const curIgCommments = useAppSelector(selectIgMediaComments);
  const curIgMedia = useAppSelector(selectIgMedia);
  const { getAllIgComments, isLoadingComplete } = useFetchAllIgComments();
  const dispatch = useAppDispatch();
  const refReply = useRef<any>(null);

  const arrSkelton = new Array(8).fill(0);
  const renderRow = memo((props: ListChildComponentProps) => {
    if (!curIgCommments.length) {
      return null;
    }
    const { index } = props;
    const comment = curIgCommments[index];

    return (
      <IgCommentItem
        comment={comment}
        {...props}
        onDelete={(comment: IG_MEDIA_COMMENT) => {}}
      />
    );
  }, areEqual);

  useEffect(() => {
    if (curFanPage && curActivity) {
      if (!isLoadingComplete) {
        getAllIgComments(
          curFanPage.access_token,
          curActivity.dispatch?.fb_post_id as string
        );
        return () => {
          if (refInterval.current) {
            window.clearInterval(refInterval.current);
          }
        };
      }
      refInterval.current = window.setInterval(() => {
        dispatch(
          getNewIgCommentsAsync({
            accessToken: curFanPage.access_token,
            livePostId: curActivity.dispatch?.fb_post_id as string,
          })
        );
      }, 4000);
      return () => {
        if (refInterval.current) {
          window.clearInterval(refInterval.current);
        }
      };
    }
    return () => {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    };
  }, [curFanPage, curActivity, isLoadingComplete]);

  useEffect(() => {
    if (refList.current) {
      refList.current.scrollToItem(curIgCommments.length - 1, "end");
    }
  }, [curIgCommments]);

  useEffect(() => {
    if (curIgMedia === "not_live") {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    }
  }, [curIgMedia]);

  const renderContent = () => {
    if (curIgCommments?.length > 0) {
      return (
        <VariableSizeList
          className="comment-FixedSizeList"
          height={height - (refReply?.current?.clientHeight || 0) - 30}
          width={"100%"}
          itemSize={() => {
            return 100;
          }}
          itemCount={curIgCommments?.length || 0}
          overscanCount={5}
          useIsScrolling
          ref={refList}
        >
          {renderRow}
        </VariableSizeList>
      );
    } else {
      if (curIgMedia === "not_live") {
        return (
          <Box
            sx={{
              height: height - 30,
              width: "100%",
              background: "#fff",
              textAlign: "center",
            }}
          >
            <img style={{ marginTop: 64 }} src={CommentIcon}></img>
            <Typography variant="h6" sx={{ color: "#000" }}>
              直播已結束
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)" }}
            >
              Instagram貼文已自動被刪除，故無法在此處查看留言。但您仍可透過矽羽後台查看當時的留言內容。
            </Typography>
          </Box>
        );
      }
      return <Empty message="目前沒有留言" />;
    }
  };

  return (
    <>
      <Box sx={{ maxHeight: height }}>
        {curIgCommments && (
          <Box sx={{ display: "block" }}>{renderContent()}</Box>
        )}
        {!curIgCommments &&
          arrSkelton.map((item, index) => (
            <Skeleton
              key={index}
              animation="wave"
              variant="rectangular"
              height={30}
              sx={{ mt: 1, mb: 1 }}
            />
          ))}
      </Box>
    </>
  );
}

export default IgComments;
