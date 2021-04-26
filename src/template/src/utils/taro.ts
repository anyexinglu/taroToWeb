// Reference：https://github.com/ReactTraining/history/blob/v4.10.1/modules/createBrowserHistory.js#L190
// TODO 编译成传入 props.history
export const navigateTo = ({ history, url }) => {
  if (history && url) {
    history.push(url);
  } else {
    try {
      // https://github.com/ReactTraining/history/blob/master/packages/history/index.ts#L779
      window.location.href = url;
      // window.history.pushState({}, "", url);
    } catch (e) {
      console.error("navigateTo 跳转配置错误", { history, url, e });
    }
  }
};
export const redirectTo = ({ history, url }) => {
  if (history && url) {
    history.replace(url);
  } else {
    try {
      window.location.href = url;
      // window.history.replaceState({}, "", url);
    } catch (e) {
      console.error("redirectTo 跳转配置错误", { history, url, e });
    }
  }
};
