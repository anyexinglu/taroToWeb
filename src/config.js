import * as Path from "path";

export default {
  root: __dirname,
  demoRoot: Path.join(__dirname, "../demo"),
  ui: {
    fromLibrary: "@tarojs/components",
    toLibrary: "antd",
    libraryTagMap: {
      // Button: "IButton",
    },
    rawTagMap: {
      View: "div",
      Text: { tag: "span", className: "tagText" },
    },
  },
  output: "output",
  /**
   * 'src/app.config.ts': 配置入口文件
   * '${path}/index.tsx'：页面文件
   */
  pathMap: {},
};
