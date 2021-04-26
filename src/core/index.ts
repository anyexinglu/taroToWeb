import * as fs from "fs-extra";
import { transform } from "@babel/core";
// import generate from "@babel/generator";
// import { parse } from "@babel/core";
import * as Path from "path";
import * as t from "@babel/types";
import config from "../config";
import treeShake from "./shake";
import * as ejs from "ejs";
import {
  writeFile,
  // deleteAll,
  prettierFormat,
  findJsxFile,
  findRealFile,
} from "./util";

// const exts = [".ts", ".json", ".scss", ".tsx"];

const { demoRoot, ui, output, root } = config;
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
                const specifiers = path?.node?.specifiers || [];
                // console.log("...path", from, path?.node);
                if (from === fromLibrary) {
                  path.node.source.value = toLibrary;
                  let newSpecifiers = specifiers.reduce((result, item) => {
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
                  path.node.specifiers = newSpecifiers;
                  // 如果出现 `import "antd"` 这种形式，remove 掉 path
                  if (!newSpecifiers?.length) {
                    path.remove();
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
                  path.node.source.value = "@/utils/taro";
                }
              },
              JSXElement(path) {
                const openingElement = path?.node?.openingElement;
                const openingElementNode = openingElement?.name;
                const closingElementNode = path?.node?.closingElement?.name;
                const tag = openingElementNode?.name;
                // console.log("...tag", tag);
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
              },
              // JSXIdentifier(path) {
              //   // console.log("...JSXIdentifier", path);
              //   const name = path.node.name;
              //   let target = tagMap[name];
              //   if (target) {
              //     const { tag } = target;
              //     // console.log("tag", tag, tag);

              //     path.node.name = tag;
              //     // path.replaceWith()
              //   }
              // },
            },
          };
        },
      ],
    },
    function (_err, result) {
      const { code: outputCode } = result;
      // console.log("...err", _err);
      const relativePath = fileEntryPath.split("demo")[1];

      console.log("...deps", fileEntryPath, deps);
      // console.log("...result code", prettierFormat(outputCode));
      // fs.mkdirSync("output");
      // fs.mkdirSync(`${output}/${pageEntryPath}`);
      callback?.(deps, fileEntryPath);
      writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
    }
  );
  // return deps;
};

const pipeNormalFile = async (originFileEntryPath: string) => {
  const fileEntryPath = await findRealFile(originFileEntryPath);
  const input = await fs.readFile(fileEntryPath);
  const code = input.toString();
  console.log("...fileEntryPath", fileEntryPath, code);

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

        console.log("...result code", fileEntryPath, code, outputCode);
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
  fs.copySync(Path.join(__dirname, "../template"), Path.join(root, "output"));
  generateRoutes();

  const allPages = [
    ...pages,
    ...subpackages.reduce((total, item) => {
      let subTotal = item.pages.map((page) => `${item.root}/${page}`);
      return [...total, ...subTotal];
    }, []),
  ];

  console.log("...allPages", allPages);

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
    .readFileSync(Path.join(__dirname, "../template/src/routes.ejs"))
    .toString();

  const result = ejs.render(templateContent, {
    routes,
  });

  writeFile(`${output}/src/routes.tsx`, prettierFormat(result));
}

build();
