import { useAppSelector } from "@store/hooks";
import {
  selectIgMedia,
  selectLiveVideo,
  selectVideo,
} from "@store/liveroomSlice";

export const useStreamStatus = () => {
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const curIgMedia = useAppSelector(selectIgMedia);

  const IS_STREAMING = () => {
    if (curIgMedia && curIgMedia !== "not_live") {
      return true;
    }
    if (
      curLiveVideo &&
      curLiveVideo !== "not_found" &&
      curLiveVideo?.status?.includes("LIVE")
    ) {
      return true;
    }
    if (
      curVideo &&
      curVideo !== "not_found" &&
      curVideo?.live_status?.includes("LIVE")
    ) {
      return true;
    }

    if (curVideo && curVideo !== "not_found" && !curVideo?.live_status) {
      return "UNKONWN";
    }
    return false;
  };

  const IS_STREAM_ENDED = () => {
    if (curIgMedia === "not_live") {
      return true;
    }
    if (
      curLiveVideo &&
      (curLiveVideo === "not_found" || curLiveVideo?.status === "VOD")
    ) {
      return true;
    }
    if (
      curVideo &&
      (curVideo === "not_found" || curVideo?.live_status === "VOD")
    ) {
      return true;
    }
    return false;
  };

  return {
    IS_STREAMING: IS_STREAMING(),
    IS_STREAM_ENDED: IS_STREAM_ENDED(),
  };
};
