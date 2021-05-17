// TODO
import Jsx from "./Jsx";

export default class Page {
  pagePath: string;
  deps: any[];
  ast: any;
  jsx: Jsx;

  constructor(pagePath: string) {
    this.pagePath = pagePath;
    this.deps = [];
    console.log("this...", this);
    this.jsx = new Jsx(pagePath);
  }

  async parse() {
    return this.jsx.parse();
    // console.log("...page ast", this.ast);
  }

  print() {
    return this.jsx.print();
  }
}
