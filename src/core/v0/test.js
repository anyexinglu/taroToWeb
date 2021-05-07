const generate = require("@babel/generator").default;
const { parse } = require("@babel/core");
const t = require("@babel/types");
// const preset = require("../../preset");

// console.log("preset", preset);

const code = "<span>aaa</span>";
const ast = parse(code, {
  filename: "test.js",
  presets: [
    [
      "@babel/preset-react",
      {
        framework: "react",
        ts: true,
      },
    ],
  ],
});

console.log("...ast", ast);

ast.program.body[0].expression.openingElement.attributes[0] = t.jSXAttribute(
  t.jsxIdentifier("className"),
  t.stringLiteral("tagText")
);

// console.log(".generate", generate);

const output = generate(
  ast,
  {
    /* 选项 */
  },
  code
);

console.log("...output", output);
