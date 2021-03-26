import * as fs from "fs";
import { transform } from "@babel/core";
import * as Path from "path";
import config from "../config";

const { promises } = fs;

// const exts = [".ts", ".json", ".scss", ".tsx"];

const { demoRoot, ui } = config;
const { tagMap } = ui;
// console.log("...config", config, config.root, config.demoRoot);

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};

async function build() {
  const { entry } = paths;
  // const input = await promises.readFile(entry);
  // const ast = await parse(input.toString(), { filename: entry });
  // const type = Path.extname(entry);
  const { pages } = require(Path.join(demoRoot, entry)).default;

  // console.log("...entry", entry, type, pages);

  pages.forEach(async (page: string) => {
    const pageEntryPath = Path.join(demoRoot, "src", `${page}.tsx`);
    console.log("pageEntryPath", pageEntryPath);

    const input = await promises.readFile(pageEntryPath);
    const code = input.toString();
    transform(
      code,
      {
        ast: true,
        filename: pageEntryPath,
        // presets: ["@babel/preset-env"],
        // presets: [
        //   "taro",
        //   {
        //     framework: "react",
        //     ts: true,
        //   },
        // ],
        plugins: [
          function () {
            return {
              visitor: {
                // Identifier(path, state) {},
                // ASTNodeTypeHere(path, state) {},
                ImportDeclaration(path) {
                  const from = path?.node?.source?.value;
                  console.log("...path", from);
                  if (from?.startsWith(".")) {
                    // console.log("...是相对路径", from);
                    path.node.source.value = "...."; // ele.replaceWith("...");
                  }
                },
                // JSXElement(path) {
                //   const tag = path?.node?.openingElement?.name?.name;
                //   console.log("...tag", tag);
                //   let targetTag = tagMap[tag]
                //   if (targetTag) {
                //     path.replaceWith()

                //   }
                // },
                JSXIdentifier(path) {
                  // console.log("...JSXIdentifier", path);
                  const name = path.node.name;
                  let target = tagMap[name];
                  if (target) {
                    const { tag } = target;
                    console.log("tag", tag, tag);

                    path.node.name = tag;
                    // path.replaceWith()
                  }
                },
              },
            };
          },
        ],
      },
      function (_err, _result) {
        // const { cod}
        console.log("...result", _result.code);
        // console.log("...err", err);
      }
    );
  });
}

build();
