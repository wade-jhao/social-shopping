import { useEffect, useState } from "react";
import { IG_REMIND_REMAINING_TIME_SECOND } from "./utils";
import { useStreamStatus } from "@hooks/streamStatus";
import { useAppSelector } from "@store/hooks";
import { selectIgMedia } from "@store/liveroomSlice";
import { IG_MEDIA } from "@pages/LiveRoom/apis/facebook";
import useActivityPostIgCountDownTimeStorage from "./useActivityPostIgCountDownTimeStorage";

function useIgRemainTime() {
  const igMedia = useAppSelector(selectIgMedia);
  const [currentTimeStamp, setCurrentTimeStamp] = useState<number>(
    new Date().getTime()
  );
  const { streamTimeStorage, IgCountDownstorageKey } =
    useActivityPostIgCountDownTimeStorage();
  const { IS_STREAMING, IS_STREAM_ENDED } = useStreamStatus();
  const streamStartTimeStamp = new Date(
    IS_STREAMING ? (igMedia as IG_MEDIA)?.timestamp : 0
  ).getTime();
  const streamEndTimeStamp =
    streamStartTimeStamp + parseInt(streamTimeStorage) * 60 * 60 * 1000;
  const distance = streamEndTimeStamp - currentTimeStamp;
  const remainingTimeAmounts = {
    hours:
      Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) > 0
        ? Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        : 0,
    minutes:
      Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) > 0
        ? Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        : 0,
    seconds:
      Math.floor((distance % (1000 * 60)) / 1000) > 0
        ? Math.floor((distance % (1000 * 60)) / 1000)
        : 0,
  };
  const isReachedRemainTime =
    distance <= IG_REMIND_REMAINING_TIME_SECOND * 1000;

  useEffect(() => {
    if (!IS_STREAMING) {
      return;
    }
    const intervalId = setInterval(() => {
      setCurrentTimeStamp(new Date().getTime());
    }, 1000);
    if (distance <= 0) {
      clearInterval(intervalId);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [IS_STREAMING, distance]);
  useEffect(() => {
    if (!IS_STREAM_ENDED) {
      return;
    }
    window.localStorage.removeItem(IgCountDownstorageKey);
  }, [IS_STREAM_ENDED, IgCountDownstorageKey]);
  return {
    remainingTimeAmounts,
    isReachedRemainTime,
  };
}

export default useIgRemainTime;
