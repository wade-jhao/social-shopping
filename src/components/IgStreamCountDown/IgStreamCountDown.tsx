import { Typography } from "@mui/material";

import useIgRemainTime from "./useIgRemainTime";
import { useStreamStatus } from "@hooks/streamStatus";
import DialogIgStreamCountDownRemind from "./DialogIgStreamCountDownRemind";

interface PROPS {}

function IgStreamCountDown(props: PROPS) {
  const { IS_STREAMING } = useStreamStatus();
  const { remainingTimeAmounts, isReachedRemainTime } = useIgRemainTime();
  if (!IS_STREAMING) {
    return <></>;
  }
  if (!isReachedRemainTime) return <></>;
  return (
    <>
      <Typography variant="body1" color={"error"}>
        距結束 {remainingTimeAmounts.hours.toString().padStart(1, "0")} 時{" "}
        {remainingTimeAmounts.minutes.toString().padStart(2, "0")} 分{" "}
        {remainingTimeAmounts.seconds.toString().padStart(2, "0")} 秒
      </Typography>
      <DialogIgStreamCountDownRemind />
    </>
  );
}

export default IgStreamCountDown;
