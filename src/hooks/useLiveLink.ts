import { useAppSelector } from "@store/hooks";
import {
  selectFansPage,
  selectIgMedia,
  selectLiveVideo,
  selectVideo,
} from "@store/liveroomSlice";

function useLiveLink() {
  const curLiveVideo = useAppSelector(selectLiveVideo);
  const curVideo = useAppSelector(selectVideo);
  const curIgMedia = useAppSelector(selectIgMedia);
  const curFanPage = useAppSelector(selectFansPage);
  const videoLink =
    curVideo &&
    curVideo !== "not_found" &&
    curVideo?.embed_html.match(liveEmbedLinkRegex)?.[1]
      ? decodeURIComponent(
          curVideo.embed_html.match(liveEmbedLinkRegex)?.[1] as string
        )
      : null;
  const liveVideoLink =
    curLiveVideo &&
    curLiveVideo !== "not_found" &&
    curLiveVideo?.embed_html.match(liveEmbedLinkRegex)?.[1]
      ? decodeURIComponent(
          curLiveVideo?.embed_html.match(liveEmbedLinkRegex)?.[1] as string
        )
      : null;
  const igMediaLink =
    curIgMedia && curIgMedia !== "not_live"
      ? `https://www.instagram.com/${curFanPage?.name}/live/`
      : null;
  return igMediaLink || liveVideoLink || videoLink || null;
}

const liveEmbedLinkRegex = /href=(https?[^"\\\s&]+)/;

export default useLiveLink;
