import * as fs from "fs-extra";
import config from "../../../config";
import { writeFile } from "../util";

let { output: commonOutput } = config; // , output: commonOutput, templateRoot, root
let output = commonOutput + "/v2";

export default class Other {
  fileEntryPath: string;
  code: string;

  constructor(filePath: string) {
    this.fileEntryPath = filePath;
    console.log("Other this...", this);
  }

  async parse() {
    const input = await fs.readFile(this.fileEntryPath);
    const code = input.toString();
    console.log("....do nothing", this.fileEntryPath, code);
    this.code = code;
  }

  print() {
    const relativePath = this.fileEntryPath.split("demo")[1];
    console.log(
      "...other output",
      relativePath,
      `${output}${relativePath}`,
      this.code
    );

    writeFile(`${output}${relativePath}`, this.code);
    return this.code;
  }
}
