import * as fs from "fs";
import { parse } from "@babel/core";
// import path from 'path'
import config from "../config";

const { promises } = fs;

// console.log("...config", config, fs);

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};
async function build() {
  const input = await promises.readFile(paths.entry);
  const ast = await parse(input.toString(), { filename: paths.entry });

  console.log("...entry", ast);
}

build();
// let entry = fs.readFileSync(paths.entry, "utf8");
// const ast = parse(entry);
// console.log("...entry", entry, ast);

// 2. 遍历 pages，针对每个 page，读取页面入口文件

// 3. 组件依赖收集，作为 dep

// 4. 组件 tagName 及生命周期替换（目前先只支持函数组件，未来扩展支持类组件），读取 navigationBarTitleText 等设置标题
