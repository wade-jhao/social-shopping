import { useRef, useEffect, useState, memo } from "react";
import Box from "@mui/material/Box";
import {
  FANS_POST_COMMENT,
  FANS_POST_COMMENTS_RESPONSE,
  PAGING,
  VIDEO,
} from "../apis/facebook";
import {
  ListChildComponentProps,
  VariableSizeList,
  areEqual,
} from "react-window";
import Empty from "@components/Empty";
import FBCommentItem from "./FBCommentItem";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import CommentIcon from "@assets/commentIcon.svg";
import {
  selectActivity,
  selectFansPage,
  selectComments,
  selectVideo,
  getNewCommentsAsync,
  selectPost,
} from "@store/liveroomSlice";
import { useFetchFbAllComments } from "@pages/LiveRoom/utils";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useStreamStatus } from "@hooks/streamStatus";
interface PROPS {
  height: number;
}
function FBComments(props: PROPS) {
  const { height } = props;
  const curFanPage = useAppSelector(selectFansPage);
  const { IS_STREAMING, IS_STREAM_ENDED } = useStreamStatus();
  const refInterval = useRef<number | null>(null);
  const curActivity = useAppSelector(selectActivity);
  const curPost = useAppSelector(selectPost);
  const curComments = useAppSelector(selectComments);
  const curLiveVideo = useAppSelector(selectVideo);
  const {
    getAllComments,
    isLoadingComplete,
    lastPaging: lastInitialPaging,
  } = useFetchFbAllComments();
  const dispatch = useAppDispatch();
  const refReply = useRef<any>(null);
  const refEventNode = useRef<any>(null);
  const refList = useRef<any>(null);
  const [isReply, setIsReply] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isReadingReplyList, setIsReadingReplyList] = useState(false);
  const [commentVal, setCurCommentVal] = useState("");
  const [curComment, setCurComment] = useState<FANS_POST_COMMENT | null>(null);
  const arrSkelton = new Array(8).fill(0);
  const [liveCommentsCurCursor, setLiveCommentsCurCursor] =
    useState<PAGING | null>(null);
  const renderRow = memo((props: ListChildComponentProps) => {
    if (!curComments.length) {
      return null;
    }
    const { index } = props;
    const comment = curComments[index];

    return (
      <FBCommentItem
        comment={comment}
        replying={curComments[index].id === curComment?.id}
        {...props}
        onReply={onReply}
        onOpenReplyList={onOpenReplyList}
        onDelete={(comment: FANS_POST_COMMENT) => {}}
        onEdit={onEdit}
      />
    );
  }, areEqual);

  useEffect(() => {
    if (curFanPage && curLiveVideo && curActivity) {
      if (IS_STREAMING) {
        if (!isLoadingComplete) {
          fetchInitComments();
          return;
        }
        refInterval.current = window.setInterval(() => {
          dispatch(
            getNewCommentsAsync({
              isLiveVideo: true,
              accessToken: curFanPage.access_token,
              postId: IS_STREAMING
                ? (curLiveVideo as VIDEO).id
                : curActivity?.dispatch?.fb_post_id || "",
              onResult: (res: FANS_POST_COMMENTS_RESPONSE) => {
                if (!res?.paging) {
                  return;
                }
                setLiveCommentsCurCursor(res?.paging);
              },
              curPaging:
                liveCommentsCurCursor || lastInitialPaging || undefined,
            })
          );
        }, 4000);
        return () => {
          if (refInterval.current) {
            window.clearInterval(refInterval.current);
          }
        };
      }
      if (IS_STREAM_ENDED) {
        fetchInitComments();
        if (refInterval.current) {
          window.clearInterval(refInterval.current);
        }
      }
    }
    return () => {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    };
  }, [
    curFanPage,
    curActivity,
    curLiveVideo,
    liveCommentsCurCursor,
    isLoadingComplete,
  ]);

  const fetchInitComments = () => {
    if (curLiveVideo !== "not_found" && curLiveVideo?.live_status === "LIVE") {
      getAllComments(true, curFanPage?.access_token as string, curLiveVideo.id);
    } else {
      getAllComments(
        false,
        curFanPage?.access_token as string,
        curActivity?.dispatch?.fb_post_id as string
      );
    }
  };

  useEffect(() => {
    if (refList.current) {
      refList.current.scrollToItem(curComments.length - 1, "end");
    }
  }, [curComments]);

  useEffect(() => {
    if (!isReadingReplyList && curComments && curComments.length) {
      if (refList.current) {
        refList.current.scrollToItem(curComments.length - 1, "end");
      }
    }
  }, [isReadingReplyList]);

  useEffect(() => {
    (isReply && refReply.current.firstChild.focus()) ||
      (isEdit && refReply.current.firstChild.focus());
  }, [isReply, isEdit]);

  useEffect(() => {
    return () => {
      if (refEventNode.current) {
        refEventNode.current.removeEventListener("open", () => {});
        refEventNode.current.close();
      }
    };
  }, []);

  const onReply = (index: any) => {
    if (commentVal) {
      setCurCommentVal("");
    }
    setCurComment(curComments[index]);
    setIsReply(true);
  };

  const onOpenReplyList = (index: any) => {
    if (commentVal) {
      setCurCommentVal("");
    }
    setCurComment(curComments[index]);
    setIsReply(true);
    setIsReadingReplyList(true);
  };

  const onEdit = (index: any) => {
    const curComment = curComments[index];
    if (curComment) {
      setCurComment(curComment);
      setCurCommentVal(curComment.message as string);
    }
    setIsEdit(true);
  };

  const renderContent = () => {
    if (curComments?.length > 0) {
      return (
        <VariableSizeList
          className="comment-FixedSizeList"
          height={height - (refReply?.current?.clientHeight || 0)}
          width={"100%"}
          itemSize={() => {
            return 100;
          }}
          itemCount={curComments?.length || 0}
          overscanCount={5}
          useIsScrolling
          ref={refList}
        >
          {renderRow}
        </VariableSizeList>
      );
    } else {
      return <Empty message="目前沒有留言" />;
    }
  };

  return (
    <>
      <Box>
        {curComments && !isReadingReplyList && <Box>{renderContent()}</Box>}
        {!curComments &&
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
        {curPost?.error && (
          <>
            <Box
              sx={{
                height: (height || 0) - 30,
                width: "100%",
                background: "#fff",
                textAlign: "center",
              }}
            >
              <img style={{ marginTop: 64 }} src={CommentIcon}></img>
              <Typography variant="h6" sx={{ color: "#000" }}>
                目前沒有留言
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "rgba(0, 0, 0, 0.60)" }}
              >
                您無法查看留言，因為貼文已刪除。
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default FBComments;
