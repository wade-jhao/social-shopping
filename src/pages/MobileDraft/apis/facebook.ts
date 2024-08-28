// import Cookies from "js-cookie";
import { api } from "@apis/index";

// import { sendGaEvent } from "@utils/track";

const fbApiErrorHandler = <T, TwE extends T>(
  callback: (response: T) => void,
  endpoint?: string,
  strict: boolean = true
): ((response: TwE) => void) => {
  return (response: any) => {
    if (response?.error) {
      // sendGaEvent<{ msg: string; type: string; endpoint: string }>(
      //   "error_notice",
      //   {
      //     msg: JSON.stringify(response?.error?.message),
      //     type: "facebook",
      //     endpoint: endpoint as string,
      //   }
      // );
    }
    if (response?.error?.code === 190) {
      // access token expired
      const pathNames = window.location.pathname.split("/");
      if (pathNames.length >= 5) {
        window.location.href = `/liveroom/activities/${pathNames[4]}/errors/accessTokenExpired`;
      }
      // window.localStorage.removeItem("user_id");
      // window.localStorage.removeItem("user_info");
      // Cookies.remove("fb_access_token");
      // setTimeout(() => {
      //   window.location.href = "/login";
      // }, 1000);
    } else if (response?.error?.code === 10 || response?.error?.code === 100) {
      console.log("FB error 10:", response?.error?.message);
      callback(response satisfies T);
    } else if ((!response || response.error) && strict) {
      throw Error(response?.error?.message || "FB API Error");
    } else callback(response satisfies T);
  };
};

export interface PAGING {
  cursors: { before: string; after: string };
}

export interface GROUP_PAGING {
  next?: string;
  previous?: string;
}

interface BASE_RESPONSE {
  paging?: PAGING;
  error?: { code: string; message: string };
}

export interface FANS_PAGE {
  id: string;
  name: string;
  access_token: string;
  picture: { data: { url: string } };
}

export interface IG_PAGE extends FANS_PAGE {
  instagram_business_account?: {
    id: string;
    profile_picture_url: string;
    username: string;
  };
}

export interface FANS_RESPONSE extends BASE_RESPONSE {
  data: FANS_PAGE[];
  summary?: { total_count: number };
}

export interface IG_RESPONSE extends BASE_RESPONSE {
  data: IG_PAGE[];
  summary?: { total_count: number };
}

export interface FANS_POST {
  created_time: string;
  id: string;
  message?: string;
  from?: {
    id: string;
    name: string;
    picture: {
      data: { url: string };
    };
  };
  status_type: string;
}

export interface POST_RESPONSE extends BASE_RESPONSE {
  data: FANS_POST[];
}

export interface FANS_POST_COMMENT {
  created_time: string;
  from?: {
    id: string;
    name: string;
    picture: {
      data: { url: string };
    };
  };
  id: string;
  message?: string;
  reactionType?: string;
  comments?: { data: FANS_POST_COMMENT[] };
  parent?: { id: string };
}

export interface FANS_POST_COMMENTS_SIZE_RESPONSE extends BASE_RESPONSE {
  summary: {
    total_count: number;
  };
}

export interface FANS_POST_COMMENTS_RESPONSE
  extends FANS_POST_COMMENTS_SIZE_RESPONSE {
  data: FANS_POST_COMMENT[];
}

export interface FANS_POST_REACTION {
  id: string;
  type: string;
}

export interface FANS_POST_REACTIONS_RESPONSE
  extends FANS_POST_COMMENTS_SIZE_RESPONSE {
  data: FANS_POST_REACTION[];
}

export interface GROUP_PAGE {
  administrator: boolean;
  id: string;
  name: string;
  access_token: string;
  picture: { data: { url: string } };
}

export interface GROUP_RESPONSE extends BASE_RESPONSE {
  data: GROUP_PAGE[];
  summary?: { total_count: number };
}

export interface GROUP_POST {
  created_time: string;
  id: string;
  message?: string;
  type?: string;
  object_id?: string;
}

export interface GROUP_POST_RESPONSE {
  data: GROUP_POST[];
  paging: GROUP_PAGING;
  error?: { code: string; message: string };
}

export interface IG_MEDIA {
  caption: string;
  id: string;
  timestamp: string;
  username?: string;
}

export interface IG_MEDIA_RESPONSE extends BASE_RESPONSE {
  data: IG_MEDIA[];
}

export interface IG_MEDIA_COMMENT {
  id: string;
  text: string;
  timestamp: string;
  from: {
    id: string;
    username: string;
  };
}

export interface IG_POST_COMMENTS_RESPONSE extends BASE_RESPONSE {
  data: IG_MEDIA_COMMENT[];
}

export interface LIVE_VIDEO {
  creation_time: string;
  embed_html: string;
  id: string;
  status: string;
  description: string;
  video: {
    created_time: string;
    description: string;
    id: string;
    title: string;
  };
  from?: {
    id: string;
    name: string;
  };
}

export interface VIDEO {
  embed_html: string;
  id: string;
  live_status?: string;
  description: string;
  title: string;
  post_id: string;
  status?: { video_status: string };
  created_time: string;
}

export interface VIDEOS_RESPONSE extends BASE_RESPONSE {
  data: VIDEO[];
}

export interface LIVE_VIDEOS_RESPONSE extends BASE_RESPONSE {
  data: LIVE_VIDEO[];
}

export const getFansList = (
  accessToken: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/me/accounts?access_token=${accessToken}&fields=id,name,access_token,picture{url},instagram_business_account{id,profile_picture_url,username}&limit=${limit}&summary=total_count`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_RESPONSE) => {
      if (response?.data) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFanspagePosts = (
  fansPage: FANS_PAGE,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 10
) => {
  let endpoint = `/${fansPage.id}/posts?access_token=${fansPage.access_token}&fields=message,created_time&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: POST_RESPONSE) => {
      if (response?.data) {
        if (response?.data) {
          onSuccess && onSuccess(response);
        }
      }
    }, endpoint)
  );
};

export const getFansPostCommentsSize = (
  accessToken: string,
  fansPost: string,
  onSuccess: Function,

  limit: number = 0
) => {
  const endpoint = `/${fansPost}/comments?access_token=${accessToken}&limit=${limit}&summary=total_count`;

  FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_POST_COMMENTS_SIZE_RESPONSE) => {
      if (response?.summary) {
        onSuccess && onSuccess(response.summary);
      }
    }, endpoint)
  );
};

export const getFansPostComments = async (
  accessToken: string,
  fansPost: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${fansPost}/comments?access_token=${accessToken}&fields=id,message,created_time,from{id,name,picture{url}},comments.limit(10).order(chronological){id,message,created_time,from{id,name,picture{url}},parent{id}}&limit=${limit}&order=chronological`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_POST_COMMENTS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFansPostComment = async (
  accessToken: string,
  commentId: string,
  onSuccess?: Function
) => {
  let endpoint = `/${commentId}?access_token=${accessToken}&fields=id,message,created_time,from{id,name,picture{url}},parent{id}`;
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: any) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFansPostReactions = async (
  accessToken: string,
  fansPost: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${fansPost}/reactions?access_token=${accessToken}&fields=type,from{id,username}&limit=${limit}&summary=total_count`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_POST_REACTIONS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getGroupList = (
  userId: string,
  accessToken: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${userId}/groups?access_token=${accessToken}&admin_only=true&fields=id,name,administrator,picture{url}&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: GROUP_RESPONSE) => {
      if (response?.data) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getGroupPosts = (
  accessToken: string,
  group: GROUP_PAGE,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 5
) => {
  let endpoint = `/${group.id}/feed?access_token=${accessToken}&fields=id,message,type,object_id,created_time&limit=${limit}`;
  if (cursor_after) {
    endpoint = cursor_after;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: GROUP_POST_RESPONSE) => {
      if (response?.data) {
        if (response?.data) {
          onSuccess && onSuccess(response);
        }
      }
    }, endpoint)
  );
};

export const getIgPage = (
  accessToken: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/me/accounts?access_token=${accessToken}&fields=id,name,access_token,picture{url},instagram_business_account{id,profile_picture_url,username}&limit=${limit}&summary=total_count`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: IG_RESPONSE) => {
      if (response?.data) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getIgLiveMediaAndMedia = (
  accessToken: string,
  ig_business_account: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 5
) => {
  let endpoint = `/${ig_business_account}/live_media?access_token=${accessToken}&fields=id,timestamp,caption,username&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: IG_MEDIA_RESPONSE) => {
      if (response?.data) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getIgMedia = (
  accessToken: string,
  ig_business_account: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${ig_business_account}/media?access_token=${accessToken}&fields=id,timestamp,caption&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  FB.api(
    endpoint,
    fbApiErrorHandler((response: IG_MEDIA_RESPONSE) => {
      if (response?.data) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getIgComments = async (
  accessToken: string,
  fansPost: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${fansPost}/comments?access_token=${accessToken}&fields=id,text,timestamp,from{id,username}&limit=${limit}&order=chronological&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: IG_POST_COMMENTS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFansPage = async (
  id: string,
  accessToken: string,
  onSuccess: Function
) => {
  const endpoint = `/${id}?access_token=${accessToken}&fields=id,name,access_token,picture{url}`;
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_PAGE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFbLiveVideos = async (
  fansPage: FANS_PAGE,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 10
) => {
  let endpoint = `/${fansPage.id}/live_videos?access_token=${fansPage.access_token}&fields=id,status&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: LIVE_VIDEOS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getFbVideos = async (
  fansPage: FANS_PAGE,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 10
) => {
  let endpoint = `/${fansPage.id}/videos?access_token=${fansPage.access_token}&fields=post_id,live_status,created_time,id,video_id,title,description,embed_html&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: VIDEOS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getGroupLiveVideos = async (
  group: GROUP_PAGE,
  accessToken: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 10
) => {
  let endpoint = `/${group.id}/live_videos?access_token=${accessToken}&fields=post_id,id,title,description,creation_time,app_attribution_tag,attribution_app_id,content_tags,status,embed_html,video{id,title,description,created_time}&limit=${limit}`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: any) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getPostInfo = async (
  id: string,
  accessToken: string,
  onSuccess: Function
) => {
  const endpoint = `/${id}?access_token=${accessToken}&fields=id,message,created_time,from{id,name,picture{url}}`;
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_POST) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const getLiveVideoComment = (videoid: string, accessToken: string) => {
  return new Promise((resolve) => {
    api
      .get("/event-stream", { baseURL: "", responseType: "stream" })
      .then(() => {
        const eventNode = new EventSource(
          `https://streaming-graph.facebook.com/${videoid}/live_comments?access_token=${accessToken}&comment_rate=ten_per_second&fields=from{name,id},message`,
          {
            withCredentials: true,
          }
        );
        eventNode.addEventListener("open", () => {
          resolve(eventNode);
        });
      });
  });
};

export const getLiveVideoComments = async (
  accessToken: string,
  videoId: string,
  onSuccess: Function,
  cursor_after?: string | null,
  limit: number = 100
) => {
  let endpoint = `/${videoId}/comments?access_token=${accessToken}&fields=id,message,created_time,from{id,name,picture{url}},comments.limit(10).order(chronological){id,message,created_time,from{id,name,picture{url}},parent{id}}&limit=${limit}&order=chronological`;
  if (cursor_after) {
    endpoint = `${endpoint}&after=${cursor_after}`;
  }
  await FB.api(
    endpoint,
    fbApiErrorHandler((response: FANS_POST_COMMENTS_RESPONSE) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const sendFBPostComment = async (
  accessToken: string,
  postId: string,
  message: string,
  onSuccess: Function
) => {
  let endpoint = `/${postId}/comments?access_token=${accessToken}&fields=id,message,created_time,from{id,name,picture{url}},parent{id}`;
  await FB.api(
    endpoint,
    "POST",
    { message: message },
    fbApiErrorHandler((response: FANS_POST_COMMENT) => {
      if (response) {
        onSuccess && onSuccess(response);
      }
    }, endpoint)
  );
};

export const deleteFBPostComment = async (
  accessToken: string,
  commentId: string,
  onSuccess: Function
) => {
  const endpoint = `/${commentId}?access_token=${accessToken}`;
  await FB.api(
    endpoint,
    "DELETE",
    fbApiErrorHandler((response: { success: boolean }) => {
      if (response.success) {
        onSuccess && onSuccess({ commentId: commentId });
      }
    }, endpoint)
  );
};
