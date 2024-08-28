import { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import CustomAccordion from "@components/CustomAccordion";
import CustomAccordionDetails from "@components/CustomAccordionDetails";
import CustomAccordionSummary from "@components/CustomAccordionSummary";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import EmptyPostState from "@pages/Draft/components/EmptyPostState";
import { useAppSelector } from "@store/hooks";
import { selectSocialAccounts } from "@store/liveroomSlice";

import {
  FANS_PAGE,
  getFbVideos,
  getGroupLiveVideos,
  getGroupPosts,
  getIgLiveMediaAndMedia,
  GROUP_PAGE,
  GROUP_POST,
  GROUP_POST_RESPONSE,
  IG_MEDIA,
  IG_MEDIA_RESPONSE,
  LIVE_VIDEO,
  LIVE_VIDEOS_RESPONSE,
  PAGING,
  VIDEO,
  VIDEOS_RESPONSE,
} from "../apis/facebook";

interface PROPS {
  onPostChange: Function;
  onChannelChange: Function;
  channel: string;
}

function SocialPostSelector(props: PROPS) {
  const { onPostChange, channel, onChannelChange } = props;
  const refInterval = useRef<number | null>(null);
  const curPlatform = useAppSelector(selectSocialAccounts);
  const [curFansPage, setCurFansPage] = useState<string>("");
  const [curLiveVideos, setCurLiveVideos] = useState<VIDEO[]>([]);
  const [curLiveVideo, setCurLiveVideo] = useState("");
  const [curIgFansPage, setCurIgFansPage] = useState<string>("");
  const [liveIgMedias, setLiveIgMedias] = useState<IG_MEDIA[]>([]);
  const [curIgMedia, setCurIgMedia] = useState("");
  const [curGroup, setCurGroup] = useState<string>("");
  const [groupLiveVideos, setGroupLiveVideos] = useState<LIVE_VIDEO[]>([]);
  const [curGroupPosts, setCurGroupPosts] = useState<GROUP_POST[]>([]);
  const [groupLivePosts, setGroupLivePosts] = useState<GROUP_POST[]>([]);
  const [curGroupLivePost, setGroupLivePost] = useState<string>("");
  const [isLoadingPostList, setIsLoadingPostList] = useState(true);

  useEffect(() => {
    if (curPlatform) {
      switch (channel) {
        case "facebook.page":
          setCurFansPage(curPlatform[channel][0].id);
          break;
        case "facebook.group":
          setCurGroup(curPlatform[channel][0].id);
          break;
        case "instagram":
          setCurIgFansPage(curPlatform[channel][0].id);
          break;
        default:
          setCurFansPage(curPlatform[channel][0].id);
      }
    }
  }, [curPlatform]);
  useEffect(() => {
    if (curFansPage && curPlatform) {
      const curPage = curPlatform[channel].find(
        (item) => item.id === curFansPage
      );
      if (curPage) {
        if (refInterval.current) {
          window.clearInterval(refInterval.current);
        }
        setIsLoadingPostList(true);
        refInterval.current = window.setInterval(() => {
          getAllLiveVideos(curPage as FANS_PAGE, (res: VIDEO[]) => {
            setCurLiveVideos(res);
            setIsLoadingPostList(false);
          });
        }, 3000);
      }
    }
    return () => {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    };
  }, [curFansPage]);

  useEffect(() => {
    if (curFansPage && curPlatform) {
      const curPage = curPlatform[channel].find(
        (item) => item.id === curFansPage
      );
      if (curPage && curLiveVideos.length && curLiveVideo === "") {
        const liveVideo = curLiveVideos.find(
          (video) => video.live_status === "LIVE"
        );
        if (liveVideo) {
          const curPostId =
            liveVideo.post_id !== "0"
              ? `${curPage?.id}_${liveVideo.post_id}`
              : `${curPage?.id}_${liveVideo.id}`;
          onPostChange(curPostId);
          setCurLiveVideo(curPostId);
        } else {
          onPostChange(`${curPage?.id}_${curLiveVideos[0].id}`);
          setCurLiveVideo(`${curPage?.id}_${curLiveVideos[0].id}`);
        }
      }
    }
  }, [curLiveVideos]);

  useEffect(() => {
    if (curGroup && curPlatform) {
      const curPage = curPlatform[channel].find((item) => item.id === curGroup);
      if (curPage) {
        if (refInterval.current) {
          window.clearInterval(refInterval.current);
        }
        refInterval.current = window.setInterval(() => {
          getAllGroupData();
        }, 4000);
      }
    }
    return () => {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    };
  }, [curGroup]);

  const getAllGroupData = async () => {
    if (curGroup && curPlatform) {
      const curPage = curPlatform[channel].find((item) => item.id === curGroup);
      if (curPage) {
        const getVideos = getAllGroupLiveVideos(
          curPage as GROUP_PAGE,
          curPage.access_token as string,
          (res: LIVE_VIDEO[]) => {
            setGroupLiveVideos(res.filter((video) => video.status === "LIVE"));
            setIsLoadingPostList(false);
          }
        );
        const getFeeds = getLatestGroupFeed(
          curPage as GROUP_PAGE,
          curPage.access_token as string,
          (res: GROUP_POST[]) => {
            setCurGroupPosts(res.filter((post) => post.type === "video"));
            setIsLoadingPostList(false);
          }
        );
        const promiseActions = [getFeeds, getVideos];
        await Promise.all(promiseActions);
      }
    }
  };

  useEffect(() => {
    if (curGroupPosts && groupLiveVideos) {
      const livePost = curGroupPosts.filter((item1) =>
        groupLiveVideos.some((item2) => item1.object_id === item2.video.id)
      );

      if (livePost.length) {
        setGroupLivePosts(livePost);
        setGroupLivePost(livePost[0].id);
        onPostChange(livePost[0].id);
      }
    }
  }, [curGroupPosts, groupLiveVideos]);

  useEffect(() => {
    if (curIgFansPage) {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
      refInterval.current = window.setInterval(() => {
        getAllLiveMedia((res: IG_MEDIA[]) => {
          setLiveIgMedias(res);
          setIsLoadingPostList(false);
        });
      }, 3000);
    }
    return () => {
      if (refInterval.current) {
        window.clearInterval(refInterval.current);
      }
    };
  }, [curIgFansPage]);

  useEffect(() => {
    if (
      curIgFansPage &&
      liveIgMedias.length &&
      curIgMedia === "" &&
      curPlatform
    ) {
      const curPage = curPlatform[channel].find(
        (item) => item.id === curIgFansPage
      );
      onPostChange(
        `${curPage?.instagram_business_account_id}_${liveIgMedias[0].id}`
      );
      setCurIgMedia(liveIgMedias[0].id);
    }
  }, [liveIgMedias]);

  useEffect(() => {
    if (curIgMedia && curPlatform) {
      const curPage = curPlatform[channel].find(
        (item) => item.id === curIgFansPage
      );
      onPostChange(`${curPage?.instagram_business_account_id}_${curIgMedia}`);
    }
  }, [curIgMedia]);

  const getAllLiveMedia = async (
    onResult: Function,
    curLiveMedias: IG_MEDIA[] = [],
    paging: PAGING | undefined = undefined
  ) => {
    if (!curPlatform) {
      return;
    }
    const curPage = curPlatform[channel].find(
      (item) => item.id === curIgFansPage
    );
    if (!curPage) {
      return;
    }

    await getIgLiveMediaAndMedia(
      curPage?.access_token as string,
      (curPage?.instagram_business_account_id as string) || "",
      (res: IG_MEDIA_RESPONSE) => {
        const { data, paging } = res;
        if (data.length) {
          curLiveMedias = [...curLiveMedias, ...data];
        }
        if (paging === undefined) {
          onResult(curLiveMedias);
        }
        if (paging?.cursors?.after) {
          getAllLiveMedia(onResult, curLiveMedias, paging);
        }
      },
      paging?.cursors?.after
    );
  };

  const handleFansPagesChange = (event: SelectChangeEvent) => {
    if (refInterval.current) {
      window.clearInterval(refInterval.current);
    }
    clearFansPageData();
    setCurFansPage(event.target.value);
  };

  const handleGroupChange = (event: SelectChangeEvent) => {
    if (refInterval.current) {
      window.clearInterval(refInterval.current);
    }
    clearFansPageData();
    setCurGroup(event.target.value);
  };

  const handleIgFansPagesChange = (event: SelectChangeEvent) => {
    if (refInterval.current) {
      window.clearInterval(refInterval.current);
    }
    clearFansPageData();
    setCurIgFansPage(event.target.value);
  };

  const renderPostList = () => {
    if (!curPlatform) {
      return null;
    }
    const curPage = curPlatform[channel].find(
      (item) => item.id === curFansPage
    );
    if (curLiveVideos.length) {
      return (
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          <List component="nav" aria-label="fans page live post list">
            {curLiveVideos.map((item, index) => (
              <ListItemButton
                key={index}
                selected={curLiveVideo.split("_")[1] === item?.id}
                onClick={(event) => {
                  const curPage = curPlatform[channel].find(
                    (item) => item.id === curFansPage
                  );

                  if (curPage) {
                    const curPostId =
                      item?.post_id !== "0"
                        ? `${curPage?.id}_${item?.post_id}`
                        : `${curPage?.id}_${item?.id}`;
                    onPostChange(curPostId);
                    setCurLiveVideo(curPostId);
                  }
                }}
              >
                <ListItemText
                  sx={{ overflow: "auto" }}
                  primary={
                    <Box
                      sx={{
                        maxHeight: 100,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        variant="body2"
                      >
                        {item.title ||
                          item.description ||
                          `${curPage?.name}的直播`}
                      </Typography>
                      {item.live_status === "LIVE" ? (
                        <Chip
                          color="error"
                          label="LIVE"
                          size="small"
                          sx={{ opacity: 0.8, ml: 1 }}
                        />
                      ) : (
                        <Chip
                          color="default"
                          label="VOD"
                          size="small"
                          sx={{ opacity: 0.8, ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      );
    } else {
      return (
        <EmptyPostState isLoadingPostList={isLoadingPostList} type="live" />
      );
    }
  };

  const getLiveTimePostTitle = (time: string) => {
    const curTime = new Date();
    const createTime = new Date(time);
    const differenceInMilliseconds = curTime.getTime() - createTime.getTime();

    let differenceInSeconds = differenceInMilliseconds / 1000;
    const hours = Math.floor(differenceInSeconds / 3600);
    differenceInSeconds %= 3600;
    var minutes = Math.floor(differenceInSeconds / 60);
    var seconds = Math.floor(differenceInSeconds % 60);
    let val = "";
    if (hours > 0) {
      val += `${hours}小時`;
    }
    if (minutes >= 1) {
      val += `${minutes}分`;
    }
    if (seconds > 0) {
      val += `${seconds}秒前開始的直播`;
    }
    return val;
  };

  const renderGroupPostList = () => {
    if (groupLiveVideos.length) {
      return (
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          <List component="nav" aria-label="group page live post list">
            {groupLivePosts.map((item, index) => (
              <ListItemButton
                key={index}
                selected={curGroupLivePost === item?.id}
                onClick={(event) => {
                  onPostChange(curGroupLivePost);
                  setGroupLivePost(item.id);
                }}
              >
                <ListItemText
                  sx={{ overflow: "auto" }}
                  primary={
                    <Box
                      sx={{
                        maxHeight: 100,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        variant="body2"
                      >
                        {item.message ||
                          `${getLiveTimePostTitle(item.created_time)}`}
                      </Typography>
                      <Chip
                        color="error"
                        label="Live"
                        size="small"
                        sx={{ opacity: 0.8, ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={dayjs(item.created_time).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      );
    } else {
      return (
        <EmptyPostState isLoadingPostList={isLoadingPostList} type="live" />
      );
    }
  };

  const renderIGMediaList = () => {
    if (liveIgMedias.length) {
      return (
        <Box
          sx={{
            mt: 1,
            width: "100%",
            maxHeight: 400,
            overflowY: "scroll",
          }}
        >
          <List component="nav" aria-label="fans page post list">
            {liveIgMedias.map((item, index) => (
              <ListItemButton
                key={index}
                selected={curIgMedia === item.id}
                onClick={(event) => setCurIgMedia(item.id)}
              >
                <ListItemText
                  sx={{ overflow: "auto" }}
                  primary={
                    <Box
                      sx={{
                        maxHeight: 100,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        variant="body2"
                      >
                        {item.caption
                          ? item.caption
                          : `${getLiveTimePostTitle(item.timestamp)}`}
                      </Typography>
                      <Chip
                        color="error"
                        label="Live"
                        size="small"
                        sx={{ opacity: 0.8, ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={dayjs(item.timestamp).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      );
    } else {
      return (
        <EmptyPostState isLoadingPostList={isLoadingPostList} type="live" />
      );
    }
  };

  const getGroupPage = () => {
    return (
      <CustomAccordion>
        <CustomAccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>社團</Typography>
            <Link
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onChannelChange();
              }}
              sx={{ display: "none" }}
            >
              切換平台
            </Link>
          </Box>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography
            sx={{ color: "rgba(0, 0, 0, 0.6)", mb: 2, fontSize: "12px" }}
            variant="body1"
          >
            欲進行直播的社團必須安裝「矽羽+1智慧小幫手」應用程式，且社團成員需要完成授權,
            僅列出商家後台外部網站有設定的Facebook社團
          </Typography>
          <FormControl fullWidth sx={{ padding: 0 }}>
            <InputLabel id="demo-simple-select-helper-label">社團</InputLabel>
            <Select
              value={curGroup}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Fans"
              onChange={handleGroupChange}
            >
              {curPlatform &&
                curPlatform[channel].map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        alt={item.name}
                        src={item.name}
                        sx={{ mr: 2 }}
                      ></Avatar>
                      <span>{item.name}</span>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
            {renderGroupPostList()}
          </FormControl>
        </CustomAccordionDetails>
      </CustomAccordion>
    );
  };

  const getFanPage = () => {
    return (
      <CustomAccordion>
        <CustomAccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>粉絲專頁</Typography>
            <Link
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onChannelChange();
              }}
              sx={{ display: "none" }}
            >
              切換平台
            </Link>
          </Box>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography
            sx={{ color: "rgba(0, 0, 0, 0.6)", mb: 2, fontSize: "12px" }}
            variant="body1"
          >
            僅列出商家後台外部網站有設定的Facebook粉絲專頁
          </Typography>
          <FormControl fullWidth sx={{ padding: 0 }}>
            <InputLabel id="demo-simple-select-helper-label">
              粉絲專頁
            </InputLabel>
            <Select
              value={curFansPage}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Fans"
              onChange={handleFansPagesChange}
            >
              {curPlatform &&
                curPlatform[channel].map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        alt={item.name}
                        src={item.name}
                        sx={{ mr: 2 }}
                      ></Avatar>
                      <span>{item.name}</span>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
            {renderPostList()}
          </FormControl>
        </CustomAccordionDetails>
      </CustomAccordion>
    );
  };

  const getIGPage = () => {
    return (
      <CustomAccordion>
        <CustomAccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>Instagram商業帳號</Typography>
            <Link
              sx={{ display: "none" }}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onChannelChange();
              }}
            >
              切換平台
            </Link>
          </Box>
        </CustomAccordionSummary>
        <CustomAccordionDetails>
          <Typography
            sx={{ color: "rgba(0, 0, 0, 0.6)", mb: 2, fontSize: "12px" }}
            variant="body1"
          >
            僅列出商家後台外部網站有設定的Facebook粉絲專頁已連接的Instagram商業帳號
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-helper-label">
              Instagram商業帳號
            </InputLabel>
            <Select
              value={curIgFansPage}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Fans"
              onChange={handleIgFansPagesChange}
            >
              {curPlatform &&
                curPlatform[channel].map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        alt={item.name}
                        src={item.name}
                        sx={{ mr: 2 }}
                      ></Avatar>
                      <span>{item.name}</span>
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {renderIGMediaList()}
        </CustomAccordionDetails>
      </CustomAccordion>
    );
  };

  const clearFansPageData = () => {
    setCurLiveVideos([]);
    setCurLiveVideo("");
    setLiveIgMedias([]);
    setCurIgMedia("");
    setGroupLiveVideos([]);
    onPostChange("");
    setGroupLivePosts([]);
    setGroupLivePost("");
  };

  const getAllLiveVideos = async (
    fanPage: FANS_PAGE,
    onResult: Function,
    curLiveVideo: VIDEO[] = [],
    paging: PAGING | undefined = undefined
  ) => {
    await getFbVideos(
      fanPage,
      (res: VIDEOS_RESPONSE) => {
        const { data } = res;
        onResult(data);
      },
      paging?.cursors?.after
    );
  };

  const getLatestGroupFeed = async (
    group: GROUP_PAGE,
    accessToken: string,
    onResult: Function
  ) => {
    await getGroupPosts(accessToken, group, (res: GROUP_POST_RESPONSE) => {
      const { data } = res;
      if (data) {
        onResult(data);
      }
    });
  };
  const getChannelPage = () => {
    switch (channel) {
      case "facebook.page":
        return getFanPage();
      case "facebook.group":
        return getGroupPage();
      case "instagram":
        return getIGPage();
      default:
        return getFanPage();
    }
  };

  const getAllGroupLiveVideos = async (
    group: GROUP_PAGE,
    accessToken: string,
    onResult: Function,
    curLiveVideo: LIVE_VIDEO[] = [],
    paging: PAGING | undefined = undefined
  ) => {
    await getGroupLiveVideos(
      group,
      accessToken,
      (res: LIVE_VIDEOS_RESPONSE) => {
        const { data } = res;
        onResult(data);
        // if (data.length) {
        //   curLiveVideo = [...curLiveVideo, ...data];
        // }
        // if (paging === undefined) {
        //   onResult(curLiveVideo);
        // }
        // if (paging?.cursors?.after) {
        //   getAllGroupLiveVideos(
        //     group,
        //     accessToken,
        //     onResult,
        //     curLiveVideo,
        //     paging
        //   );
        // }
      },
      paging?.cursors?.after
    );
  };

  return (
    <>
      <Box sx={{ width: "100%", padding: 0 }}>{getChannelPage()}</Box>
    </>
  );
}

export default SocialPostSelector;

// const getAllGroupLiveVideos = async (
//   group: GROUP_PAGE,
//   accessToken: string,
//   onResult: Function,
//   curLiveVideo: LIVE_VIDEO[] = [],
//   paging: PAGING | undefined = undefined
// ) => {
//   await getGroupPosts(
//     accessToken,
//     group,
//     (res: LIVE_VIDEOS_RESPONSE) => {
//       const { data, paging } = res;
//       if (data.length) {
//         curLiveVideo = [...curLiveVideo, ...data];
//       }
//       if (paging === undefined) {
//         onResult(curLiveVideo);
//       }
//       if (paging?.cursors?.after) {
//         getAllGroupLiveVideos(
//           group,
//           accessToken,
//           onResult,
//           curLiveVideo,
//           paging
//         );
//       }
//     },
//     paging?.cursors?.after
//   );
// };

// getAllGroupPosts(curPage as GROUP_PAGE, (res: GROUP_POST[]) => {
//   setCurGroupPosts(res);
//   if (res.length && curGroupPost === "") {
//     onPostChange(`${curGroup}_${res[0].id}`);
//     setGroupPost(res[0].id);
//   }
// });

// const getAllGroupPosts = async (
//   group: GROUP_PAGE,
//   onResult: Function,
//   curGroupPost: GROUP_POST[] = [],
//   paging: GROUP_PAGING | undefined = undefined
// ) => {
//   await getGroupPosts(
//     refAccessToken.current as string,
//     group,
//     (res: GROUP_POST_RESPONSE) => {
//       const { data, paging } = res;
//       if (data.length) {
//         curGroupPost = [...curGroupPost, ...data];
//       }
//       if (paging === undefined) {
//         onResult(curGroupPost);
//       }
//       if (paging?.next) {
//         getAllGroupPosts(group, onResult, curGroupPost, paging);
//       }
//     },
//     paging?.next
//   );
// };
