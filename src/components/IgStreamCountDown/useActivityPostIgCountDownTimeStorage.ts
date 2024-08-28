import { useLocalStorage } from "@utils/storage";
import { useParams } from "react-router";

export default function useActivityPostIgCountDownTimeStorage() {
  const { activityId, postId } = useParams();
  const storageKey = `igStreamCountDownTime-${activityId}-${postId}`;
  const [streamTimeStorage, setStreamTimeStorage] = useLocalStorage(
    storageKey,
    ""
  );
  return {
    streamTimeStorage,
    setStreamTimeStorage,
    IgCountDownstorageKey: storageKey,
  };
}
