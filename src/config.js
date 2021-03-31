import * as Path from "path";

export default {
  root: __dirname,
  demoRoot: Path.join(__dirname, "../demo"),
  ui: {
    // fromLibrary: "@tarojs/components",
    // toLibrary: "antd",
    // uiMap: {
    //   View: "div",
    // },
    tagMap: {
      View: { tag: "div" },
      Text: { tag: "span", className: "tagText" },
    },
  },
  /**
   * 'src/app.config.ts': 配置入口文件
   * '${path}/index.tsx'：页面文件
   */
  pathMap: {},
};
