import * as fs from "fs";
import { transform } from "@babel/core";
// import generate from "@babel/generator";
// import { parse } from "@babel/core";
import * as Path from "path";
import * as t from "@babel/types";
import config from "../config";
import treeShake from "./shake";
import { writeFile, deleteAll, prettierFormat } from "./util";
// const treeShake = require("./shake");

console.log("...treeShake", treeShake);

const { promises } = fs;

// const exts = [".ts", ".json", ".scss", ".tsx"];

const { demoRoot, ui, output } = config;
const { rawTagMap, fromLibrary, toLibrary, libraryTagMap } = ui;
// console.log("...config", config, config.root, config.demoRoot);

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};

const transformJsx = async (fileEntryPath: string, callback) => {
  const input = await promises.readFile(fileEntryPath);
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
                      console.log("...result", name, newName);
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
                } else if (
                  from &&
                  from.startsWith(".") &&
                  !from.split("/").pop().includes(".")
                ) {
                  console.log("....from", from);
                  // path.node.source.value = "...."; // ele.replaceWith("...");
                  deps.push({
                    pathStr: from, //path.node.source.value,
                    node: path.node,
                  });
                }
              },
              JSXElement(path) {
                const openingElement = path?.node?.openingElement;
                const openingElementNode = openingElement?.name;
                const closingElementNode = path?.node?.closingElement?.name;
                const tag = openingElementNode?.name;
                console.log("...tag", tag);
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
              //     console.log("tag", tag, tag);

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
      console.log("...err", _err);
      const relativePath = fileEntryPath.split("demo")[1];

      console.log("...result code", outputCode);
      console.log("...result code", prettierFormat(outputCode));
      // fs.mkdirSync("output");
      // fs.mkdirSync(`${output}/${pageEntryPath}`);
      callback?.(deps);
      writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
    }
  );
  // return deps;
};

async function build() {
  const { entry } = paths;
  const { pages } = require(Path.join(demoRoot, entry)).default;
  deleteAll(output);

  pages.forEach(async (page: string) => {
    const pageEntryPath = Path.join(demoRoot, "src", `${page}.tsx`);
    console.log("pageEntryPath", pageEntryPath);

    // const input = await promises.readFile(pageEntryPath);
    // const code = input.toString();
    const callback = (deps) => {
      console.log("...deps", deps);
      deps.forEach(async (dep) => {
        let depPath = await findJsFile(
          Path.join(pageEntryPath, "../", `${dep.pathStr}`)
        );
        console.log("...depPath", pageEntryPath, `${dep.pathStr}.tsx`, depPath);
        depPath && transformJsx(depPath, callback);
      });
    };

    transformJsx(pageEntryPath, callback);
  });
}

// TODO 或许和真实规则不同
let jsExtensions = [".tsx", ".ts", ".jsx", ".js"];
async function findJsFile(basePath: string) {
  for (let i = 0; i < jsExtensions.length; i++) {
    const path = basePath + jsExtensions[i];
    const isExist = await fs.existsSync(path);
    const indexPath = basePath + "/index" + jsExtensions[i];

    if (isExist) {
      return path;
    } else {
      const isIndexExist = await fs.existsSync(indexPath);
      if (isIndexExist) {
        return indexPath;
      }
    }
  }
  return "";
}

build();
