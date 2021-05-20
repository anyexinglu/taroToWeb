import * as Path from "path";
import * as fs from "fs-extra";
import * as recast from "recast";
import * as t from "@babel/types";
import config from "../config";
import { writeFile, prettierFormat, findJsxFile } from "../util";
import Js from "./Js";
import Other from "./Other";

const { parse, visit, print } = recast;

let { output, ui } = config;
const { rawTagMap, fromLibrary, toLibrary, libraryTagMap } = ui;
export default class Jsx {
  fileEntryPath: string;
  deps: any[];
  ast: any;

  constructor(filePath: string) {
    this.fileEntryPath = findJsxFile(filePath);
    console.log("...jsx filePath", filePath, this.fileEntryPath);
    this.deps = [];
  }

  parse() {
    const fileEntryPath = this.fileEntryPath;
    const input = fs.readFileSync(fileEntryPath);
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
        if (from === fromLibrary) {
          path.source.value = toLibrary;
          let newSpecifiers = specifiers.reduce((result, item) => {
            const name = item.imported.name;
            const rawItem = rawTagMap[name];
            const libraryItem = libraryTagMap[name];
            if (libraryItem) {
              const newName = libraryItem?.tag || libraryItem;
              item.imported.name = newName;
              item.local.name = newName;
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
          let depFilePath = Path.join(fileEntryPath, "../", from);
          console.log("....from", from, depFilePath);
          if (findJsxFile(depFilePath)) {
            deps.push({
              from,
              pagePath: depFilePath,
              file: new Jsx(depFilePath),
            });
          } else {
            depFilePath = Path.join(fileEntryPath, "../", `${from}`);
            const isOther = from.split("/").pop().includes(".");
            deps.push({
              from,
              pagePath: depFilePath,
              file: isOther ? new Other(depFilePath) : new Js(depFilePath),
            });
          }
          // TODO @utils 的方式引入
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
  }

  print() {
    const { code: outputCode } = print(this.ast);
    const fileEntryPath = this.fileEntryPath;
    const relativePath = fileEntryPath.split("demo")[1];
    console.log(
      "jsx output",
      relativePath,
      `${output}${relativePath}`,
      this.deps
    );

    writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
    this.deps.forEach(async (dep) => {
      let { file } = dep;
      if (file) {
        file.parse();
        file.print();
      }
    });
    return outputCode;
  }
}
