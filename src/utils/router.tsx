import React, { Suspense } from "react";
import { Outlet, Route } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Layout from "components/Layout";
// import ViewAuth from "components/ViewAuth";
import NotPreparedRemind from "@components/NotPreparedRemind";
export type RouterItem = {
  name: string;
  path: string;
  children?: Array<RouterItem>;
  component?: Function;
  layout?: any; // common layout or custom layout
  hidden?: boolean;
  isAuthRoute?: boolean;
  meta?: {
    title: string;
    icon?: JSX.Element;
  };
  includeLayout?: boolean;
};

export function renderRouter(item: RouterItem) {
  return (
    <Route
      key={item.name}
      path={item.path}
      element={
        <Suspense fallback={<CircularProgress />}>
          {item.children ? <Outlet /> : item.component && <item.component />}
        </Suspense>
      }
    >
      {item.children && item.children.map((child) => renderRouter(child))}
    </Route>
  );
}

/**
 * render by HOC，render children component
 * @param Component route component
 * @returns
 */
const wrapComponent = (Component: React.ElementType | null = null) => {
  return (props: any) => {
    const { header, isAuthRoute, includeLayout, path, ...restProps } = props;

    return (
      <>
        {/* <ViewAuth isAuthRoute={isAuthRoute}> */}
        <NotPreparedRemind>
          <Layout includeLayout={includeLayout}>
            <div>{Component && <Component {...restProps} />}</div>
          </Layout>
        </NotPreparedRemind>
        {/* </ViewAuth> */}
      </>
    );
  };
};

/**
 * render routes which includes common route and auth route
 * @param list route list config
 * @returns
 */
export const renderRoutes = (list: Array<RouterItem>) => {
  return list.map((route) => {
    const { path, component, layout, name, isAuthRoute, includeLayout } = route;
    const WrappedComponent = wrapComponent(component as React.ElementType);
    return (
      <Route
        key={name}
        path={path}
        element={
          <WrappedComponent
            {...layout}
            isAuthRoute={isAuthRoute}
            includeLayout={includeLayout}
            path={path}
          />
        }
      >
        {renderRouter(route)}
      </Route>
    );
  });
};
