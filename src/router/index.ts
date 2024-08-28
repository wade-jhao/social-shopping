import { lazy } from "react";
import { RouterItem } from "utils";
import { isMobileBrowser } from "@utils/common";

const commonPath = "/";

const routeList: Array<RouterItem> = [
  {
    name: "login",
    path: `${commonPath}login`,
    component: lazy(() => import("@pages/Login")),
    isAuthRoute: false,
    includeLayout: false,
  },
  {
    name: "home",
    path: `${commonPath}home`,
    component: lazy(() => import("@pages/Home")),
    isAuthRoute: true,
  },
  {
    name: "livehost",
    path: `${commonPath}livehost/activities/:activityId/posts/:postId`,
    component: lazy(() => import("@pages/LiveHost")),
    isAuthRoute: true,
    includeLayout: false,
  },
  {
    name: "liveRoom",
    path: `${commonPath}liveroom/activities/:activityId/posts/:postId`,
    component: lazy(() =>
      isMobileBrowser()
        ? import("@pages/MobileLiveRoom")
        : import("@pages/LiveRoom")
    ),
    isAuthRoute: true,
    includeLayout: false,
  },
  {
    name: "error",
    path: `${commonPath}liveroom/activities/:activityId/errors/:type`,
    component: lazy(() => import("@pages/AccessTokenExpired")),
    isAuthRoute: true,
  },
  {
    name: "activity",
    path: `${commonPath}liveroom/activities/:activityId`,
    component: lazy(() => import("@pages/Activity")),
    isAuthRoute: true,
  },
  {
    name: "draft",
    path: `${commonPath}liveroom/draft/activities/:activityId/posts/:postId`,
    component: lazy(() =>
      isMobileBrowser() ? import("@pages/MobileDraft") : import("@pages/Draft")
    ),
    isAuthRoute: true,
    includeLayout: false,
  },
];

export { routeList };
