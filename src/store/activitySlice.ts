import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@store/store";
import {
  getFansList,
  getGroupList,
  FANS_PAGE,
  GROUP_PAGE,
  PAGING,
  FANS_RESPONSE,
  GROUP_RESPONSE,
} from "@pages/LiveRoom/apis/facebook";
import {
  ACTIVITY,
  ACTIVITY_POST,
  PRODUCT,
  fetchActivity,
  getActivityPosts,
  fetchProdList,
  setEnableActivity,
  getProductCategories,
  PRODUCT_CATEGORY,
} from "@pages/LiveRoom/apis/legacy";
import { deleteDummyActivityPost } from "@pages/Activity/apis/legacy";

export interface State {
  fanPagesList: FANS_PAGE[] | null;
  groupList: GROUP_PAGE[] | null;
  activity: ACTIVITY | null;
  activityPosts: ACTIVITY_POST[] | null;
  activityProducts: PRODUCT[] | null;
  productCategories: PRODUCT_CATEGORY[] | null;
  status: "idle" | "loading" | "failed";
}

const initialState: State = {
  fanPagesList: null,
  groupList: null,
  activity: null,
  activityPosts: null,
  activityProducts: null,
  productCategories: [{ title: "所有分類", id: "default" }],
  status: "idle",
};
export const getActivityAsync = createAsyncThunk(
  "liveRoom/fetchActivity",
  async (params: { urlActivity: string; activityId: string }) => {
    const { urlActivity, activityId } = params;
    const res = await fetchActivity(urlActivity, activityId);
    // mock for test
    // let curActivity: ACTIVITY | null | any = null;
    // if (res[0]) {
    //   curActivity = res[0];
    // }
    // if (curActivity && res[1]) {
    //   const curDispatch: any = res[1];
    //   curDispatch.fb_fanspage_id = "153482594816011";
    //   curDispatch.fb_post_id = "153482594816011_249285231168626";
    //   curActivity["dispatch"] = curDispatch;
    // }

    return res;
  }
);

export const enableActivityAsync = createAsyncThunk(
  "liveRoom/enableActivity",
  async (params: {
    url: string;
    activityId: string;
    isEnable: boolean;
    onSuccess: Function;
  }) => {
    const { url, activityId, isEnable, onSuccess } = params;
    const res = await setEnableActivity(url, activityId, isEnable);
    onSuccess(res);
    return res;
  }
);

export const getActivityPostsAsync = createAsyncThunk(
  "liveRoom/fetchActivityPosts",
  async (params: { urlActivityPosts: string; activityId: string }) => {
    const { urlActivityPosts, activityId } = params;
    const curActivityPosts: ACTIVITY_POST[] = await getActivityPosts(
      urlActivityPosts,
      activityId
    );
    return curActivityPosts.reverse();
  }
);

const getAllFanpages = async (
  accessToken: string,
  onResult: Function,
  curPaging: PAGING | undefined = undefined,
  curPages: FANS_PAGE[] = []
) => {
  const curResult = await new Promise<FANS_RESPONSE>((resolve) => {
    const onFetchPagesSuccess = (res: FANS_RESPONSE) => {
      resolve(res);
    };
    getFansList(accessToken, onFetchPagesSuccess, curPaging?.cursors?.after);
  });
  const { data, paging } = curResult;
  if (data.length) {
    curPages = [...curPages, ...data];
  }
  if (paging === undefined) {
    onResult(curPages);
  }
  if (paging) {
    await getAllFanpages(accessToken, onResult, paging, curPages);
  }
};

export const getFanpagesAsync = createAsyncThunk(
  "liveRoom/fetchFanpages",
  async (params: { accessToken: string }) => {
    const curFanpages = await new Promise<FANS_PAGE[]>((resolve) => {
      const onFetchFanPagesSuccess = (res: FANS_PAGE[]) => {
        return resolve(res);
      };
      getAllFanpages(params.accessToken, onFetchFanPagesSuccess);
    });
    return curFanpages;
  }
);

const getAllGroups = async (
  userId: string,
  accessToken: string,
  onResult: Function,
  curPaging: PAGING | undefined = undefined,
  curPages: GROUP_PAGE[] = []
) => {
  const curResult = await new Promise<GROUP_RESPONSE>((resolve) => {
    const onFetchPagesSuccess = (res: GROUP_RESPONSE) => {
      if (Object.prototype.hasOwnProperty.call(res, "error")) {
        resolve({ data: [] });
      } else {
        resolve(res);
      }
    };
    getGroupList(
      userId,
      accessToken,
      onFetchPagesSuccess,
      curPaging?.cursors?.after
    );
  });
  const { data, paging } = curResult;
  if (data.length) {
    curPages = [...curPages, ...data];
  }
  if (paging === undefined) {
    onResult(curPages);
  }
  if (paging) {
    await getAllGroups(userId, accessToken, onResult, paging, curPages);
  }
};

export const getGroupAsync = createAsyncThunk(
  "liveRoom/fetchGroup",
  async (params: { userId: string; accessToken: string }) => {
    const curGroups = await new Promise<GROUP_PAGE[]>((resolve) => {
      const onFetchGroupsSuccess = (res: GROUP_PAGE[]) => {
        return resolve(res);
      };
      getAllGroups(params.userId, params.accessToken, onFetchGroupsSuccess);
    });
    return curGroups;
  }
);

export const getActivityProdsAsync = createAsyncThunk(
  "liveRoom/fetchActivityProducts",
  async (params: { urlProd: string; activityId: string }) => {
    const { urlProd, activityId } = params;
    const curProds = await fetchProdList(urlProd, activityId, "activity");
    return curProds;
  }
);

const getAllCategory = (
  source: PRODUCT_CATEGORY[],
  res: PRODUCT_CATEGORY[] = []
) => {
  source.forEach((category) => {
    res.push({ title: category.title, id: category.id });
    if (category?.children?.length) {
      getAllCategory(category.children, res);
    }
  });
};

export const getProductCategoriesAsync = createAsyncThunk(
  "liveRoom/fetchProductCategories",
  async (params: { url: string }) => {
    const { url } = params;
    const res = await getProductCategories(url);
    const refactorCategorty: PRODUCT_CATEGORY[] = [];
    getAllCategory(res, refactorCategorty);
    return refactorCategorty;
  }
);
export const deleteDummyActivityPostAsync = createAsyncThunk(
  "liveRoom/fetchDeleteDummyActivityPost",
  async (params: {
    url: string;
    activityId: string;
    postId: string;
    raw?: string;
    onSuccess: Function;
    onError: Function;
  }) => {
    const { url, activityId, postId, raw, onSuccess, onError } = params;
    const res = await deleteDummyActivityPost(
      url,
      activityId,
      postId,
      raw ?? "{}"
    );
    if (res.success) {
      onSuccess();
      return res;
    } else {
      onError();
      return res;
    }
  }
);

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addNewActivityPostToList: (state, action: PayloadAction<ACTIVITY_POST>) => {
      const newState = [
        action.payload,
        ...(state.activityPosts as ACTIVITY_POST[]),
      ];
      state.activityPosts = newState;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(getFanpagesAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getFanpagesAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.fanPagesList = action.payload;
      })
      .addCase(getFanpagesAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activity = action.payload;
      })
      .addCase(getActivityAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityPostsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityPostsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityPosts = action.payload;
      })
      .addCase(getActivityPostsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getActivityProdsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getActivityProdsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityProducts = action.payload;
      })
      .addCase(getActivityProdsAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(enableActivityAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enableActivityAsync.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(enableActivityAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getProductCategoriesAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProductCategoriesAsync.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          state.productCategories = [
            ...(state.productCategories as PRODUCT_CATEGORY[]),
            ...action.payload,
          ];
        }
      })
      .addCase(getProductCategoriesAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getGroupAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getGroupAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.groupList = action.payload;
      })
      .addCase(getGroupAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteDummyActivityPostAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDummyActivityPostAsync.fulfilled, (state, action) => {
        state.status = "idle";
        const deletedItemId = `${action.meta.arg.activityId}_${action.meta.arg.postId}`;
        const newState = (state.activityPosts as ACTIVITY_POST[]).filter(
          (item) => item.id !== deletedItemId
        );
        state.activityPosts = newState;
      })
      .addCase(deleteDummyActivityPostAsync.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { addNewActivityPostToList } = activitySlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectFangages = (state: RootState) => state.activity.fanPagesList;
export const selectActivity = (state: RootState) => state.activity.activity;
export const selectActivityPosts = (state: RootState) =>
  state.activity.activityPosts;
export const selectActivityProducts = (state: RootState) =>
  state.activity.activityProducts;
export const selectProductCategories = (state: RootState) =>
  state.activity.productCategories;
export const selectGroups = (state: RootState) => state.activity.groupList;
export default activitySlice.reducer;
