import * as fs from "fs";
import * as prettier from "prettier";
import * as Path from "path";

/**
 * 递归创建目录
 */
export const makeDirs = (path) => {
  if (fs.existsSync(path)) {
    return true;
  }
  if (makeDirs(Path.dirname(path))) {
    fs.mkdirSync(path);
    return true;
  }
};

// export function deleteAll(path) {
//   let files: any[] = [];
//   if (fs.existsSync(path)) {
//     files = fs.readdirSync(path);
//     files.forEach(function (file, _index) {
//       let curPath = path + "/" + file;
//       if (fs.statSync(curPath).isDirectory()) {
//         // recurse
//         deleteAll(curPath);
//       } else {
//         // delete file
//         fs.unlinkSync(curPath);
//       }
//     });
//     fs.rmdirSync(path);
//   }
// }

// 指定路径下创建文件并写入 code
export const writeFile = (path, code) => {
  let lastSlash = path.lastIndexOf("/");
  let dir;
  if (lastSlash >= 0) {
    dir = path.slice(0, lastSlash);
  }
  if (dir) {
    makeDirs(dir);
  }
  fs.writeFileSync(path, code);
};

export function prettierFormat(text: string) {
  return prettier.format(text, {
    parser: "babel", // "babel-ts",
    arrowParens: "always",
    bracketSpacing: true,
    embeddedLanguageFormatting: "auto",
    htmlWhitespaceSensitivity: "css",
    insertPragma: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: "preserve",
    quoteProps: "as-needed",
    requirePragma: false,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    useTabs: false,
    vueIndentScriptAndStyle: false,
    // parser: "babel-ts",
    // semi: false,
    // tabWidth: 2,
    // printWidth: 100,
    // singleQuote: true,
    // trailingComma: "none",
    // arrowParens: "avoid",
  });
}

export async function findJsxFile(basePath: string) {
  // TODO 或许和真实规则不同
  let jsExtensions = [".tsx", ".jsx", "/index.tsx", "/index.jsx"];
  for (let i = 0; i < jsExtensions.length; i++) {
    const path = basePath + jsExtensions[i];
    const isExist = await fs.existsSync(path);

    if (isExist) {
      return path;
    }
  }
  return "";
}

export async function findRealFile(basePath: string) {
  let fileExtensions = [".ts", ".js", "/index.ts", "/index.js"];
  const hasExtension = (basePath.split("/").pop() || "").includes(".");
  if (hasExtension) {
    return basePath;
  }
  for (let i = 0; i < fileExtensions.length; i++) {
    const path = basePath + fileExtensions[i];
    const isExist = await fs.existsSync(path);

    if (isExist) {
      return path;
    }
  }
  return basePath;
}
