import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import commonSlice from "./commonSlice";
import liveRoomSlice from "./liveroomSlice";
import apiSlice from "./apiSlice";
import activitySlice from "./activitySlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    common: commonSlice,
    liveRoom: liveRoomSlice,
    apis: apiSlice,
    activity: activitySlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
