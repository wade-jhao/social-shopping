import { api } from "@apis/index";
import { FANS_POST, FANS_PAGE } from "./facebook";
import { createProductForm } from "@components/CreateProductForm/types";

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
  content?: string;
  create_time?: string;
  platform_name?: string;
}

export interface DELETE_PRODUCT_DATA {
  id: string;
  success: boolean;
}

export interface EDIT_KEYWORD_DATA {
  data: { id: string; nicknames: string[] }[];
  success: boolean;
}

export interface MEMBER_DATA {
  user_id: string;
  account: string | null;
  member_type: string | null;
  total_paid: number | null;
  total_order: number | null;
  is_enable: boolean | null;
  member_actions?: { name: string; url: string }[];
}

export interface MEMBER_INFO {
  user_id: string;
  is_member: boolean;
  data?: MEMBER_DATA;
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

export interface PRODUCT_CATEGORY {
  children?: PRODUCT_CATEGORY[];
  id: string;
  title: string;
}

export interface POST_ACTION {
  name: string;
  type: string;
  url: string;
}

export interface DISCOUNT {
  start_time: string;
  end_time: string;
  type: string;
  value: string;
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

export const updateProduct = async (url: string, productId: string) => {
  let result: any = null;
  let urlUpdateProduct = `${url}&id=${productId}`;
  await api
    .get(urlUpdateProduct, {
      baseURL: "",
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

export const editVariantsKeywords = async (
  url: string,
  activityId: string,
  postId: string,
  productId: string,
  type: "color" | "size",
  variantValue: string,
  nicknames: string[]
) => {
  let result: any = null;
  await api
    .post(
      url,
      {
        activity_id: Number(activityId),
        post_id: Number(postId),
        data: JSON.stringify([
          {
            product_id: productId,
            variant_type: type,
            variant_value: variantValue,
            nicknames: nicknames,
          },
        ]),
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

export const createProduct = async (
  url: string,
  productForm: createProductForm
) => {
  let result: any = null;
  const variants = productForm.variants.map((item) => ({
    color: item.color,
    size: item.size,
    amount: item.amount,
    preorder: item.preorder ? 1 : 0,
    disable: item.disable ? 1 : 0,
  }));
  await api
    .post(
      url,
      { ...productForm, variants },
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
        return;
      }
      result = { error: res.error };
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

export const checkIsMemberComment = async (url: string, userIds: string) => {
  let urlCheckMembers = `${url}&user_ids=${userIds}`;
  let curMemberList: { user_id: string; is_member: boolean }[] = [];
  await api.get(urlCheckMembers, { baseURL: "" }).then((res: any) => {
    const { data } = res;
    curMemberList = [...data];
  });
  return curMemberList;
};

export const getMemberActions = async (url: string, userIds: string) => {
  let urlCheckMembers = `${url}&user_ids=${userIds}`;
  let curMembersActions: {
    user_id: string;
    actions: { name: string; url: string }[];
  }[] = [];
  await api.get(urlCheckMembers, { baseURL: "" }).then((res: any) => {
    const { data } = res;
    curMembersActions = [...data];
  });
  return curMembersActions;
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

export const setEnableActivity = async (
  url: string,
  activityId: string,
  isEnable: boolean
) => {
  const res: any = await api.post(
    url,
    {
      id: Number(activityId),
      is_enable: isEnable ? 1 : 0,
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

export const getMemberDetail = async (url: string, userId: string) => {
  const baseUrl = `${url}&user_ids=${userId}`;
  const res = await api.get(baseUrl, { baseURL: "" }).catch((e) => {
    return e;
  });
  return res.data;
};

export const getPostAction = async (
  url: string,
  activityId: string,
  postId: string
) => {
  const baseUrl = `${url}&activity_id=${activityId}&post_id=${postId}`;
  const res = await api.get(baseUrl, { baseURL: "" }).catch((e) => {
    return e;
  });
  return res.data.actions as POST_ACTION[];
};

export const getProductCategories = async (url: string) => {
  const res: any = await api.get(url, { baseURL: "" }).catch((e) => {
    return e;
  });
  return res.data as PRODUCT_CATEGORY[];
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

export const bindMember = async (
  url: string,
  userId: string,
  email: string
) => {
  const res: any = await api.post(
    url,
    {
      user_id: userId,
      bind_to: email,
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

export const getSocialAccounts = async (url: string, platform: string) => {
  let accounts: any[] = [];
  const socialUrl = `${url}&platform=${platform}`;
  await api.get(socialUrl, { baseURL: "" }).then((res: any) => {
    if (res.success) {
      const { data } = res;
      accounts = data;
    }
  });
  return accounts;
};
