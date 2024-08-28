import { useRef, useEffect, useState, memo } from "react";
import Box from "@mui/material/Box";
import { IG_MEDIA_COMMENT } from "../apis/facebook";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
} from "react-window";
import Textarea from "@mui/joy/Textarea";
import Button from "@mui/material/Button";
import Empty from "@components/Empty";
import IgCommentItem from "./IgCommentItem";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import LaunchIcon from "@mui/icons-material/Launch";
import CommentIcon from "@assets/commentIcon.svg";
import {
  selectActivity,
  selectIgMediaComments,
  selectFansPage,
  setIgCommentAsync,
  selectIgMedia,
  selectPostActions,
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
  const curPostActions = useAppSelector(selectPostActions);
  const dispatch = useAppDispatch();
  const refReply = useRef<any>(null);
  const [commentVal, setCurCommentVal] = useState("");
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
    if (curIgMedia === "not_live") {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    }
  }, [curIgMedia]);

  useEffect(() => {
    if (refList.current) {
      refList.current.scrollToItem(curIgCommments.length - 1, "end");
    }
  }, [curIgCommments]);

  const getActionLink = () => {
    if (!curPostActions) {
      return "";
    }
    const curAction = curPostActions?.find((action) => action.type === "留言");
    if (curAction) {
      return curAction.url;
    } else {
      return "";
    }
  };

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
            <Link
              sx={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
              }}
              href={getActionLink()}
              target="_"
            >
              <Button size="small" variant="contained" endIcon={<LaunchIcon />}>
                前往查看
              </Button>
            </Link>
          </Box>
        );
      }
      return <Empty message="目前沒有留言" />;
    }
  };

  const onSendRequest = () => {
    if (!commentVal) {
      return;
    }
    if (curFanPage && curActivity) {
      // const commentService = isReply ? replyCommentAsync : setCommentAsync;
      dispatch(
        setIgCommentAsync({
          accessToken: curFanPage.access_token,
          postId: curActivity?.dispatch?.fb_post_id as string,
          comment: commentVal,
          onSuccess: () => {
            setCurCommentVal("");
          },
        })
      );
    }
  };

  return (
    <>
      <Box sx={{ maxHeight: height, background: "#fff", pt: 1, pb: 1 }}>
        {curIgCommments && (
          <Box sx={{ display: "block", pl: 1 }}>{renderContent()}</Box>
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
        <Box style={{ display: "none" }}>
          <Textarea
            id={"reply-comment-id"}
            sx={{ opacity: 0.8, mt: 1 }}
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
                <IconButton
                  edge="end"
                  aria-label="send"
                  onClick={onSendRequest}
                >
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
    </>
  );
}

export default IgComments;
