import * as fs from "fs";
import { parse, traverse } from "@babel/core";
import * as Path from "path";
import config from "../config";

const { promises } = fs;

// const exts = [".ts", ".json", ".scss", ".tsx"];

const { demoRoot } = config;
// console.log("...config", config, config.root, config.demoRoot);

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};

async function build() {
  const { entry } = paths;
  // const input = await promises.readFile(entry);
  // const ast = await parse(input.toString(), { filename: entry });
  // const type = Path.extname(entry);
  const { pages } = require(Path.join(demoRoot, entry)).default;

  // console.log("...entry", entry, type, pages);

  pages.forEach(async (page: string) => {
    const pageEntryPath = Path.join(demoRoot, "src", `${page}.tsx`);
    console.log("pageEntryPath", pageEntryPath);

    const input = await promises.readFile(pageEntryPath);
    const ast = await parse(input.toString(), { filename: pageEntryPath });
    // const pluginAst = await parse(input.toString(), {
    //   filename: pageEntryPath, // "file.tsx",
    //   // sourceType: "module",
    //   // plugins: ["jsx"],
    // });
    console.log("...ast", ast);
    traverse(ast, {
      // 进行 ast 转换
      Identifier(_path) {
        console.log("...path", ...arguments);
        // 遍历变量的visitor
        // ...
      },
      // 其他的visitor遍历器
    });
  });
}

build();
// let entry = fs.readFileSync(paths.entry, "utf8");
// const ast = parse(entry);
// console.log("...entry", entry, ast);

// 2. 遍历 pages，针对每个 page，读取页面入口文件

// 3. 组件依赖收集，作为 dep

// 4. 组件 tagName 及生命周期替换（目前先只支持函数组件，未来扩展支持类组件），读取 navigationBarTitleText 等设置标题
