import {
  PAGING,
  FANS_POST_COMMENTS_RESPONSE,
  IG_POST_COMMENTS_RESPONSE,
} from "@pages/LiveRoom/apis/facebook";
import {
  getNewCommentsAsync,
  getNewGroupCommentsAsync,
  getNewIgCommentsAsync,
} from "@store/liveroomSlice";
import { useAppDispatch } from "@store/hooks";
import { useEffect, useState } from "react";

const useFetchFbAllComments = () => {
  const dispatch = useAppDispatch();
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [data, setData] = useState<{
    isLiveVideo: boolean | null;
    accessToken: string | null;
    postId: string | null;
    curPaging: PAGING | undefined;
  }>({
    isLiveVideo: null,
    accessToken: null,
    postId: null,
    curPaging: undefined,
  });

  const getAllComments = async (
    isLiveVideo: boolean,
    accessToken: string,
    postId: string,
    curPaging: PAGING | undefined = undefined
  ) => {
    const curResult = await new Promise<FANS_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: FANS_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        dispatch(
          getNewCommentsAsync({
            isLiveVideo: isLiveVideo,
            accessToken: accessToken,
            postId: postId,
            onResult: onFetchCommentsSuccess,
            curPaging: curPaging,
          })
        );
      }
    );
    const { paging } = curResult;
    if (paging?.cursors?.after) {
      setData({ isLiveVideo, accessToken, postId, curPaging: paging });
    } else {
      setIsLoadingComplete(true);
    }
  };
  useEffect(() => {
    if (
      isLoadingComplete ||
      data.isLiveVideo === null ||
      !data.accessToken ||
      !data.postId
    ) {
      return;
    }

    getAllComments(
      data.isLiveVideo,
      data.accessToken,
      data.postId,
      data.curPaging
    );
  }, [data, isLoadingComplete]);

  return { getAllComments, isLoadingComplete, lastPaging: data.curPaging };
};

const useFetchFbGroupAllComments = () => {
  const dispatch = useAppDispatch();
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [data, setData] = useState<{
    accessToken: string | null;
    videoId: string | null;
    curPaging: PAGING | undefined;
  }>({
    accessToken: null,
    videoId: null,
    curPaging: undefined,
  });

  const getAllComments = async (
    accessToken: string,
    videoId: string,
    curPaging: PAGING | undefined = undefined
  ) => {
    const curResult = await new Promise<FANS_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: FANS_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        dispatch(
          getNewGroupCommentsAsync({
            accessToken: accessToken,
            videoId: videoId,
            onResult: onFetchCommentsSuccess,
            curPaging: curPaging,
          })
        );
      }
    );
    const { paging } = curResult;
    if (paging?.cursors?.after) {
      setData({ accessToken, videoId, curPaging: paging });
    } else {
      setIsLoadingComplete(true);
    }
  };
  useEffect(() => {
    if (isLoadingComplete || !data.accessToken || !data.videoId) {
      return;
    }

    getAllComments(data.accessToken, data.videoId, data.curPaging);
  }, [data, isLoadingComplete]);

  return { getAllComments, isLoadingComplete, lastPaging: data.curPaging };
};

const useFetchAllIgComments = () => {
  const dispatch = useAppDispatch();
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [data, setData] = useState<{
    accessToken: string | null;
    livePostId: string | null;
    curPaging: PAGING | undefined;
  }>({
    accessToken: null,
    livePostId: null,
    curPaging: undefined,
  });
  const getAllIgComments = async (
    accessToken: string,
    livePostId: string,
    curPaging: PAGING | undefined = undefined
  ) => {
    const curResult = await new Promise<IG_POST_COMMENTS_RESPONSE>(
      (resolve) => {
        const onFetchCommentsSuccess = (res: IG_POST_COMMENTS_RESPONSE) => {
          resolve(res);
        };
        dispatch(
          getNewIgCommentsAsync({
            accessToken: accessToken,
            livePostId: livePostId,
            onResult: onFetchCommentsSuccess,
            curPaging: curPaging,
          })
        );
      }
    );
    const { paging } = curResult;
    if (paging?.cursors?.after) {
      setData({ accessToken, livePostId, curPaging: paging });
    } else {
      setIsLoadingComplete(true);
    }
  };
  useEffect(() => {
    if (isLoadingComplete || !data.accessToken || !data.livePostId) {
      return;
    }

    getAllIgComments(data.accessToken, data.livePostId, data.curPaging);
  }, [data, isLoadingComplete]);
  return { getAllIgComments, isLoadingComplete, lastPaging: data.curPaging };
};

const getNewCommentsOfLength = (comments: any[], number: number = 500) => {
  const remain = window.localStorage.getItem("live_comments_number");
  const checkedNumber =
    remain && !isNaN(Number(remain)) ? Number(remain) : number;
  return checkedNumber >= comments.length
    ? comments
    : comments.slice(-checkedNumber);
};

export {
  useFetchFbAllComments,
  useFetchFbGroupAllComments,
  useFetchAllIgComments,
  getNewCommentsOfLength,
};
