import { useEffect, useState } from "react";
import { getQueryParam } from "@utils/common";
import { decode } from "js-base64";
import { useParams } from "react-router-dom";
import { api } from "@apis/index";

export const useApi = () => {
  const [isFetchedApi, setIsFetchedApi] = useState<boolean>(false);
  let { activityId, postId } = useParams();

  useEffect(() => {
    const stringApis = getQueryParam("api");

    if (stringApis) {
      const url = `${decode(
        stringApis
      )}&activity_id=${activityId}&post_id=${postId}`;
      api.get(url, { baseURL: "" }).then((res) => {});
      setIsFetchedApi(true);
    }
  }, []);

  return isFetchedApi;
};
