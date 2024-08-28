import { api } from "@apis/index";
import { FANS_POST, FANS_PAGE } from "./facebook";

export interface PRODUCT {
  id: string;
  media_url: string;
  name: string;
  nicknames?: string[];
  variants?: VARIANT[];
  shopCarts?: any;
  totalAmout?: number;
  sort_key?: number;
  sn: string;
  status: "上架" | "下架" | "半隱藏";
  main_category: string | null;
  sub_categories: string[];
  links: {
    edit: string;
    front: string;
  };
  colors?: {
    name: string;
    nicknames: string[];
  }[];
  sizes?: {
    name: string;
    nicknames: string[];
  }[];
  size_table?: string;
  comments?: string[];
}

export interface VARIANT {
  color: string;
  id: string;
  price: string;
  size: string;
  status: "上架" | "下架";
}

export interface PRODUCT_CATEGORY {
  children?: PRODUCT_CATEGORY[];
  id: string;
  title: string;
}

export interface ACTIVITY {
  id: string;
  title: string;
  dispatch?: DISPATCH;
  start_time: string;
  end_time: string;
  is_enable: boolean;
}

export interface DISPATCH {
  fb_fanspage_id: string;
  fb_post_id: string;
  id: string;
  platform: string;
}

export interface DELETE_PRODUCT_DATA {
  id: string;
  success: boolean;
}

export interface EDIT_KEYWORD_DATA {
  data: { id: string; nicknames: string[] }[];
  success: boolean;
}

export interface ACTIVITY_POST {
  id: string;
  post: {
    fb_post_id: string | null;
    id: number;
    content: string;
    platform_name?: string;
    create_time?: string;
  };
  fanspage?: {
    id: string;
    name: string;
  };
  instagram_business_account?: {
    id: string;
    name: string;
  };
  detail: FANS_POST | null;
  fanPage?: FANS_PAGE | null;
  platform?: "facebook.page" | "facebook.group" | "instagram";
}

export interface PLATFORM {
  id: string;
  instagram_business_account_id?: string;
  access_token?: string;
  name?: string;
}

export const fetchProdList = async (
  url: string,
  activityId: string,
  fetchType: "post" | "activity",
  postId?: string
) => {
  let urlProds = `${url}&activity_id=${activityId}`;
  if (postId) {
    urlProds = `${urlProds}&post_id=${postId}`;
  }
  let curProdList: PRODUCT[] = [];
  await api.get(urlProds, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curProdList = data.map((item: any) => {
        item["nicknames"] = [];
        return item;
      });
    }
  });
  return curProdList;
};

export const fetchNickNames = async (
  url: string,
  activityId: string,
  postId: string,
  strProds: string
) => {
  let curNicknames: any[] = [];
  const urlNicknames = `${url}&activity_id=${activityId}&post_id=${postId}&product_ids=${strProds}`;
  await api.get(urlNicknames, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      curNicknames = res.data;
    }
  });
  return curNicknames;
};

export const fetchActivity = async (url: string, activityId: string) => {
  const urlActivity = `${url}&id=${activityId}`;
  let curActivity: ACTIVITY | null = null;
  await api.get(urlActivity, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curActivity = data;
    }
  });
  return curActivity;
};

export const fetchDispatch = async (url: string, postId: string) => {
  const urlDispatch = `${url}&id=${postId}`;
  let curDispatch: DISPATCH | null = null;
  await api.get(urlDispatch, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curDispatch = data;
    }
  });
  return curDispatch;
};

export const deleteProduct = async (
  url: string,
  activityId: string,
  postId: string,
  productId: string
) => {
  let result: DELETE_PRODUCT_DATA[] | null = null;
  await api
    .delete(url, {
      baseURL: "",
      data: {
        activity_id: Number(activityId),
        post_id: Number(postId),
        product_ids: productId,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    })
    .then((res: any) => {
      if (res.success) {
        const { data } = res;
        result = data;
      }
    });
  return result;
};

export const editProdKeyword = async (
  url: string,
  activityId: string,
  postId: string,
  productId: string,
  nicknames: string[]
) => {
  let result: any = null;
  await api
    .post(
      url,
      {
        activity_id: Number(activityId),
        post_id: Number(postId),
        data: JSON.stringify([{ id: productId, nicknames: nicknames }]),
      },
      {
        baseURL: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }
    )
    .then((res: any) => {
      if (res.success) {
        const { data } = res;
        result = data;
      }
    });
  return result;
};

export const addCurProduct = async (
  url: string,
  activityId: string,
  postId: string,
  productIds: string
) => {
  let result: any = null;
  await api
    .post(
      url,
      {
        activity_id: Number(activityId),
        post_id: Number(postId),
        product_ids: productIds,
      },
      {
        baseURL: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }
    )
    .then((res: any) => {
      if (res.success) {
        const { data } = res;
        result = data;
      }
    });
  return result;
};

export const getActivityPosts = async (url: string, activityId: string) => {
  let urlActivityPosts = `${url}&id=${activityId}`;
  let curPostsList: ACTIVITY_POST[] = [];
  await api.get(urlActivityPosts, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curPostsList = data;
    }
  });
  return curPostsList;
};

export const getplatformSource = async (url: string, platform: string) => {
  const urlPlatform = `${url}&platform=${platform}`;
  let curPlatforms: PLATFORM[] | null = null;
  await api.get(urlPlatform, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curPlatforms = data;
    }
  });
  return curPlatforms;
};

export const getShopProducts = async (
  url: string,
  offset: number = 0,
  limit: number = 10
) => {
  let curProducts: PRODUCT[] = [];
  url = `${url}&limit=${limit}&offset=${offset}`;
  await api.get(url, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      curProducts = data;
    }
  });
  return curProducts;
};

export const addActivityProducts = async (
  url: string,
  activityId: string,
  products: string
) => {
  const res: any = await api.post(
    url,
    {
      activity_id: Number(activityId),
      product_ids: products,
    },
    {
      baseURL: "",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    }
  );
  return res;
};

export const replaceActivityPost = async (
  url: string,
  activityId: string,
  postId: string,
  source: string,
  source_identity: string,
  identity: string,
  raw: string = "{}"
) => {
  const res: any = await api.post(
    url,
    {
      activity_id: Number(activityId),
      post_id: Number(postId),
      source_identity: source_identity,
      identity: identity,
      raw: raw,
      source: source,
    },
    {
      baseURL: "",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    }
  );
  return res;
};

export const setActivityPostDiscount = async (
  url: string,
  activityId: string,
  postId: string,
  start_time: string,
  end_time: string,
  type: string,
  value: string
) => {
  const res: any = await api
    .post(
      url,
      {
        activity_id: Number(activityId),
        post_id: Number(postId),
        start_time: start_time,
        end_time: end_time,
        type: type,
        value: value,
      },
      {
        baseURL: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }
    )
    .catch((e) => {
      return e;
    });
  return res;
};

export const getActivityPostDiscount = async (
  url: string,
  activityId: string,
  postId: string
) => {
  const baseUrl = `${url}&activity_id=${activityId}&post_id=${postId}`;
  const res: any = await api.get(baseUrl, { baseURL: "" }).catch((e) => {
    return e;
  });
  return res;
};
