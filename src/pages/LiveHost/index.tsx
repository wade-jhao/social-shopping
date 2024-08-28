import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { selectApis } from "@store/apiSlice";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Activity from "./components/Activity";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import LivePost from "./components/LivePost";
import style from "./index.module.scss";
import FBComments from "./components/FBComments";
import FBGroupComments from "./components/FBGroupComments";
import IgComments from "./components/IgComments";
import {
  getNewFansPageAsync,
  selectLiveVideo,
  selectActivity,
  selectIgMedia,
  getPostActionsAsync,
  selectVideo,
  getDiscountAsync,
  selectDiscount,
  selectPost,
} from "@store/liveroomSlice";

import { useAppDispatch, useAppSelector } from "@store/hooks";
import { sendGaPageView } from "@utils/track";
import PostIsDeleteRemind from "@components/PostIsDeleteRemind";

interface PROPS {
  fansPageId: string;
  postId: string;
}

const ACTIVITY_HEIGHT = 48;

// post_actions
function LiveRoom(props: PROPS) {
  let { activityId, postId } = useParams();
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const initDiscount = useAppSelector(selectDiscount);
  const curActivity = useAppSelector(selectActivity);
  const curPost = useAppSelector(selectPost);
  const curIgMedia = useAppSelector(selectIgMedia);
  const refAccordingPostSummary = useRef<any>(null);
  const refAccordingCommentSummary = useRef<any>(null);
  const [liveRoomHeight, setLiveRoomHeight] = useState(0);
  const [videoContainerHeight, setVideoContainerHeight] = useState(0);
  const [commentContainerHeight, setCommentContainerHeight] = useState(0);
  const [isIgActionReady, setIsIgActionReady] = useState(false);

  // const [isDialogPostIsDeleteRemindOpen, setIsDialogPostIsDeleteRemindOpen] =
  //   useState(false);

  // useEffect(() => {
  //   if (curPost?.error) {
  //     setIsDialogPostIsDeleteRemindOpen(true);
  //   }
  // }, [curPost?.error]);

  useEffect(() => {
    if (curActivity) {
      switch (curActivity.dispatch?.platform) {
        case "facebook.page":
          if (
            curVideo &&
            curVideo !== "not_found" &&
            curVideo?.live_status === "LIVE"
          ) {
            const title = `Facebook粉專直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        case "facebook.group":
          if (
            curLiveVideo &&
            curLiveVideo !== "not_found" &&
            curLiveVideo?.status === "LIVE"
          ) {
            const title = `Facebook社團直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
          break;
        default:
          if (curIgMedia && curIgMedia !== "not_live") {
            const title = `Instagram直播 - ${
              curActivity?.dispatch?.platform_name as string
            }`;
            document.title = title;
            sendGaPageView(title);
          }
      }
    }
  }, [curActivity, curIgMedia, curLiveVideo, curVideo]);

  useEffect(() => {
    if (curActivity && curActivity.dispatch?.platform !== "instagram") {
      if (
        (curVideo && curVideo !== "not_found") ||
        (curLiveVideo && curLiveVideo !== "not_found") ||
        curPost?.error
      ) {
        dispatch(
          getPostActionsAsync({
            url: apis?.post_actions as string,
            activityId: activityId as string,
            postId: postId as string,
          })
        );
      }
    }
  }, [curVideo, curLiveVideo, curPost]);

  // useEffect(() => {
  //   if (typeof IS_STREAMING === "string" && IS_STREAMING === "UNKONWN") {
  //     setIsDialogPostIsDeleteRemindOpen(true);
  //   }
  // }, [IS_STREAMING]);

  useEffect(() => {
    window.addEventListener("resize", onResizeHandler);
    setLiveRoomHeight(window.innerHeight);
    return () => {
      window.removeEventListener("resize", onResizeHandler);
    };
  }, []);

  useEffect(() => {
    if (!initDiscount) {
      dispatch(
        getDiscountAsync({
          url: apis?.activity_post_discount as string,
          activityId: activityId as string,
          postId: postId as string,
        })
      );
    }
  }, [initDiscount]);

  useEffect(() => {
    if (curActivity) {
      dispatch(
        getNewFansPageAsync({
          url: apis?.social_accounts as string,
          fansPageId: curActivity.dispatch?.fb_fanspage_id as string,
          platform: curActivity.dispatch?.platform as string,
        })
      );
    }
  }, [curActivity]);

  useEffect(() => {
    if (liveRoomHeight) {
      if (refAccordingCommentSummary?.current) {
        setCommentContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
            refAccordingCommentSummary?.current?.clientHeight
        );
      }
      if (refAccordingPostSummary?.current) {
        setVideoContainerHeight(
          Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
            refAccordingPostSummary?.current?.clientHeight
        );
      }
    }
  }, [liveRoomHeight]);

  useEffect(() => {
    if (curIgMedia && !isIgActionReady) {
      dispatch(
        getPostActionsAsync({
          url: apis?.post_actions as string,
          activityId: activityId as string,
          postId: postId as string,
        })
      );
      setIsIgActionReady(true);
    }
  }, [curIgMedia]);

  // useEffect(() => {
  //   if (isCollapsedVideo && liveRoomHeight) {
  //     setOrderContainerHeight(
  //       Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) -
  //         refAccordingOrderSummary?.current?.clientHeight -
  //         refAccordingPostSummary?.current?.clientHeight
  //     );
  //   } else {
  //     if (refAccordingOrderSummary?.current) {
  //       setOrderContainerHeight(
  //         Math.floor(liveRoomHeight - ACTIVITY_HEIGHT) / 2 -
  //           refAccordingOrderSummary?.current?.clientHeight
  //       );
  //     }
  //   }
  // }, [isCollapsedVideo]);

  const onResizeHandler = () => {
    setLiveRoomHeight(window.innerHeight);
  };

  const getSocialComment = () => {
    switch (curActivity?.dispatch?.platform) {
      case "facebook.page":
        return <FBComments height={commentContainerHeight} />;
      case "facebook.group":
        return (
          <FBGroupComments isLoading={false} height={commentContainerHeight} />
        );
      case "instagram":
        return <IgComments height={commentContainerHeight} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Container
        id="live-room-container-id"
        disableGutters
        maxWidth={false}
        sx={{
          height: `${liveRoomHeight}px`,
          background: "#f0f2f5",
          overflow: "hidden",
          display: "flex",
        }}
        className={style.liveRoom}
      >
        <Grid container spacing={0} columns={30}>
          <Grid item xs={30}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Activity />
              </Grid>
              <Grid
                container
                spacing={0}
                sx={{
                  justifyContent: "center",
                }}
              >
                <Grid item xs={5}>
                  <Box>
                    {curPost?.error && (
                      <PostIsDeleteRemind
                        liveRoomHeight={liveRoomHeight}
                        activityHeight={ACTIVITY_HEIGHT}
                      />
                    )}
                    {!curPost?.error && (
                      <Box
                        sx={{
                          display: "grid",
                          gridAutoRows: `${"64px"}`,
                          gridAutoColumns: "100%",
                          height: "100%",
                        }}
                      >
                        <Accordion defaultExpanded disableGutters>
                          <AccordionSummary
                            expandIcon={null}
                            aria-controls="panel1a-content"
                            id="videoAccordion"
                            ref={refAccordingPostSummary}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="subtitle2">
                                  直播影片
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <Divider />
                          <AccordionDetails
                            sx={{
                              p: 0,
                            }}
                          >
                            {((curActivity?.dispatch?.platform.includes(
                              "facebook"
                            ) &&
                              curLiveVideo !== "not_found") ||
                              curActivity?.dispatch?.platform ===
                                "instagram") && (
                              <LivePost
                                height={videoContainerHeight}
                                isVisible={true}
                              />
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Accordion defaultExpanded disableGutters expanded>
                    <AccordionSummary
                      expandIcon={null}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      ref={refAccordingCommentSummary}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Typography variant="subtitle2">用戶留言</Typography>
                      </Box>
                    </AccordionSummary>
                    <Divider />
                    <AccordionDetails>{getSocialComment()}</AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default LiveRoom;
