import * as fs from "fs";
import * as prettier from "prettier";
import * as ejs from "ejs";
import * as Path from "path";
import config from "./config";
let { output, templateRoot } = config;

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

export function findJsxFile(basePath: string) {
  if (basePath.includes(".tsx") || basePath.includes(".jsx")) {
    return basePath;
  }
  let jsExtensions = [".tsx", ".jsx", "/index.tsx", "/index.jsx"];
  for (let i = 0; i < jsExtensions.length; i++) {
    const path = basePath + jsExtensions[i];
    const isExist = fs.existsSync(path);

    if (isExist) {
      return path;
    }
  }
  return "";
}

export function findRealFile(basePath: string) {
  let fileExtensions = [".ts", ".js", "/index.ts", "/index.js"];
  const hasExtension = (basePath.split("/").pop() || "").includes(".");
  if (hasExtension) {
    return basePath;
  }
  for (let i = 0; i < fileExtensions.length; i++) {
    const path = basePath + fileExtensions[i];
    const isExist = fs.existsSync(path);

    if (isExist) {
      return path;
    }
  }
  return basePath;
}

// 创建路由配置
export function generateRoutes(pages, subpackages) {
  const routes = [
    {
      path: "/",
      componentPath: pages[0],
    },
  ];
  subpackages.forEach((element) => {
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
