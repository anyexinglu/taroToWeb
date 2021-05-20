import * as fs from "fs-extra";
import * as Path from "path";
import Jsx from "./Asset/Jsx";
import config from "./config";
import { generateRoutes } from "./util";

let { demoRoot, output, templateRoot } = config;

const paths = {
  entry: "src/app.config.ts",
  ...config.pathMap,
};

function build() {
  const { entry } = paths;
  const { pages, subpackages } = require(Path.join(demoRoot, entry)).default;
  fs.removeSync(output);
  fs.copySync(templateRoot, output);
  generateRoutes(pages, subpackages);

  const allPages = [
    ...pages,
    ...subpackages.reduce((total, item) => {
      let subTotal = item.pages.map((page) => `${item.root}/${page}`);
      return [...total, ...subTotal];
    }, []),
  ].map((item) => new Jsx(Path.join(demoRoot, "src", item)));

  console.log("...allPages", allPages);

  allPages.forEach((page: Jsx) => {
    page.parse();
    page.print();
  });
}

build();
