import * as fs from "fs-extra";
import { transform } from "@babel/core";
// import generator from "@babel/generator";
// import traverse from "@babel/traverse";
// import { parse } from "@babel/parser";
import * as recast from "recast";
import * as Path from "path";
import * as t from "@babel/types";
import config from "../../config";
import treeShake from "./shake";
import * as ejs from "ejs";
import {
  writeFile,
  // deleteAll,
  prettierFormat,
  findJsxFile,
  findRealFile,
} from "./util";

const { parse: rparse, print } = recast;

// const exts = [".ts", ".json", ".scss", ".tsx"];

let { demoRoot, ui, output: commonOutput, templateRoot, root } = config;
let output = commonOutput + "/v2";
const { rawTagMap, fromLibrary, toLibrary, libraryTagMap } = ui;
// console.log("...config", config, config.root, config.demoRoot);

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};

const transformJsx = async (fileEntryPath: string, callback) => {
  const input = await fs.readFile(fileEntryPath);
  const code = input.toString();
  let deps: any = [];

  const ast = rparse(code, {
    // babel 才认识 ts，内置的 esprima 不支持
    parser: require("recast/parsers/babel"),
  });
  console.log("...fileEntryPath", fileEntryPath);

  recast.visit(ast, {
    // visitProgram: (_ctx: any, path: any) => {
    //   treeShake(path.scope);
    // },
    visitImportDeclaration(nodePath) {
      const path = nodePath.value;
      const from = path.source.value;
      const specifiers = path.specifiers || [];

      // console.log("...visitImportDeclaration path", from, specifiers);

      // console.log("...path", from, path?.node);
      if (from === fromLibrary) {
        path.source.value = toLibrary;
        let newSpecifiers = specifiers.reduce((result, item) => {
          // console.log("...item", item, item.imported);
          const name = item.imported.name;
          const rawItem = rawTagMap[name];
          const libraryItem = libraryTagMap[name];
          if (libraryItem) {
            const newName = libraryItem?.tag || libraryItem;
            item.imported.name = newName;
            item.local.name = newName;
            // console.log("...result", name, newName);
            return [...result, item];
          } else if (!rawItem) {
            return [...result, item];
          }
          return result;
        }, []);
        path.specifiers = newSpecifiers;
        // 如果出现 `import "antd"` 这种形式，remove 掉 path
        if (!newSpecifiers?.length) {
          nodePath.replace(); // replace() 即删除
        }
      } else if (from && from.startsWith(".")) {
        // 相对路径引入
        if (from.split("/").pop().includes(".")) {
          // console.log("....from", from);
          // path.node.source.value = "...."; // ele.replaceWith("...");
          deps.push({
            pathStr: from, //path.node.source.value,
            node: path.node,
          });
        } else {
          // console.log("..else..from", from);
          deps.push({
            pathStr: from, //path.node.source.value,
            node: path.node,
          });
        }
      } else if (from === "@tarojs/taro") {
        path.source.value = "@/utils/taro";
      }

      return false;
    },
    visitJSXElement(nodePath) {
      const path = nodePath.value;
      const openingElement = path?.openingElement;
      const openingElementNode = openingElement?.name;
      const closingElementNode = path?.closingElement?.name;
      const tag = openingElementNode?.name;
      // console.log("...tag", tag);
      // if (tag === "Text") {
      //   debugger;
      // }
      const allTagMap = { ...rawTagMap, ...libraryTagMap };
      let target = allTagMap[tag];
      if (target) {
        const tagName = target.tag || target;
        openingElementNode.name = tagName;
        if (typeof target === "object") {
          const { className } = target;
          if (className) {
            const attributes = openingElement.attributes;
            let existedClassName = (attributes || []).find((item) => {
              const attributeName = item.name.name;
              return attributeName === "className";
            });
            if (existedClassName?.value) {
              existedClassName.value += ` ${className}`;
            } else {
              if (!attributes) {
                openingElement.attributes = [];
              }
              const newAttribute = t.jSXAttribute(
                t.jsxIdentifier("className"),
                t.stringLiteral(className)
              );
              openingElement.attributes.push(newAttribute);
            }
          }
        }
        if (closingElementNode) {
          closingElementNode.name = tagName;
        }
      }
      this.traverse(nodePath);
    },
  });

  const { code: outputCode } = print(ast);
  const relativePath = fileEntryPath.split("demo")[1];

  // console.log("...deps", fileEntryPath, deps);
  // console.log("...result code", prettierFormat(outputCode));
  // fs.mkdirSync("output");
  // fs.mkdirSync(`${output}/${pageEntryPath}`);
  callback?.(deps, fileEntryPath);
  writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
};

const pipeNormalFile = async (originFileEntryPath: string) => {
  const fileEntryPath = await findRealFile(originFileEntryPath);
  const input = await fs.readFile(fileEntryPath);
  const code = input.toString();
  // console.log("...fileEntryPath", fileEntryPath, code);

  const isJs = ["js", "ts"].includes(fileEntryPath.split(".").pop() || "");
  if (isJs) {
    // let deps: any = [];
    transform(
      code,
      {
        ast: true,
        filename: fileEntryPath,
        plugins: [
          function () {
            return {
              visitor: {
                Program: (path, _asset) => {
                  treeShake(path.scope);
                },
                // Identifier(path, state) {},
                // ASTNodeTypeHere(path, state) {},
                ImportDeclaration(path) {
                  const from = path?.node?.source?.value;
                  // const specifiers = path?.node?.specifiers || [];
                  // console.log("...path", from, path?.node);
                  if (from && from.startsWith(".")) {
                    // 相对路径引入，拷贝文件
                    // deps.push({
                    //   pathStr: from, //path.node.source.value,
                    //   node: path.node,
                    // });
                    let normalFile = Path.join(fileEntryPath, "../", from);
                    pipeNormalFile(normalFile);
                  } else if (from === "@tarojs/taro") {
                    path.node.source.value = "@/utils/taro";
                  }
                },
              },
            };
          },
        ],
      },
      function (_err, result) {
        console.log("...err", _err);
        const { code: outputCode } = result || {};
        const relativePath = fileEntryPath.split("demo")[1];

        // console.log("...result code", fileEntryPath, code, outputCode);
        // console.log("...result code", prettierFormat(outputCode));
        // fs.mkdirSync("output");
        // fs.mkdirSync(`${output}/${pageEntryPath}`);

        writeFile(`${output}${relativePath}`, outputCode);
      }
    );
  } else {
    const relativePath = fileEntryPath.split("demo")[1];
    writeFile(`${output}${relativePath}`, code);
  }
};

async function build() {
  const { entry } = paths;
  const { pages, subpackages } = require(Path.join(demoRoot, entry)).default;

  console.log(
    "...entry",
    entry,
    root,
    findJsxFile,
    transformJsx,
    demoRoot,
    pages
  );
  fs.removeSync(output);
  // deleteAll(output);
  fs.copySync(templateRoot, output);
  generateRoutes();

  const allPages = [
    ...pages,
    ...subpackages.reduce((total, item) => {
      let subTotal = item.pages.map((page) => `${item.root}/${page}`);
      return [...total, ...subTotal];
    }, []),
  ];

  // console.log("...allPages", allPages);

  allPages.forEach(async (page: string) => {
    const pageEntryPath = Path.join(demoRoot, "src", `${page}.tsx`);
    // console.log("pageEntryPath", pageEntryPath);

    // const input = await fs.readFile(pageEntryPath);
    // const code = input.toString();
    const callback = (deps, referPath: string) => {
      deps.forEach(async (dep) => {
        let jsxFilePath = await findJsxFile(
          Path.join(pageEntryPath, "../", `${dep.pathStr}`)
        );
        if (jsxFilePath) {
          // console.log("...depPath", pageEntryPath, jsxFilePath);
          // eslint-disable-next-line no-shadow
          transformJsx(jsxFilePath, callback);
        } else {
          let normalFile = Path.join(referPath, "../", `${dep.pathStr}`);
          pipeNormalFile(normalFile);
          // writeFile(`${output}${dep.pathStr}`, prettierFormat(outputCode));
        }
      });
    };

    transformJsx(pageEntryPath, callback);
  });
}

function generateRoutes() {
  const appConf = require(Path.join(demoRoot, "src/app.config.ts")).default;
  console.log("...appConf", appConf);
  const routes = [
    {
      path: "/",
      componentPath: appConf.pages[0],
    },
  ];
  appConf.subpackages.forEach((element) => {
    element.pages.forEach((page) => {
      routes.push({
        path: `/${element.root}/${page}`.replace(/\/index$/, ""),
        componentPath: `${element.root}/${page}`,
      });
    });
  });
  const templateContent = fs
    .readFileSync(Path.join(templateRoot, "src/routes.ejs"))
    .toString();

  const result = ejs.render(templateContent, {
    routes,
  });

  writeFile(`${output}/src/routes.tsx`, prettierFormat(result));
}

build();
