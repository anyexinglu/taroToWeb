## 收获

一、直接引入 @babel/core 的 transform，ts 被转译的问题（TODO）

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

transform 会受到 babelrc 的影响：https://babeljs.io/docs/en/options#babelrc，因为会读取配置 https://sourcegraph.com/github.com/babel/babel@main/-/blob/packages/babel-core/src/config/files/configuration.ts#L30

三、空行丢失

转为 ast 就会丢失空行 https://astexplorer.net/ ，因为 ast 只记录结构，不记录空行 / 空格

https://www.coder.work/article/1321017

但是用 recast 就不会丢失。一大特色就是在 print 的时候会尽量的保持源代码的格式，输出时只会重新输出有修改的 ast，未更改过的 ast，会直接按原样输出。所以非常适合那些需要修改源码，并且要把修改后的结果覆写到源码的情况。

## 相关资源推荐

- [babel](https://babeljs.io/docs/en/)
  - [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js)
- [前端领域的转译打包工具链](https://deeplang.org/assets/files/transpilers-package-tools-in-frontend-by-xuguang.pdf)
  - [《前端领域的转译打包工具链》上篇](https://juejin.cn/post/6956602138201948196)
- [回顾 babel 6 和 7，来预测下 babel 8](https://juejin.cn/post/6956224866312060942)
- [阿里妈妈的 AST 处理工具](https://github.com/thx/gogocode)
