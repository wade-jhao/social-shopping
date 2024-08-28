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
import Textarea from "@mui/joy/Textarea";
import Empty from "@components/Empty";
import FBCommentItem from "./FBCommentItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import SendIcon from "@mui/icons-material/Send";
import FBSubComments from "./FBSubComments";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import Skeleton from "@mui/material/Skeleton";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import CommentIcon from "@assets/commentIcon.svg";
import {
  selectActivity,
  selectFansPage,
  selectComments,
  selectVideo,
  setCommentAsync,
  replyCommentAsync,
  deleteCommentAsync,
  editCommentAsync,
  selectLiveBoradcastMode,
  getNewCommentsAsync,
  selectPost,
} from "@store/liveroomSlice";
import { useFetchFbAllComments } from "@pages/LiveRoom/utils";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Grid } from "@mui/material";
import { setNotice } from "@store/commonSlice";
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
  const isLiveBoradcastMode = useAppSelector(selectLiveBoradcastMode);
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
  const [isDeleteingComment, setIsDeleteingComment] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [deletingComment, setDeletingComment] =
    useState<FANS_POST_COMMENT | null>(null);
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
        onDelete={(comment: FANS_POST_COMMENT) => {
          setIsDeleteingComment(true);
          setDeletingComment(comment);
        }}
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

  const onCancelReply = () => {
    refReply.current.firstChild.blur();
    setCurComment(null);
    setCurCommentVal("");
    setIsReply(false);
    setIsReadingReplyList(false);
    setIsEdit(false);
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
          height={
            isLiveBoradcastMode
              ? height - (refReply?.current?.clientHeight || 0)
              : height -
                (refReply?.current?.clientHeight || 0) -
                35 -
                (isReply || isEdit ? 24 : 0)
          }
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

  const onSendRequest = () => {
    if (!commentVal) {
      return;
    }
    if (curFanPage && curActivity) {
      if (isEdit) {
        setIsRequesting(true);
        dispatch(
          editCommentAsync({
            accessToken: curFanPage.access_token,
            commentId: curComment?.id as string,
            message: commentVal,
            onSuccess: () => {
              setIsRequesting(false);
              setIsEdit(false);
              setCurCommentVal("");
              setCurComment(null);
            },
          })
        );
      } else {
        setIsRequesting(true);
        const commentService = isReply ? replyCommentAsync : setCommentAsync;
        dispatch(
          commentService({
            accessToken: curFanPage.access_token,
            postId: isReply
              ? (curComment?.id as string)
              : (curActivity?.dispatch?.fb_post_id as string),
            comment: commentVal,
            onSuccess: () => {
              setIsRequesting(false);
              setCurCommentVal("");
              dispatch(
                setNotice({
                  isErroring: true,
                  message: isReply ? "回覆留言成功" : "留言成功",
                  type: "success",
                })
              );
              if (isReply) {
                setIsReply(false);
              }
              if (isReadingReplyList) {
                setIsReadingReplyList(false);
              }
              setCurComment(null);
            },
          })
        );
      }
    }
  };

  return (
    <>
      <Box>
        {curComments && !isReadingReplyList && <Box>{renderContent()}</Box>}
        {curComments && isReadingReplyList && (
          <Box>
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
                    21 -
                    (isReply ? 24 : 0)
                  : 0
              }
              comment={
                curComments.find(
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
        <Box>
          <Stack
            direction={"row"}
            sx={{
              display: curComment ? "flex" : "none",
              alignItems: "center",
            }}
            spacing={1}
          >
            {isReply && <ReplyIcon color="action" />}
            {isEdit && <EditIcon color="action" />}
            <Typography variant="body2">
              {isEdit
                ? `${curFanPage?.name} 正在編輯留言`
                : `${curFanPage?.name} 正在回覆 ${curComment?.from?.name}`}
            </Typography>
            <Typography variant="body2" sx={{ display: "flex" }}>
              <Link
                variant="body2"
                sx={{ fontSize: 12, cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  onCancelReply();
                }}
              >
                取消
              </Link>
            </Typography>
          </Stack>
          <Grid
            container
            sx={{
              alignItems: "flex-end",
              visibility: isLiveBoradcastMode ? "hidden" : "visible",
            }}
          >
            <Grid item sx={{ flex: "1 0 auto" }}>
              <Textarea
                id={"reply-comment-id"}
                sx={{
                  opacity: 0.8,
                  mt: 1,
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "4px",
                  "&:hover": { borderColor: "primary.main" },
                  "&:focus": { borderColor: "primary" },
                }}
                ref={refReply}
                size="sm"
                placeholder="請輸入留言"
                variant="outlined"
                minRows={2}
                maxRows={4}
                value={commentVal}
                onChange={(e) => {
                  setCurCommentVal(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={"auto"}>
              <Box
                sx={{
                  display: "flex",
                  gap: "var(--Textarea-paddingBlock)",
                  pt: "var(--Textarea-paddingBlock)",
                  flex: "auto",
                  justifyContent: "end",
                }}
              >
                <LoadingButton
                  loading={isRequesting}
                  aria-label="send"
                  disabled={isRequesting || commentVal === ""}
                  onClick={onSendRequest}
                  sx={{ minWidth: 40, minHeight: 36 }}
                >
                  <SendIcon
                    color="primary"
                    sx={{
                      cursor: "pointer",
                      display: isRequesting ? "none" : "inherit",
                    }}
                  />
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
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
          <LoadingButton
            variant="contained"
            loading={isRequesting}
            onClick={() => {
              setIsRequesting(true);
              dispatch(
                deleteCommentAsync({
                  accessToken: curFanPage?.access_token as string,
                  comment: deletingComment as FANS_POST_COMMENT,
                  onSuccess: () => {
                    setIsRequesting(false);
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
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FBComments;
