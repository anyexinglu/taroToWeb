import React from "react";
import Loadable from "react-loadable";

const Loading = () => <div>loading...</div>;
const render = (loaded, props) => {
  let Component = loaded.default;
  return <Component {...props} />;
};
const loadableConf = {
  render,
  loading: Loading,
};

export default [
  {
    path: "/",
    exact: true,
    component: Loadable({
      loader: () => import("./pages/index/index"),
      ...loadableConf,
    }),
  },
  {
    path: "/list",
    exact: true,
    component: Loadable({
      loader: () => import("./list/index/index"),
      ...loadableConf,
    }),
  },
];
