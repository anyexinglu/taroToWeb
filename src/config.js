import * as Path from "path";

const root = Path.join(__dirname, "../");
export default {
  root,
  srcRoot: __dirname,
  demoRoot: Path.join(root, "/demo"),
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
