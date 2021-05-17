import * as Path from "path";
import * as fs from "fs-extra";
import * as recast from "recast";
// TODO
import * as t from "@babel/types";
import config from "../../../config";
import { writeFile, prettierFormat } from "../util";

const { parse, visit, print } = recast;

let { demoRoot, output: commonOutput, ui } = config; // , output: commonOutput, templateRoot, root
const { rawTagMap, fromLibrary, toLibrary, libraryTagMap } = ui;
let output = commonOutput + "/v2";

export default class Page {
  pagePath: string;
  deps: any[];
  ast: any;

  constructor(pagePath: string) {
    this.pagePath = pagePath;
    this.deps = [];
    console.log("this...", this);
  }

  async parse() {
    console.log("...this in parse", this);
    const fileEntryPath = Path.join(demoRoot, "src", `${this.pagePath}.tsx`);
    const input = await fs.readFile(fileEntryPath);
    const code = input.toString();
    const deps = this.deps;
    this.ast = parse(code, {
      // babel 才认识 ts，内置的 esprima 不支持
      parser: require("recast/parsers/babel"),
    });
    visit(this.ast, {
      // TODO
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
    // console.log("...page ast", this.ast);
  }

  print() {
    const { code: outputCode } = print(this.ast);
    console.log("...outputCode", outputCode);
    const fileEntryPath = Path.join(demoRoot, "src", `${this.pagePath}.tsx`);
    const relativePath = fileEntryPath.split("demo")[1];
    console.log(
      "...${output}${relativePath}",
      relativePath,
      `${output}${relativePath}`
    );

    writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
    return outputCode;
  }
}
