import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@store/store";
import {
  FANS_PAGE,
  PAGING,
  LIVE_VIDEOS_RESPONSE,
  LIVE_VIDEO,
  FANS_POST,
  FANS_POST_COMMENTS_RESPONSE,
  FANS_POST_COMMENT,
  ATTACHMENT,
  GROUP_POST,
  IG_POST_COMMENTS_RESPONSE,
  IG_MEDIA_COMMENT,
  GROUP_POST_RESPONSE,
  IG_MEDIA,
  getFansPage,
  getFbLiveVideos,
  getPostInfo,
  getFansPostComments,
  getFansPostComment,
  getLiveVideoComments,
  sendFBPostComment,
  deleteFBPostComment,
  getGroupLiveVideos,
  getIgMediaInfo,
  getIgComments,
  sendIGPostComment,
  editFBComment,
  getGroupPosts,
  getLiveVideoDetail,
  VIDEO,
  updateLiveVideoDescription,
  updateVideoDescription,
} from "@pages/LiveRoom/apis/facebook";
import {
  PRODUCT,
  ACTIVITY,
  ACTIVITY_POST,
  DELETE_PRODUCT_DATA,
  PRODUCT_CATEGORY,
  MEMBER_INFO,
  MEMBER_DATA,
  POST_ACTION,
  DISCOUNT,
  PLATFORM,
  fetchProdList,
  fetchNickNames,
  fetchActivity,
  fetchDispatch,
  deleteProduct,
  editProdKeyword,
  addCurProduct,
  getActivityPosts,
  checkIsMemberComment,
  setEnableActivity,
  getMemberDetail,
  getPostAction,
  getProductCategories,
  getShopProducts,
  bindMember,
  editVariantsKeywords,
  getActivityPostDiscount,
  getSocialAccounts,
  updateProduct,
} from "@pages/LiveRoom/apis/legacy";

export interface State {
  fansPage: FANS_PAGE | null;
  post: FANS_POST | null;
  liveVideo: LIVE_VIDEO | null | "not_found";
  liveVideos: LIVE_VIDEO[] | null;
  video: VIDEO | null | "not_found";
  activityProducts: PRODUCT[] | null;
  products: PRODUCT[] | null;
  shopProducts: PRODUCT[] | null;
  activity: ACTIVITY | null;
  igMediaInfo: IG_MEDIA | null | "not_live";
  igMediaUrl: string | null;
  groupPost: GROUP_POST | null;
  igComments: IG_MEDIA_COMMENT[] | any;
  activityPosts: ACTIVITY_POST[] | null;
  comments: FANS_POST_COMMENT[] | any;
  order: any;
  orderNew: string | null;
  memberList: MEMBER_INFO[];
  postActions: POST_ACTION[] | null;
  productCategories: PRODUCT_CATEGORY[] | null;
  discount: DISCOUNT | null;
  socialAccounts: { [channel: string]: PLATFORM[] } | null;
  isLiveBoradcastMode: boolean;
  status: "idle" | "loading" | "failed";
  isPrepared: boolean;
}

const initialState: State = {
  fansPage: null,
  post: null,
  liveVideo: null,
  video: null,
  liveVideos: null,
  igMediaUrl: null,
  igMediaInfo: null,
  activityProducts: null,
  products: null,
  shopProducts: null,
  activity: null,
  comments: null,
  igComments: null,
  groupPost: null,
  activityPosts: null,
  memberList: [],
  order: null,
  orderNew: null,
  postActions: null,
  discount: null,
  socialAccounts: null,
  productCategories: [{ title: "所有分類", id: "default" }],
  isLiveBoradcastMode: false,
  status: "idle",
  isPrepared: false,
};

export const getFansPageAsync = createAsyncThunk(
  "liveRoom/fetchFansPage",
  async (params: { fansPageId: string; accessToken: string }) => {
    const curFanPage = await new Promise<FANS_PAGE>((resolve) => {
      const onFetchFansPageSuccess = (res: FANS_PAGE) => {
        resolve(res);
      };
      const { fansPageId, accessToken } = params;
      getFansPage(fansPageId, accessToken, onFetchFansPageSuccess);
    });
    return curFanPage;
  }
);

export const getNewFansPageAsync = createAsyncThunk(
  "liveRoom/newFetchFansPage",
  async (params: { url: string; fansPageId: string; platform: string }) => {
    const curFanPage = await new Promise<FANS_PAGE | null>((resolve) => {
      const { url, fansPageId, platform } = params;
      getSocialAccounts(url, platform).then((res: any) => {
        const curFanPage: FANS_PAGE = res.find(
          (page: FANS_PAGE) => page.id === fansPageId
        );
        if (curFanPage) {
          resolve(curFanPage);
        } else {
          resolve(null);
        }
      });
    });
    if (curFanPage) {
      return curFanPage;
    }
  }
);

export const getAllSocialAccountsAtOnceAsync = createAsyncThunk(
  "liveRoom/getAllSocialAccountsAtOnce",
  async (params: { url: string }) => {
    const platforms = ["facebook.page", "facebook.group", "instagram"];
    const socialAccounts = await Promise.all(
      platforms.map((platform) => {
        return new Promise<PLATFORM[]>((resolve) => {
          const { url } = params;
          getSocialAccounts(url, platform).then((res: PLATFORM[]) => {
            resolve(res);
          });
        });
      })
    );
    return socialAccounts.reduce(
      (acc: Record<string, PLATFORM[]>, cur: PLATFORM[], index: number) => {
        return { ...acc, [platforms[index]]: cur };
      },
      {}
    );
  }
);

export const getPostAsync = createAsyncThunk(
  "liveRoom/fetchPost",
  async (params: { postId: string; accessToken: string }) => {
    const curPost = await new Promise<FANS_POST>((resolve) => {
      const onFetchPostSuccess = (res: FANS_POST) => {
        resolve(res);
      };
      const { postId, accessToken } = params;
      getPostInfo(postId, accessToken, onFetchPostSuccess);
    });
    return curPost;
  }
);

export const updateLiveVideoDescriptionAsync = createAsyncThunk(
  "liveRoom/fetchUpdateLiveVideoDescription",
  async (params: {
    pageId: string;
    accessToken: string;
    description: string;
  }) => {
    const newLiveVideoDescription = await new Promise<string>((resolve) => {
      const onFetchPostSuccess = (res: string) => {
        resolve(res);
      };
      const { pageId, accessToken, description } = params;
      updateLiveVideoDescription(
        pageId,
        accessToken,
        description,
        onFetchPostSuccess
      );
    });
    return newLiveVideoDescription;
  }
);

export const updateVideoDescriptionAsync = createAsyncThunk(
  "liveRoom/fetchUpdatePostMessage",
  async (params: { postId: string; accessToken: string; message: string }) => {
    const curPost = await new Promise<string>((resolve) => {
      const onFetchPostSuccess = (res: string) => {
        resolve(res);
      };
      const { postId, accessToken, message } = params;
      updateVideoDescription(postId, accessToken, message, onFetchPostSuccess);
    });
    return curPost;
  }
);

const getAllLiveVideos = async (
  fanPage: FANS_PAGE,
  postId: string,
  setCurLiveVideo: (liveVideo: LIVE_VIDEO | "not_found") => void,
  paging: PAGING | undefined = undefined
) => {
  await getFbLiveVideos(
    fanPage,
    (res: LIVE_VIDEOS_RESPONSE) => {
      const { data, paging } = res;
      let curVideo: LIVE_VIDEO | undefined;
      if (data.length) {
        curVideo = data.find((item: any) => {
          return item.video.id === postId;
        });
        curVideo && setCurLiveVideo(curVideo);
      }
      if (paging?.cursors?.after && curVideo === undefined) {
        getAllLiveVideos(fanPage, postId, setCurLiveVideo, paging);
      } else if (curVideo === undefined) {
        setCurLiveVideo("not_found");
      }
    },
    paging?.cursors?.after
  );
};

export const getLiveVideoAsync = createAsyncThunk(
  "liveRoom/fetchLiveVideo",
  async (params: { fanPage: FANS_PAGE; postId: string }) => {
    const curVideo: LIVE_VIDEO | null | "not_found" = await new Promise<
      LIVE_VIDEO | null | "not_found"
    >((resolve) => {
      const onFetchVideoSuccess = (res: LIVE_VIDEO | "not_found") => {
        resolve(res);
      };
      const { fanPage, postId } = params;
      getAllLiveVideos(fanPage, postId, onFetchVideoSuccess);
    });
    return curVideo;
  }
);

const getLiveVideos = async (
  fanPage: FANS_PAGE,
  postId: string,
  setCurLiveVideos: (liveVideos: LIVE_VIDEO[]) => void,
  liveVideos: LIVE_VIDEO[] = [],
  paging: PAGING | undefined = undefined
) => {
  await getFbLiveVideos(
    fanPage,
    (res: LIVE_VIDEOS_RESPONSE) => {
      const { data, paging } = res;

      if (data?.length) {
        const curLiveVideos = data.filter((video) => video.status === "LIVE");
        liveVideos = [...liveVideos, ...curLiveVideos];
      }
      if (paging === undefined) {
        setCurLiveVideos(liveVideos);
      }

      if (paging?.cursors?.after) {
        getLiveVideos(fanPage, postId, setCurLiveVideos, liveVideos, paging);
      }
    },
    paging?.cursors?.after
  );
};

export const getLiveVideosAsync = createAsyncThunk(
  "liveRoom/fetchLiveVideos",
  async (params: { fanPage: FANS_PAGE; postId: string }) => {
    const liveVideos: LIVE_VIDEO[] = await new Promise<LIVE_VIDEO[]>(
      (resolve) => {
        const onFetchVideoSuccess = (res: LIVE_VIDEO[]) => {
          resolve(res);
        };
        const { fanPage, postId } = params;
        getLiveVideos(fanPage, postId, onFetchVideoSuccess);
      }
    );
    return liveVideos;
  }
);

export const getVideoAsync = createAsyncThunk(
  "liveRoom/fetchVideo",
  async (params: { fanPage: FANS_PAGE; postId: string }) => {
    const { fanPage, postId } = params;

    const videoId: string = await new Promise<string>((resolve) => {
      getPostInfo(postId, fanPage.access_token, (res: FANS_POST) => {
        if (res.error) {
          resolve("not_found");
          return;
        }
        const curAttachment = res.attachments.data.find(
          (attachment: ATTACHMENT) =>
            attachment.type === "video_direct_response_autoplay" ||
            attachment.type === "video_autoplay" ||
            attachment.type === "video_inline" ||
            attachment.type === "video_direct_response"
        );
        if (curAttachment) {
          resolve(curAttachment.target.id);
        } else {
          resolve("");
        }
      });
    });

    if (videoId === "not_found") {
      return "not_found";
    }

    if (videoId !== "") {
      const curVideo: VIDEO | null | "not_found" = await new Promise<
        VIDEO | null | "not_found"
      >((resolve) => {
        const onFetchVideoSuccess = (res: VIDEO | "not_found") => {
          resolve(res);
        };
        getLiveVideoDetail(fanPage.access_token, videoId, onFetchVideoSuccess);
      });
      return curVideo;
    } else {
      return null;
    }
  }
);

const getAllGroupLiveVideos = async (
  group: string,
  postId: string,
  accessToken: string,
  setCurLiveVideo: (liveVideo: LIVE_VIDEO | "not_found") => void,
  paging: PAGING | undefined = undefined
) => {
  await getGroupLiveVideos(
    group,
    accessToken,
    (res: LIVE_VIDEOS_RESPONSE) => {
      const { data, paging } = res;
      let curVideo: LIVE_VIDEO | undefined;
      if (data.length) {
        curVideo = data.find((item: any) => {
          return item.video.id === postId;
        });
        curVideo && setCurLiveVideo(curVideo);
      }
      if (paging?.cursors?.after && curVideo === undefined) {
        getAllGroupLiveVideos(
          group,
          postId,
          accessToken,
          setCurLiveVideo,
          paging
        );
      } else if (curVideo === undefined) {
        setCurLiveVideo("not_found");
      }
    },
    paging?.cursors?.after
  );
};

export const getLiveGroupVideoAsync = createAsyncThunk(
  "liveRoom/fetchGroupLiveVideo",
  async (params: { groupId: string; accessToken: string; postId: string }) => {
    const { groupId, accessToken, postId } = params;
    const curVideo: LIVE_VIDEO | null | "not_found" = await new Promise<
      LIVE_VIDEO | null | "not_found"
    >((resolve) => {
      const onFetchVideoSuccess = (res: LIVE_VIDEO | "not_found") => {
        resolve(res);
      };
      getAllGroupLiveVideos(groupId, postId, accessToken, onFetchVideoSuccess);
    });
    return curVideo;
  }
);

export const getProdsAsync = createAsyncThunk(
  "liveRoom/fetchProducts",
  async (params: {
    urlProd: string;
    urlNicknames: string;
    activityId: string;
    postId: string;
  }) => {
    const { urlProd, urlNicknames, activityId, postId } = params;
    const curProds = await fetchProdList(urlProd, activityId, "post", postId);
    const curNickNames = await fetchNickNames(
      urlNicknames,
      activityId,
      postId,
      curProds.map((item: any) => item.id).join(",")
    );

    curNickNames.forEach((nicknameItem: any) => {
      const curIndex = curProds.findIndex(
        (item: any) => item.id === nicknameItem.id
      );
      if (curIndex !== -1) {
        curProds[curIndex].nicknames = nicknameItem.nicknames || [];
        curProds[curIndex].colors = nicknameItem.variants.colors || [];
        curProds[curIndex].sizes = nicknameItem.variants.sizes || [];
      }
    });
    curProds.sort((a: PRODUCT, b: PRODUCT) => {
      return (b?.sort_key || 0) - (a?.sort_key || 0);
    });
    return curProds;
  }
);

export const getActivityProdsAsync = createAsyncThunk(
  "liveRoom/fetchActivityProducts",
  async (params: { urlProd: string; activityId: string }) => {
    const { urlProd, activityId } = params;
    const curProds = await fetchProdList(urlProd, activityId, "activity");
    return curProds;
  }
);

const getAllShopProducts = async (
  url: string,
  onSuccess: (products: PRODUCT[]) => void,
  offsets: number = 0,
  curProds: PRODUCT[]
) => {
  const newProps: PRODUCT[] = await getShopProducts(url, offsets, 1000);
  if (newProps) {
    if (newProps?.length) {
      curProds = [...curProds, ...newProps];
      getAllShopProducts(url, onSuccess, curProds.length, curProds);
    } else {
      onSuccess(curProds);
    }
  }
};

export const getShopProductsAsync = createAsyncThunk(
  "liveRoom/fetchShopProducts",
  async (params: { url: string }) => {
    const { url } = params;
    const curProds = await new Promise<PRODUCT[]>((resolve) => {
      const onFetchShopProductsSuccess = (res: PRODUCT[]) => {
        return resolve(res);
      };
      getAllShopProducts(url, onFetchShopProductsSuccess, 0, []);
    });
    return curProds;
  }
);

export const getCommentsAsync = createAsyncThunk(
  "liveRoom/fetchComments",
  async (params: {
    isLiveVideo: boolean;
    accessToken: string;
    postId: string;
  }) => {
    const curComments = await new Promise<FANS_POST_COMMENT[]>((resolve) => {
      const onFetchCommentsSuccess = (res: FANS_POST_COMMENT[]) => {
        return resolve(res);
      };
      getAllComments(
        params.isLiveVideo,
        params.accessToken,
        params.postId,
        onFetchCommentsSuccess
      );
    });
    return curComments;
  }
);

export const getNewCommentsAsync = createAsyncThunk(
  "liveRoom/fetchNewComments",
  async (params: {
    isLiveVideo: boolean;
    accessToken: string;
    postId: string;
    onResult: Function;
    curPaging?: PAGING | undefined;
  }) => {
    const { isLiveVideo, postId, accessToken, curPaging, onResult } = params;
    const curResult = await new Promise<FANS_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: FANS_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        const commentService = isLiveVideo
          ? getLiveVideoComments
          : getFansPostComments;
        commentService(
          accessToken,
          postId,
          onFetchCommentsSuccess,
          curPaging?.cursors?.after
        );
      }
    );
    onResult(curResult);
    if (curResult?.data) {
      return curResult?.data;
    }
  }
);

export const getGroupCommentsAsync = createAsyncThunk(
  "liveRoom/fetchGroupComments",
  async (params: { accessToken: string; videoId: string }) => {
    const curComments = await new Promise<FANS_POST_COMMENT[]>((resolve) => {
      const onFetchCommentsSuccess = (res: FANS_POST_COMMENT[]) => {
        return resolve(res);
      };
      getAllComments(
        false,
        params.accessToken,
        params.videoId,
        onFetchCommentsSuccess
      );
    });
    return curComments;
  }
);

export const getNewGroupCommentsAsync = createAsyncThunk(
  "liveRoom/fetchNewGroupComments",
  async (params: {
    accessToken: string;
    videoId: string;
    onResult: Function;
    curPaging?: PAGING | undefined;
  }) => {
    const { accessToken, videoId, onResult, curPaging } = params;
    const curResult = await new Promise<FANS_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: FANS_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        const commentService = getFansPostComments;
        commentService(
          accessToken,
          videoId,
          onFetchCommentsSuccess,
          curPaging?.cursors?.after
        );
      }
    );
    onResult(curResult);
    if (curResult?.data) {
      return curResult?.data;
    }
  }
);

export const getCommentAsync = createAsyncThunk(
  "liveRoom/fetchComment",
  async (params: { accessToken: string; commentId: string }, thunkAPI) => {
    const { commentId, accessToken } = params;
    const state: any = thunkAPI.getState();
    if (
      Array.isArray(state?.liveRoom?.comments) &&
      !state?.liveRoom?.comments.find(
        (comment: any) => comment.id.toString() === commentId
      )
    ) {
      const curComment = await new Promise<FANS_POST_COMMENT>((resolve) => {
        const onFetchCommentSuccess = (res: any) => {
          resolve(res);
        };
        getFansPostComment(accessToken, commentId, onFetchCommentSuccess);
      });
      return curComment;
    } else {
      return null;
    }
  }
);

export const getIgCommentsAsync = createAsyncThunk(
  "liveRoom/fetchIgComments",
  async (params: { accessToken: string; livePostId: string }) => {
    const curComments = await new Promise<IG_MEDIA_COMMENT[]>((resolve) => {
      const onFetchCommentsSuccess = (res: IG_MEDIA_COMMENT[]) => {
        return resolve(res);
      };
      getAllIgComments(
        params.accessToken,
        params.livePostId,
        onFetchCommentsSuccess
      );
    });
    return curComments;
  }
);

export const getNewIgCommentsAsync = createAsyncThunk(
  "liveRoom/fetchNewIgComments",
  async (params: {
    accessToken: string;
    livePostId: string;
    onResult?: Function;
    curPaging?: PAGING | undefined;
  }) => {
    const { livePostId, accessToken, curPaging, onResult } = params;
    const curResult = await new Promise<IG_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: IG_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        getIgComments(
          accessToken,
          livePostId,
          onFetchCommentsSuccess,
          curPaging?.cursors?.after
        );
      }
    );

    onResult && onResult(curResult);

    if (curResult?.data) {
      return curResult?.data;
    } else {
      return [];
    }
  }
);

export const setCommentAsync = createAsyncThunk(
  "liveRoom/sendComment",
  async (params: {
    accessToken: string;
    postId: string;
    comment: string;
    onSuccess: Function;
  }) => {
    const curComment = await new Promise<FANS_POST_COMMENT>((resolve) => {
      const onSendCommentSuccess = (res: FANS_POST_COMMENT) => {
        resolve(res);
      };
      const { postId, accessToken, comment } = params;
      sendFBPostComment(accessToken, postId, comment, onSendCommentSuccess);
    });
    params.onSuccess(curComment);

    return curComment;
  }
);

export const replyCommentAsync = createAsyncThunk(
  "liveRoom/replyComment",
  async (params: {
    accessToken: string;
    postId: string;
    comment: string;
    onSuccess: Function;
  }) => {
    const curComment: FANS_POST_COMMENT = await new Promise<FANS_POST_COMMENT>(
      (resolve) => {
        const onSendCommentSuccess = (res: FANS_POST_COMMENT) => {
          resolve(res);
        };
        const { postId, accessToken, comment } = params;
        sendFBPostComment(accessToken, postId, comment, onSendCommentSuccess);
      }
    );
    params.onSuccess(curComment);
    return curComment;
  }
);

export const deleteCommentAsync = createAsyncThunk(
  "liveRoom/deleteComment",
  async (params: {
    accessToken: string;
    comment: FANS_POST_COMMENT;
    onSuccess: Function;
    level: number;
  }) => {
    const curComment: {
      commentId: string;
    } = await new Promise<{
      commentId: string;
    }>((resolve) => {
      const onDeleteCommentSuccess = (res: { commentId: string }) => {
        resolve(res);
      };
      const { comment, accessToken } = params;
      deleteFBPostComment(accessToken, comment.id, onDeleteCommentSuccess);
    });
    params.onSuccess(curComment);
    return {
      level: params.level === 0 ? "first_level" : "second_level",
      comment: params.comment,
    };
  }
);

export const deleteIgCommentAsync = createAsyncThunk(
  "liveRoom/deleteIgComment",
  async (params: {
    accessToken: string;
    comment: IG_MEDIA_COMMENT;
    onSuccess: Function;
  }) => {
    const curComment: {
      commentId: string;
    } = await new Promise<{
      commentId: string;
    }>((resolve) => {
      const onDeleteCommentSuccess = (res: { commentId: string }) => {
        resolve(res);
      };
      const { comment, accessToken } = params;
      deleteFBPostComment(accessToken, comment.id, onDeleteCommentSuccess);
    });
    params.onSuccess(curComment);
    // return {
    //   level: params.level === 0 ? "first_level" : "second_level",
    //   comment: params.comment,
    // };
  }
);

const getAllComments = async (
  isLiveVideo: boolean,
  accessToken: string,
  postId: string,
  onResult: Function,
  curPaging: PAGING | undefined = undefined,
  curComments: FANS_POST_COMMENT[] = []
) => {
  const curResult = await new Promise<FANS_POST_COMMENTS_RESPONSE>(
    (resolve) => {
      const onFetchCommentsSuccess = (res: FANS_POST_COMMENTS_RESPONSE) => {
        resolve(res);
      };
      const commentService = isLiveVideo
        ? getLiveVideoComments
        : getFansPostComments;
      commentService(
        accessToken,
        postId,
        onFetchCommentsSuccess,
        curPaging?.cursors?.after
      );
    }
  );
  const { data, paging } = curResult;
  if (data?.length) {
    curComments = [...curComments, ...data];
  }
  if (paging === undefined) {
    onResult(curComments);
  }
  if (paging?.cursors?.after) {
    await getAllComments(
      isLiveVideo,
      accessToken,
      postId,
      onResult,
      paging,
      curComments
    );
  }
};

const getAllIgComments = async (
  accessToken: string,
  livePostId: string,
  onResult: Function,
  curPaging: PAGING | undefined = undefined,
  curComments: IG_MEDIA_COMMENT[] = []
) => {
  const curResult = await new Promise<IG_POST_COMMENTS_RESPONSE>((resolve) => {
    const onFetchCommentsSuccess = (res: IG_POST_COMMENTS_RESPONSE) => {
      resolve(res);
    };
    getIgComments(
      accessToken,
      livePostId,
      onFetchCommentsSuccess,
      curPaging?.cursors?.after
    );
  });
  const { data, paging } = curResult;
  if (data?.length) {
    curComments = [...curComments, ...data];
  }
  if (paging === undefined) {
    onResult(curComments.reverse());
  }
  if (paging?.cursors?.after) {
    await getAllIgComments(
      accessToken,
      livePostId,
      onResult,
      paging,
      curComments
    );
  }
};

export const setIgCommentAsync = createAsyncThunk(
  "liveRoom/sendIgComment",
  async (params: {
    accessToken: string;
    postId: string;
    comment: string;
    onSuccess: Function;
  }) => {
    const curComment = await new Promise<FANS_POST_COMMENT>((resolve) => {
      const onSendCommentSuccess = (res: FANS_POST_COMMENT) => {
        resolve(res);
      };
      const { postId, accessToken, comment } = params;
      sendIGPostComment(accessToken, postId, comment, onSendCommentSuccess);
    });
    params.onSuccess(curComment);
    return curComment;
  }
);

export const getActivityAsync = createAsyncThunk(
  "liveRoom/fetchActivity",
  async (params: {
    urlActivity: string;
    urlDispatch: string;
    activityId: string;
    postId: string;
  }) => {
    const { urlActivity, urlDispatch, activityId, postId } = params;
    const res = await Promise.all([
      fetchActivity(urlActivity, activityId),
      fetchDispatch(urlDispatch, postId),
    ]);
    // mock for test
    // let curActivity: ACTIVITY | null | any = null;
    // if (res[0]) {
    //   curActivity = res[0];
    // }
    // if (curActivity && res[1]) {
    //   const curDispatch: any = res[1];
    //   curDispatch.platform = "instgram";
    //   curDispatch.fb_fanspage_id = "108593835632709";
    //   curDispatch.fb_post_id = "17989835783129827";
    //   curActivity["dispatch"] = curDispatch;
    // }
    let curActivity: ACTIVITY | null = null;
    if (res[0]) {
      curActivity = res[0];
    }
    if (curActivity && res[1]) {
      curActivity["dispatch"] = res[1];
    }

    return curActivity;
  }
);

export const deleteProductAsync = createAsyncThunk(
  "liveRoom/deleteProduct",
  async (params: {
    url: string;
    activityId: string;
    postId: string;
    prodId: string;
    onSuccess: Function;
  }) => {
    const { url, postId, activityId, prodId, onSuccess } = params;
    const deletedProd: DELETE_PRODUCT_DATA[] | null = await deleteProduct(
      url,
      activityId,
      postId,
      prodId
    );
    onSuccess(deletedProd);
    return deletedProd;
  }
);

export const addCurProductAsync = createAsyncThunk(
  "liveRoom/addCurProduct",
  async (params: {
    url: string;
    activityId: string;
    postId: string;
    prodIds: string;
    onSuccess: Function;
  }) => {
    const { url, postId, activityId, prodIds, onSuccess } = params;
    const addedProd = await addCurProduct(url, activityId, postId, prodIds);
    onSuccess(addedProd);
    return addedProd;
  }
);

export const getIgMediaAsync = createAsyncThunk(
  "liveRoom/getIgMediaAsync",
  async (params: { postId: string; accessToken: string }) => {
    const curMedia = await new Promise<any>((resolve) => {
      const onFetchPostSuccess = (res: IG_MEDIA) => {
        resolve(res);
      };
      const { postId, accessToken } = params;
      getIgMediaInfo(accessToken, postId, onFetchPostSuccess);
    });
    return curMedia.error ? "not_live" : curMedia;
  }
);

export const editKeywordsAsync = createAsyncThunk(
  "liveRoom/editProdKeywords",
  async (params: {
    url: string;
    activityId: string;
    postId: string;
    productId: string;
    nicknames: string[];
    onSuccess: Function;
  }) => {
    const { url, postId, activityId, productId, nicknames, onSuccess } = params;
    const editKeyword = await editProdKeyword(
      url,
      activityId,
      postId,
      productId,
      nicknames
    );
    onSuccess(editKeyword);
    return editKeyword;
  }
);

export const updateProductAsync = createAsyncThunk(
  "liveRoom/updateProduct",
  async (params: { url: string; productId: string; onSuccess: Function }) => {
    const { url, productId, onSuccess } = params;
    const updatedProduct = await updateProduct(url, productId);
    onSuccess(updatedProduct);
    return updatedProduct;
  }
);

export const editVariantsKeywordsAsync = createAsyncThunk(
  "liveRoom/editVariantsKeywords",
  async (params: {
    url: string;
    activityId: string;
    postId: string;
    productId: string;
    type: "color" | "size";
    variantValue: string;
    nicknames: string[];
    onSuccess: Function;
    urlNicknames: string;
  }) => {
    const {
      url,
      postId,
      activityId,
      productId,
      type,
      variantValue,
      nicknames,
      onSuccess,
      urlNicknames,
    } = params;
    const editKeyword = await editVariantsKeywords(
      url,
      activityId,
      postId,
      productId,
      type,
      variantValue,
      nicknames
    );
    onSuccess(editKeyword);
    const curNickNames = await fetchNickNames(
      urlNicknames,
      activityId,
      postId,
      productId
    );
    return curNickNames;
  }
);

export const getActivityPostsAsync = createAsyncThunk(
  "liveRoom/fetchActivityPosts",
  async (params: {
    urlActivityPosts: string;
    activityId: string;
    accessToken: string;
    onSuccess: Function;
  }) => {
    const { urlActivityPosts, activityId, accessToken, onSuccess } = params;
    let curActivityPosts: ACTIVITY_POST[] = await getActivityPosts(
      urlActivityPosts,
      activityId
    );
    curActivityPosts = curActivityPosts.filter(
      (post) =>
        post.fanspage !== null || post.instagram_business_account !== null
    );
    const promiseActions: any[] = [];
    curActivityPosts.forEach((post) => {
      if (post.fanspage) {
        promiseActions.push(
          new Promise<any>((resolve) => {
            const onFetchPostSuccess = (res: any) => {
              resolve(res);
            };
            getPostInfo(
              post.post.fb_post_id as string,
              accessToken,
              (info: any) => {
                onFetchPostSuccess(
                  Object.assign({}, post, {
                    detail: Object.prototype.hasOwnProperty.call(info, "error")
                      ? null
                      : info,
                  })
                );
              }
            );
          })
        );
      }
    });
    const res = await Promise.all(promiseActions);
    onSuccess();
    return res && res.length ? res.filter((post) => post.detail) : [];
  }
);

export const getMemberAsync = createAsyncThunk(
  "liveRoom/getMembers",
  async (params: { url: string; userIds: string; detailUrl: string }) => {
    const { url, userIds, detailUrl } = params;
    let memberList: MEMBER_INFO[] = [];
    await checkIsMemberComment(url, userIds).then((res) => (memberList = res));
    let memberIds: string = "";
    memberList.forEach((member) => {
      if (member.is_member) {
        if (memberIds === "") {
          memberIds = member.user_id;
        } else {
          memberIds += `,${member.user_id}`;
        }
      }
    });
    if (memberIds !== "") {
      const details: MEMBER_DATA[] = await getMemberDetail(
        detailUrl,
        memberIds
      );
      details.forEach((detail) => {
        const detailIndex = memberList.findIndex(
          (member) => member.user_id === detail.user_id
        );
        if (detailIndex !== -1) {
          memberList[detailIndex].data = detail;
        }
      });
    }
    return memberList;
  }
);

export const enableActivityAsync = createAsyncThunk(
  "liveRoom/enableActivity",
  async (params: {
    url: string;
    activityId: string;
    isEnable: boolean;
    onSuccess: Function;
  }) => {
    const { url, activityId, isEnable, onSuccess } = params;
    const res = await setEnableActivity(url, activityId, isEnable);
    res["action"] = isEnable ? "enable" : "disable";
    onSuccess(res);
    return res;
  }
);

export const getPostActionsAsync = createAsyncThunk(
  "liveRoom/getPostActions",
  async (params: { url: string; activityId: string; postId: string }) => {
    const { url, activityId, postId } = params;
    const res: POST_ACTION[] = await getPostAction(url, activityId, postId);
    return res;
  }
);

const getAllCategory = (
  source: PRODUCT_CATEGORY[],
  res: PRODUCT_CATEGORY[] = []
) => {
  source.forEach((category) => {
    res.push({ title: category.title, id: category.id });
    if (category?.children?.length) {
      getAllCategory(category.children, res);
    }
  });
};

export const getProductCategoriesAsync = createAsyncThunk(
  "liveRoom/fetchProductCategories",
  async (params: { url: string }) => {
    const { url } = params;
    const res = await getProductCategories(url);
    const refactorCategorty: PRODUCT_CATEGORY[] = [];
    getAllCategory(res, refactorCategorty);
    return refactorCategorty;
  }
);

export const editCommentAsync = createAsyncThunk(
  "liveRoom/editComment",
  async (params: {
    accessToken: string;
    commentId: string;
    message: string;
    onSuccess: Function;
  }) => {
    const { accessToken, message, onSuccess, commentId } = params;
    await editFBComment(accessToken, commentId, message, onSuccess);
    return { commentId: commentId, message: message };
  }
);

const getCurGroup = async (
  accessToken: string,
  groupId: string,
  postId: string,
  onSuccess: Function,
  url?: string
) => {
  await getGroupPosts(
    accessToken,
    groupId,
    (res: GROUP_POST_RESPONSE) => {
      const data = res.data;
      if (data) {
        const curPost = data.find((item) => item.id === postId);
        if (curPost) {
          onSuccess(curPost);
        } else {
          if (res?.paging?.next) {
            getCurGroup(
              accessToken,
              groupId,
              postId,
              onSuccess,
              res?.paging?.next
            );
          } else {
            return onSuccess(null);
          }
        }
      }
    },
    url
  );
};

export const getGroupPostsAsync = createAsyncThunk(
  "liveRoom/getGroupPosts",
  async (params: { accessToken: string; groupId: string; postId: string }) => {
    const { groupId, postId, accessToken } = params;
    const post: GROUP_POST | null = await new Promise<any>((resolve) => {
      getCurGroup(accessToken, groupId, postId, (res: any) => {
        resolve(res);
      });
    });
    const curVideo: LIVE_VIDEO | null | "not_found" = await new Promise<
      LIVE_VIDEO | null | "not_found"
    >((resolve) => {
      if (post) {
        const onFetchVideoSuccess = (res: LIVE_VIDEO | "not_found") => {
          resolve(res);
        };
        getAllGroupLiveVideos(
          groupId,
          post?.object_id as string,
          accessToken,
          onFetchVideoSuccess
        );
      } else {
        resolve("not_found");
      }
    });
    return curVideo;
  }
);

export const postBindMemberAsync = createAsyncThunk(
  "liveRoom/postBindMember",
  async (params: {
    url: string;
    detailUrl: string;
    userId: string;
    email: string;
    onSuccess: Function;
  }) => {
    const { url, detailUrl, userId, email, onSuccess } = params;
    const res: { success: boolean; error?: string } = await bindMember(
      url,
      userId,
      email
    );
    if (res.success) {
      const details: MEMBER_DATA[] = await getMemberDetail(detailUrl, userId);
      onSuccess(res);
      return details;
    } else {
      onSuccess(res);
    }
  }
);

export const getDiscountAsync = createAsyncThunk(
  "liveRoom/getDiscount",
  async (params: { url: string; activityId: string; postId: string }) => {
    const { url, activityId, postId } = params;
    const res: { success: boolean; data: DISCOUNT } =
      await getActivityPostDiscount(url, activityId, postId);
    if (res.success) {
      return res.data;
    }
  }
);

export const liveRoomSlice = createSlice({
  name: "liveRoom",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setFansPage: (state, action: PayloadAction<FANS_PAGE>) => {
      state.fansPage = action.payload;
    },
    setProducts: (state, action: PayloadAction<FANS_PAGE>) => {
      state.fansPage = action.payload;
    },
    addNewShopProductToShopProducts: (
      state,
      action: PayloadAction<PRODUCT>
    ) => {
      if (state.shopProducts === null) {
        state.shopProducts = [action.payload];
        return;
      }
      state.shopProducts = [action.payload, ...state.shopProducts];
    },
    clearFansPage: (state) => {
      state = initialState;
    },
    setOrder: (state, action: PayloadAction<any>) => {
      state.order = action.payload;
    },
    setOrderNew: (state, action: PayloadAction<string>) => {
      if (action.payload === "") {
        state.orderNew = null;
      } else {
        state.orderNew = action.payload;
      }
    },
    clearComments: (state) => {
      state.comments = null;
      state.igComments = null;
    },
    setDiscount: (state, action: PayloadAction<DISCOUNT>) => {
      state.discount = action.payload;
    },
    setIsLiveBoradcastMode: (state, action: PayloadAction<boolean>) => {
      state.isLiveBoradcastMode = action.payload;
    },
    updateFbLiveStreamingStatus: (
      state,
      action: PayloadAction<"facebook.page" | "facebook.group">
    ) => {
      if (action.payload === "facebook.page") {
        const latestVideo = state.video;
        if (latestVideo && latestVideo !== "not_found") {
          latestVideo.live_status = "VOD";
          state.video = latestVideo;
        }
      } else if (action.payload === "facebook.group") {
        const latestVideo = state.liveVideo;
        if (latestVideo && latestVideo !== "not_found") {
          latestVideo.status = "VOD";
          state.liveVideo = latestVideo;
        }
      }
    },
    setIsPrepared: (state, action: PayloadAction<boolean>) => {
      state.isPrepared = action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(getFansPageAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getFansPageAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.fansPage = action.payload;
      })
      .addCase(getFansPageAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getNewFansPageAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNewFansPageAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          state.fansPage = action.payload;
        }
      })
      .addCase(getNewFansPageAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getPostAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPostAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.post = action.payload;
      })
      .addCase(getPostAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getLiveVideoAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLiveVideoAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.liveVideo = action.payload;
      })
      .addCase(getLiveVideoAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getLiveGroupVideoAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLiveGroupVideoAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.liveVideo = action.payload;
      })
      .addCase(getLiveGroupVideoAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getGroupPostsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getGroupPostsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.liveVideo = action.payload;
      })
      .addCase(getGroupPostsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getProdsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProdsAsync.fulfilled, (state, action) => {
        state.status = "idle";

        if (state.orderNew) {
          const arrOrder: any[] = JSON.parse(state.orderNew);
          for (let i = 0; i < action.payload.length; i++) {
            const product = action.payload[i];
            if (
              arrOrder.find(
                (item: any) => !item[0].toString().includes(product.sn)
              )
            ) {
              arrOrder.push([product.sn, product]);
            } else {
              continue;
            }
          }
          state.orderNew = JSON.stringify(arrOrder);
        }
        state.products = action.payload;
      })
      .addCase(getProdsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activity = action.payload;
      })
      .addCase(getActivityAsync.rejected, (state) => {
        state.status = "failed";
      })
      // .addCase(getCommentsAsync.pending, (state) => {
      //   state.status = "loading";
      // })
      // .addCase(getCommentsAsync.fulfilled, (state, action) => {
      //   state.status = "idle";
      //   state.comments = action.payload;
      // })
      // .addCase(getCommentsAsync.rejected, (state) => {
      //   state.status = "failed";
      // })
      .addCase(getNewCommentsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNewCommentsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        let newComments: FANS_POST_COMMENT[] = state.comments;
        if (action.payload) {
          if (!newComments) {
            newComments = action.payload;
          } else {
            newComments = [...newComments, ...action.payload];
          }
          let hasNewReply = false;
          const uniqueCommentsItem: FANS_POST_COMMENT[] = [];
          const seenIds = new Set();
          newComments.forEach((item) => {
            if (seenIds.has(item.id)) {
              const arrIndex = uniqueCommentsItem.findIndex(
                (element) => element.id === item.id
              );
              if (arrIndex !== -1) {
                const curLength =
                  uniqueCommentsItem[arrIndex]?.comments?.data?.length || 0;
                const itemLength = item?.comments?.data?.length || 0;
                if (itemLength > curLength) {
                  uniqueCommentsItem[arrIndex] = item;
                  hasNewReply = true;
                }
              }
            } else {
              seenIds.add(item.id);
              uniqueCommentsItem.push(item);
            }
          });
          if (
            !state.comments ||
            state.comments.length !== uniqueCommentsItem.length ||
            hasNewReply
          ) {
            state.comments = uniqueCommentsItem;
          }
        }
      })
      .addCase(getNewCommentsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getGroupCommentsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getGroupCommentsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.comments = action.payload;
      })
      .addCase(getGroupCommentsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getNewGroupCommentsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNewGroupCommentsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        let newComments: FANS_POST_COMMENT[] = state.comments;
        if (action.payload) {
          if (!newComments) {
            newComments = action.payload;
          } else {
            newComments = [...newComments, ...action.payload];
          }
          let hasNewReply = false;
          const uniqueCommentsItem: FANS_POST_COMMENT[] = [];
          const seenIds = new Set();
          newComments.forEach((item) => {
            if (seenIds.has(item.id)) {
              const arrIndex = uniqueCommentsItem.findIndex(
                (element) => element.id === item.id
              );
              if (arrIndex !== -1) {
                const curLength =
                  uniqueCommentsItem[arrIndex]?.comments?.data?.length || 0;
                const itemLength = item?.comments?.data?.length || 0;
                if (itemLength > curLength) {
                  uniqueCommentsItem[arrIndex] = item;
                  hasNewReply = true;
                }
              }
            } else {
              seenIds.add(item.id);
              uniqueCommentsItem.push(item);
            }
          });
          if (
            !state.comments ||
            state.comments.length !== uniqueCommentsItem.length ||
            hasNewReply
          ) {
            state.comments = uniqueCommentsItem;
          }
        }
      })
      .addCase(getNewGroupCommentsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCommentAsync.fulfilled, (state, action) => {
        state.status = "idle";
        let newComments: FANS_POST_COMMENT[] = state.comments;
        if (action.payload) {
          if (Object.prototype.hasOwnProperty.call(action.payload, "parent")) {
            const index = newComments.findIndex(
              (comment) => comment.id === action.payload?.parent?.id
            );
            if (index !== -1) {
              const curComment: FANS_POST_COMMENT = newComments[index];
              if (!curComment.comments) {
                const arr: FANS_POST_COMMENT[] = [];
                arr.push(action.payload);
                curComment.comments = { data: arr };
              } else {
                curComment.comments.data.push(action.payload);
              }
              newComments[index] = curComment;
            }
          } else {
            if (!newComments || !newComments.length) {
              newComments = [];
              newComments.push(action.payload);
            } else {
              newComments.push(action.payload);
            }
          }
          state.comments = newComments;
        }
      })
      .addCase(getCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(setCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setCommentAsync.fulfilled, (state, action) => {
        if (
          state.video &&
          state.video !== "not_found" &&
          state.video?.live_status !== "LIVE"
        ) {
          const newComments = [...state.comments, action.payload];
          state.comments = newComments;
        }
        state.status = "idle";
      })
      .addCase(setCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload && state.products) {
          let newProducts = state.products;
          const res: DELETE_PRODUCT_DATA[] = action.payload;
          for (let i = 0; i < res.length; i++) {
            const deletedProd: { id: string; success: boolean } = res[i];
            if (deletedProd.success) {
              newProducts = newProducts?.filter(
                (product) => product.id !== deletedProd.id
              );
            }
          }
          state.products = newProducts;
        }
      })
      .addCase(deleteProductAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(replyCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(replyCommentAsync.fulfilled, (state, action) => {
        if (
          state.video &&
          state.video !== "not_found" &&
          state.video?.live_status !== "LIVE"
        ) {
          const replyParentId = action.payload.parent?.id;
          const newComments = [...state.comments];
          const index = newComments.findIndex(
            (comment) => comment.id === replyParentId
          );
          if (newComments[index].comments) {
            newComments[index].comments?.data.push(action.payload);
          } else {
            newComments[index].comments = { data: [action.payload] };
          }
          state.comments = newComments;
        }
        state.status = "idle";
      })
      .addCase(replyCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(editKeywordsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editKeywordsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload && state.products) {
          let newProducts = state.products;
          const editProd: { id: string; nicknames: string[] } =
            action.payload[0];

          if (state.orderNew) {
            const updatedKeyOrder = JSON.parse(state.orderNew as string);
            const curIndex = updatedKeyOrder.findIndex(
              (item: any) => item[1].id === editProd.id
            );
            if (curIndex !== -1) {
              updatedKeyOrder[curIndex][0] = [
                ...(editProd.nicknames || []),
                updatedKeyOrder[curIndex][1].sn,
              ].toString();
              state.orderNew = JSON.stringify(updatedKeyOrder);
            }
          }

          state.products = newProducts?.map((product) => {
            if (product.id === editProd.id) {
              product.nicknames = editProd.nicknames;
            }

            return product;
          });
        }
      })
      .addCase(editKeywordsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload && state.products) {
          let newProducts = state.products;
          const editProd = action.payload;
          state.products = newProducts?.map((product) => {
            if (product.id === editProd.id) {
              return editProd;
            }
            return product;
          });
        }
      })
      .addCase(updateProductAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityProdsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityProdsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityProducts = action.payload;
      })
      .addCase(getActivityProdsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addCurProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCurProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(addCurProductAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCommentAsync.fulfilled, (state, action) => {
        state.status = "idle";
        let newComments: FANS_POST_COMMENT[] = state.comments;
        if (action.payload.level === "first_level") {
          state.comments = newComments.filter(
            (comment) => comment.id !== action.payload.comment.id
          );
        } else {
          const index = newComments.findIndex(
            (comment) => comment.id === action.payload.comment.parent?.id
          );
          if (index !== -1) {
            const curComment: FANS_POST_COMMENT = newComments[index];
            const data = curComment.comments?.data.filter(
              (comment) => comment.id !== action.payload.comment.id
            );
            curComment.comments = { data: data as FANS_POST_COMMENT[] };
            newComments[index] = curComment;
            state.comments = newComments;
          }
        }
      })
      .addCase(deleteCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityPostsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityPostsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityPosts = action.payload;
      })
      .addCase(getActivityPostsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getIgMediaAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getIgMediaAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (!state.igMediaInfo) {
          state.igMediaInfo = action.payload;
        }
        state.igMediaUrl = action.payload?.media_url;
      })
      .addCase(getIgMediaAsync.rejected, (state) => {
        state.status = "failed";
      })
      // .addCase(getIgCommentsAsync.pending, (state) => {
      //   state.status = "loading";
      // })
      // .addCase(getIgCommentsAsync.fulfilled, (state, action) => {
      //   state.status = "idle";
      //   if (
      //     !state.igComments ||
      //     state.igComments.length !== action.payload.length
      //   ) {
      //     state.igComments = action.payload;
      //   }
      // })
      // .addCase(getIgCommentsAsync.rejected, (state) => {
      //   state.status = "failed";
      // })
      .addCase(getNewIgCommentsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getNewIgCommentsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          let newComments: IG_MEDIA_COMMENT[] = state.igComments;
          if (action.payload) {
            if (!newComments) {
              newComments = action.payload;
            } else {
              newComments = [...newComments, ...action.payload];
            }

            const uniqueCommentsItem: IG_MEDIA_COMMENT[] = [];
            const seenIds = new Set();
            newComments.forEach((item) => {
              if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueCommentsItem.push(item);
              }
            });
            if (
              !state.igComments ||
              state.igComments.length !== uniqueCommentsItem.length
            ) {
              state.igComments = uniqueCommentsItem.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );
            }
          }
        }
      })
      .addCase(getNewIgCommentsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(setIgCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(setIgCommentAsync.fulfilled, (state, action) => {
        state.status = "idle";
        // state.igComments = action.payload;
      })
      .addCase(setIgCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteIgCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteIgCommentAsync.fulfilled, (state, action) => {
        state.status = "idle";
        // state.igComments = action.payload;
      })
      .addCase(deleteIgCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getLiveVideosAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getLiveVideosAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.liveVideos = action.payload;
      })
      .addCase(getLiveVideosAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getMemberAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMemberAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.memberList = state.memberList.concat(action.payload);
      })
      .addCase(getMemberAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(enableActivityAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enableActivityAsync.fulfilled, (state, action) => {
        state.status = "idle";
        const curActivity = state.activity;
        if (curActivity && action.payload?.success) {
          curActivity.is_enable = action.payload.action === "enable";
        }
      })
      .addCase(enableActivityAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getPostActionsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPostActionsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.postActions = action.payload;
      })
      .addCase(getPostActionsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getVideoAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getVideoAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.video = action.payload;
      })
      .addCase(getVideoAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getShopProductsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getShopProductsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.shopProducts = action.payload;
      })
      .addCase(getShopProductsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getProductCategoriesAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProductCategoriesAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          state.productCategories = [
            ...(state.productCategories as PRODUCT_CATEGORY[]),
            ...action.payload,
          ];
        }
      })
      .addCase(getProductCategoriesAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(editCommentAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editCommentAsync.fulfilled, (state, action) => {
        state.status = "idle";
        const index = state.comments.findIndex(
          (comment: any) => comment.id === action.payload.commentId
        );
        if (index !== -1) {
          const newComments: FANS_POST_COMMENT[] = state.comments;
          newComments[index].message = action.payload.message;
          state.comments = newComments;
        }
      })
      .addCase(editCommentAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(postBindMemberAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(postBindMemberAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          const curMemberList = state.memberList;
          action.payload.forEach((detail) => {
            const detailIndex = curMemberList.findIndex(
              (member) => member.user_id === detail.user_id
            );
            if (detailIndex !== -1) {
              curMemberList[detailIndex].is_member = true;
              curMemberList[detailIndex].data = detail;
            }
          });
          state.memberList = curMemberList;
        }
      })
      .addCase(postBindMemberAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(editVariantsKeywordsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editVariantsKeywordsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        const newProducts = state.products;
        const curNickName = action.payload[0];
        const prodIndex = newProducts?.findIndex(
          (product) => product.id === curNickName.id
        );
        if (newProducts && prodIndex !== undefined && prodIndex >= 0) {
          newProducts[prodIndex].nicknames = curNickName.nicknames;
          newProducts[prodIndex].colors = curNickName.variants.colors;
          newProducts[prodIndex].sizes = curNickName.variants.sizes;
        }

        state.products = newProducts;
      })
      .addCase(editVariantsKeywordsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getDiscountAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getDiscountAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.discount = action.payload as DISCOUNT;
      })
      .addCase(getDiscountAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getAllSocialAccountsAtOnceAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllSocialAccountsAtOnceAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.socialAccounts = action.payload;
      })
      .addCase(getAllSocialAccountsAtOnceAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateLiveVideoDescriptionAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateLiveVideoDescriptionAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (
          state.activity?.dispatch?.platform === "facebook.page" &&
          state.video &&
          state.video !== "not_found"
        ) {
          state.video = { ...state.video, description: action.payload };
        }
        if (
          state.activity?.dispatch?.platform === "facebook.group" &&
          state.liveVideo &&
          state.liveVideo !== "not_found"
        ) {
          state.liveVideo = {
            ...state.liveVideo,
            description: action.payload,
          };
        }
      })
      .addCase(updateLiveVideoDescriptionAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateVideoDescriptionAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateVideoDescriptionAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (state.post) {
          state.post = { ...state.post, message: action.payload };
        }
        if (
          state.activity?.dispatch?.platform === "facebook.page" &&
          state.video &&
          state.video !== "not_found"
        ) {
          state.video = { ...state.video, description: action.payload };
        }
        if (
          state.activity?.dispatch?.platform === "facebook.group" &&
          state.liveVideo &&
          state.liveVideo !== "not_found"
        ) {
          state.liveVideo = {
            ...state.liveVideo,
            description: action.payload,
          };
        }
      })
      .addCase(updateVideoDescriptionAsync.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const {
  setFansPage,
  clearFansPage,
  // setOrder,
  setOrderNew,
  clearComments,
  setDiscount,
  addNewShopProductToShopProducts,
  setIsLiveBoradcastMode,
  updateFbLiveStreamingStatus,
  setIsPrepared,
} = liveRoomSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectFansPage = (state: RootState) => state.liveRoom.fansPage;
export const selectPost = (state: RootState) => state.liveRoom.post;
export const selectLiveVideo = (state: RootState) => state.liveRoom.liveVideo;
export const selectProducts = (state: RootState) => state.liveRoom.products;
export const selectActivity = (state: RootState) => state.liveRoom.activity;
export const selectComments = (state: RootState) => state.liveRoom.comments;
// export const selectOrder = (state: RootState) => state.liveRoom.order;
export const selectActivityProducts = (state: RootState) =>
  state.liveRoom.activityProducts;
export const selectActivityPosts = (state: RootState) =>
  state.liveRoom.activityPosts;
export const selectIgMedia = (state: RootState) => state.liveRoom.igMediaInfo;
export const selectIgMediaComments = (state: RootState) =>
  state.liveRoom.igComments;
export const selectMemberList = (state: RootState) => state.liveRoom.memberList;
export const selectPostActions = (state: RootState) =>
  state.liveRoom.postActions;
export const selectProductCategories = (state: RootState) =>
  state.liveRoom.productCategories;
export const selectShopProducts = (state: RootState) =>
  state.liveRoom.shopProducts;
export const selectVideo = (state: RootState) => state.liveRoom.video;
export const selectLiveVideos = (state: RootState) => state.liveRoom.liveVideos;
export const selectDiscount = (state: RootState) => state.liveRoom.discount;
export const selectSocialAccounts = (state: RootState) =>
  state.liveRoom.socialAccounts;
export const selectLiveBoradcastMode = (state: RootState) =>
  state.liveRoom.isLiveBoradcastMode;
export const selectOrderNew = (state: RootState) => state.liveRoom.orderNew;
export const selectIgMediaUrl = (state: RootState) => state.liveRoom.igMediaUrl;
export const selectIsPrepared = (state: RootState) => state.liveRoom.isPrepared;
export default liveRoomSlice.reducer;
