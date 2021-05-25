import * as fs from "fs";
import * as prettier from "prettier";
// import * as ejs from "ejs";
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
  fs.writeFileSync(path, code, {
    encoding: "utf8",
  });
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
