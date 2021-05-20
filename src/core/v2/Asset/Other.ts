import * as fs from "fs-extra";
import config from "../config";
import { writeFile } from "../util";

let { output } = config;

export default class Other {
  fileEntryPath: string;
  code: string;

  constructor(filePath: string) {
    this.fileEntryPath = filePath;
  }

  parse() {
    const input = fs.readFileSync(this.fileEntryPath);
    const code = input.toString();
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
