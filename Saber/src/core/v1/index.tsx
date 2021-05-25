console.log("...inner");

import * as React from "react";
import { renderToString } from "react-dom/server";
import { writeFile } from "../../util";

const Document = props => {
  return (
    <html>
      <header>header</header>
      <body>
        <span>inner</span>
        {props}
      </body>
    </html>
  );
};

const Hello = () => <div>hello</div>;

// 1、理解 renderToString
const result = renderToString(React.createElement(Document, <Hello />));

writeFile("static/index.html", result);

console.log("...result", result);
