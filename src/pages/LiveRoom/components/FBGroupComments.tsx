import { useRef, useEffect, useState, memo } from "react";
import Box from "@mui/material/Box";
import {
  FANS_POST_COMMENT,
  FANS_POST_COMMENTS_RESPONSE,
  LIVE_VIDEO,
  PAGING,
  getLiveVideoComment,
} from "../apis/facebook";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
} from "react-window";
import Textarea from "@mui/joy/Textarea";
import Empty from "@components/Empty";
import FBGroupCommentItem from "./FBGroupCommentItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import CommentIcon from "@assets/commentIcon.svg";
import FBSubComments from "./FBSubComments";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Skeleton from "@mui/material/Skeleton";
import { selectApis } from "@store/apiSlice";
import {
  selectActivity,
  // getGroupCommentsAsync,
  selectComments,
  selectLiveVideo,
  deleteCommentAsync,
  getMemberAsync,
  selectMemberList,
  getCommentAsync,
  selectFansPage,
  getNewGroupCommentsAsync,
  selectPost,
} from "@store/liveroomSlice";
import {
  getNewCommentsOfLength,
  useFetchFbGroupAllComments,
} from "@pages/LiveRoom/utils";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Grid } from "@mui/material";
import { useStreamStatus } from "@hooks/streamStatus";

interface PROPS {
  isLoading: boolean;
  height: number;
}
function FBComments(props: PROPS) {
  const { isLoading = false, height } = props;
  const apis = useAppSelector(selectApis);
  const curFanPage = useAppSelector(selectFansPage);
  const { IS_STREAMING, IS_STREAM_ENDED } = useStreamStatus();
  const refInterval = useRef<number | null>(null);
  const curActivity = useAppSelector(selectActivity);
  const curPost = useAppSelector(selectPost);
  const curComments = useAppSelector(selectComments);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curMemberList = useAppSelector(selectMemberList);
  const dispatch = useAppDispatch();
  const {
    getAllComments,
    isLoadingComplete,
    lastPaging: lastInitialPaging,
  } = useFetchFbGroupAllComments();
  const refReply = useRef<any>(null);
  const refEventNode = useRef<any>(null);
  const [isReply, setIsReply] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isReadingReplyList, setIsReadingReplyList] = useState(false);
  const [commentVal, setCurCommentVal] = useState("");
  const [isDeleteingComment, setIsDeleteingComment] = useState(false);
  const [deletingComment, setDeletingComment] =
    useState<FANS_POST_COMMENT | null>(null);
  const [curComment, setCurComment] = useState<FANS_POST_COMMENT | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [latestFbCommments, setLatestFbCommments] = useState<
    FANS_POST_COMMENT[]
  >([]);
  const arrSkelton = new Array(8).fill(0);
  const [liveCommentsCurCursor, setLiveCommentsCurCursor] =
    useState<PAGING | null>(null);
  const renderRow = memo((props: ListChildComponentProps) => {
    if (!latestFbCommments.length) {
      return null;
    }
    const { index, isScrolling, style } = props;
    const comment = latestFbCommments[index];
    if (isScrolling && isAutoScrolling) {
      return (
        <div style={style}>
          <Grid container>
            <Grid item xs={2}>
              <Skeleton variant="circular" width={40} height={40} />
            </Grid>
            <Grid item xs={10}>
              <Skeleton
                key={index}
                animation="wave"
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 5 }}
              />
            </Grid>
          </Grid>
        </div>
      );
    }
    return (
      <FBGroupCommentItem
        comment={comment}
        replying={latestFbCommments[index].id === curComment?.id}
        {...props}
        onOpenReplyList={onOpenReplyList}
        onDelete={(comment: FANS_POST_COMMENT) => {
          setIsDeleteingComment(true);
          setDeletingComment(comment);
        }}
        onEdit={onEdit}
      />
    );
  }, areEqual);

  const onCommentMsg = (event: MessageEvent) => {
    const commentId: string = JSON.parse(event.data)?.id;
    dispatch(
      getCommentAsync({
        accessToken: curFanPage?.access_token as string,
        commentId: commentId,
      })
    );
  };

  useEffect(() => {
    if (curLiveVideo && curActivity) {
      if (IS_STREAMING) {
        if (!isLoadingComplete) {
          fetchInitComments();
          return;
        }
        getLiveVideoComment(
          (curLiveVideo as LIVE_VIDEO).id,
          curFanPage?.access_token as string
        )
          .then((res) => {
            refEventNode.current = res;
            refEventNode.current.onmessage = onCommentMsg;
          })
          .catch((e) => {
            refInterval.current = window.setInterval(() => {
              dispatch(
                getNewGroupCommentsAsync({
                  accessToken: curFanPage?.access_token || "",
                  videoId: (curLiveVideo as LIVE_VIDEO).id || "",
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
          });
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
  }, [curActivity, curLiveVideo, liveCommentsCurCursor, isLoadingComplete]);

  function smoothScrollToBottom(element: any) {
    const totalHeight = element.scrollHeight - element.clientHeight;
    const distancePerFrame = (totalHeight - element.scrollTop) / 20; // 20 frames for the animation, adjust as needed
    let framesPassed = 0;

    function animate() {
      if (framesPassed < 20) {
        element.scrollTop += distancePerFrame;
        framesPassed++;
        requestAnimationFrame(animate);
      } else {
        element.scrollTop = totalHeight; // Ensure it's completely at the bottom
        setIsAutoScrolling(false);
      }
    }

    animate();
  }

  useEffect(() => {
    if (curComments) {
      const latestComments =
        curLiveVideo &&
        curLiveVideo !== "not_found" &&
        curLiveVideo.status === "LIVE"
          ? getNewCommentsOfLength(curComments)
          : curComments;

      const filterComments: FANS_POST_COMMENT[] = latestComments.filter(
        (comment: FANS_POST_COMMENT) =>
          !curMemberList.some((item2) => comment?.from?.id === item2.user_id)
      );
      let userIds = "";
      filterComments.forEach((comment) => {
        if (userIds === "") {
          userIds = comment?.from?.id || "";
        } else {
          if (!userIds.includes(comment?.from?.id || "")) {
            userIds = `${userIds},${comment?.from?.id}`;
          }
        }
      });
      if (userIds !== "") {
        dispatch(
          getMemberAsync({
            url: apis?.is_member as string,
            userIds: userIds,
            detailUrl: apis?.member as string,
          })
        );
      }

      const commentSectionList = document.getElementsByClassName(
        "comment-FixedSizeList"
      );
      if (commentSectionList && commentSectionList.length > 0) {
        setIsAutoScrolling(true);
        smoothScrollToBottom(commentSectionList[0]);
      }
      setLatestFbCommments(latestComments);
    }
  }, [curComments]);

  const fetchInitComments = () => {
    if (curActivity) {
      getAllComments(
        curFanPage?.access_token as string,
        curLiveVideo !== "not_found" ? curLiveVideo?.id || "" : ""
      );
    }
  };

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

  useEffect(() => {
    if (!isReadingReplyList && latestFbCommments?.length) {
      const commentSectionList = document.getElementsByClassName(
        "comment-FixedSizeList"
      );
      if (commentSectionList && commentSectionList.length > 0) {
        setIsAutoScrolling(true);
        smoothScrollToBottom(commentSectionList[0]);
      }
    }
  }, [isReadingReplyList]);

  const onOpenReplyList = (index: any) => {
    if (commentVal) {
      setCurCommentVal("");
    }
    setCurComment(latestFbCommments[index]);
    setIsReply(true);
    setIsReadingReplyList(true);
  };

  const onCancelReply = () => {
    refReply.current.firstChild.blur();
    setCurComment(null);
    setCurCommentVal("");
    setIsReply(false);
    setIsReadingReplyList(false);
    setIsEdit(false);
  };

  const onEdit = (index: any) => {
    const curComment = latestFbCommments[index];
    if (curComment) {
      setCurComment(curComment);
      setCurCommentVal(curComment.message as string);
    }
    setIsEdit(true);
  };

  const renderContent = () => {
    if (latestFbCommments?.length > 0) {
      return (
        <VariableSizeList
          className="comment-FixedSizeList"
          height={height - (refReply?.current?.clientHeight || 0) - 30}
          width={"100%"}
          itemSize={() => {
            return 100;
          }}
          itemCount={latestFbCommments?.length || 0}
          overscanCount={5}
          useIsScrolling
        >
          {renderRow}
        </VariableSizeList>
      );
    } else {
      return !isLoading && <Empty message="目前沒有留言" />;
    }
  };

  return (
    <>
      <Box sx={{ maxHeight: height }}>
        {curComments && !isReadingReplyList && (
          <Box sx={{ display: isReply || isEdit ? "none" : "block" }}>
            {renderContent()}
          </Box>
        )}
        {curComments && isReadingReplyList && (
          <Box
            sx={{
              display: isReply || isEdit ? "block" : "none",
            }}
          >
            <FBSubComments
              onDelete={(comment: FANS_POST_COMMENT) => {
                setIsDeleteingComment(true);
                setDeletingComment(comment);
              }}
              onCancelReply={onCancelReply}
              contentHeight={
                curComment?.comments && curComment?.comments.data?.length
                  ? height -
                    (refReply?.current?.clientHeight || 0) -
                    50 -
                    (isReply ? 24 : 0)
                  : 0
              }
              comment={
                latestFbCommments.find(
                  (comment: FANS_POST_COMMENT) => comment.id === curComment?.id
                ) || null
              }
              {...props}
            />
          </Box>
        )}
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
                height: height - 30,
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
        <Box>
          <Stack
            direction={"row"}
            sx={{
              display: curComment ? "flex" : "none",
              alignItems: "center",
            }}
            spacing={1}
          >
            <Typography variant="body2" sx={{ display: "flex" }}>
              {`正在瀏覽 ${curComment?.from?.name || "無法解析"} 的留言回覆`}
            </Typography>
          </Stack>
          <Textarea
            id={"reply-comment-id"}
            sx={{ opacity: 0.8, mt: 1, display: "none" }}
            ref={refReply}
            size="sm"
            placeholder="請輸入留言"
            variant="outlined"
            minRows={2}
            maxRows={4}
            color="neutral"
            value={commentVal}
            onChange={(e) => {
              setCurCommentVal(e.target.value);
            }}
            endDecorator={
              <Box
                sx={{
                  display: "flex",
                  gap: "var(--Textarea-paddingBlock)",
                  pt: "var(--Textarea-paddingBlock)",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flex: "auto",
                  justifyContent: "end",
                }}
              >
                <IconButton edge="end" aria-label="send" onClick={() => {}}>
                  <SendIcon
                    color="primary"
                    sx={{ ml: "auto", cursor: "pointer" }}
                  />
                </IconButton>
              </Box>
            }
          />
        </Box>
      </Box>
      <Dialog
        open={isDeleteingComment}
        onClose={() => setIsDeleteingComment(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="delete-prod-dialog">刪除留言</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ display: "flex" }}
          >
            <Typography>請確定您是否要刪除</Typography>
            <Typography sx={{ fontWeight: "bold" }}>
              {deletingComment?.from?.name}
            </Typography>
            <Typography>的留言</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeletingComment(null);
              setIsDeleteingComment(false);
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch(
                deleteCommentAsync({
                  // accessToken: curFanPage?.access_token as string,
                  accessToken: "",
                  comment: deletingComment as FANS_POST_COMMENT,
                  onSuccess: () => {
                    setIsEdit(false);
                    setIsReply(false);
                    setIsDeleteingComment(false);
                    setDeletingComment(null);
                  },
                  level: deletingComment?.parent ? 1 : 0,
                })
              );
            }}
            autoFocus
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FBComments;
