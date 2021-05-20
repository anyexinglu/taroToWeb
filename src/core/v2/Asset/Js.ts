import * as Path from "path";
import * as fs from "fs-extra";
import * as recast from "recast";
import Other from "./Other";
import config from "../../../config";
import { writeFile, prettierFormat, findRealFile } from "../util";

const { parse, visit, print } = recast;

let { output: commonOutput } = config; // , output: commonOutput, templateRoot, root
// const { rawTagMap, fromLibrary, toLibrary, libraryTagMap } = ui;
let output = commonOutput + "/v2";

export default class Js {
  filePath: string;
  fileEntryPath: string;
  deps: any[];
  ast: any;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.deps = [];
    console.log("Js this...", this);
  }

  async parse() {
    const fileEntryPath = await findRealFile(this.filePath);
    this.fileEntryPath = fileEntryPath;
    const input = await fs.readFile(fileEntryPath);
    const code = input.toString();

    const deps = this.deps;
    this.ast = parse(code, {
      // babel 才认识 ts，内置的 esprima 不支持
      parser: require("recast/parsers/babel"),
    });
    visit(this.ast, {
      visitImportDeclaration(nodePath) {
        const path = nodePath.value;
        const from = path.source.value;
        // const specifiers = path?.node?.specifiers || [];
        // console.log("...path", from, path?.node);
        if (from && from.startsWith(".")) {
          let depFilePath = Path.join(fileEntryPath, "../", from);
          const isOther = from.split("/").pop().includes(".");
          deps.push({
            from,
            pagePath: depFilePath,
            file: isOther ? new Other(depFilePath) : new Js(depFilePath),
          });
          console.log("...isOther", isOther, depFilePath);
          // pipeNormalFile(normalFile);
        } else if (from === "@tarojs/taro") {
          path.node.source.value = "@/utils/taro";
        }
        return false;
      },
    });
  }

  print() {
    const { code: outputCode } = print(this.ast);
    const relativePath = this.fileEntryPath.split("demo")[1];
    console.log(
      "Js output",
      relativePath,
      `${output}${relativePath}`,
      outputCode
    );

    writeFile(`${output}${relativePath}`, prettierFormat(outputCode));
    this.deps.forEach(async (dep) => {
      let { file } = dep;
      if (file) {
        await file.parse();
        await file.print();
      }
    });
    return outputCode;
  }
}
