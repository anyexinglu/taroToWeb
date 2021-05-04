## 收获

一、直接引入 @babel/core 的 transform，ts 被转译、空行被删除的问题

1、 @babel/core 与 @babel/parser 中的 parse 不同
`import { parse } from "@babel/core"`
不同于：
`import { parse } from "@babel/parser"`

<!-- 2、如果直接引入 transform，则 -->

二、preset 和 plugin 有什么区别？

preset 是 a set of plugins.
比如 [babel-preset-typescript](https://github.com/babel/babel/blob/main/packages/babel-preset-typescript/src/index.js) 就是用到了 @babel/plugin-transform-typescript。
另外 babel 7.8.0 + 需要 `babel.config.json` （https://babeljs.io/docs/en/usage），但是对 @babel/parser 中的 parse 不生效，因为没从外部读取 https://babeljs.io/docs/en/babel-parser。

```
{
  presets: [
    [
      "./preset",
      {
        framework: "react",
        ts: true,
      },
    ],
  ];
}
```

transform 会受到 babelrc 的影响：https://babeljs.io/docs/en/options#babelrc

## 相关资源推荐

- [babel](https://babeljs.io/docs/en/)
  - [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)
- [前端领域的转译打包工具链](https://deeplang.org/assets/files/transpilers-package-tools-in-frontend-by-xuguang.pdf)
  - [《前端领域的转译打包工具链》上篇](https://juejin.cn/post/6956602138201948196)
- [回顾 babel 6 和 7，来预测下 babel 8](https://juejin.cn/post/6956224866312060942)
- [阿里妈妈的 AST 处理工具](https://github.com/thx/gogocode)
