# taroToWeb

将 taro 项目源码，转为可读性较高的（编译前的） web 项目源码，方便项目从小程序迁移到 web。

这是一个学习目的的玩具项目。计划通过这个项目，掌握自己感兴趣但还不熟练的技能：

- 通过将 taro 小程序项目转为 PC 项目，来学习 babel & ast 的使用。
- 然后 PC 项目用 vite 脚手架作为模板，支持将转化后的代码运行起来，来学习 vite 项目的配置，以及脚手架的基础使用。
- 最后将 PC 项目模板改成 ssr 方式，来学习 vite ssr 知识。

## 项目模板

基于 vite 脚手架，`yarn add sass fs readline events util`

scss: https://vitejs.dev/guide/features.html#css-pre-processors

## 使用方式

clone 项目并 yarn 后：

- yarn web
- cd output
- yarn && yarn dev
- chrome 打开 http://localhost:3000/ 即可看到 web 项目

## 支持情况

- [x] 支持 sass 样式
- [x] 支持 ts
- [x] Demo 完整跑起来
- [x] 引入 react-loadable 按需加载路由
- [x] 支持 SPA（使用 Browser history）
- [x] 自动 @tarojs/taro 内部方法，如 navigateTo 等
  - [x] 支持页面内部链接跳转
- [x] 支持 antd（less）

## TODO

- 修复 ts 丢失、空行被删除的问题
- 支持命令行方式调用
- 用 recast 改写、用 Asset 优化代码
- 学习个把 eslint 插件提醒：import 顺序、合并 import、禁止 setState callback 。
  项目中有 new IntersectionObserver，但没有
  require('intersection-observer')
- 写一个 vite-react 项目脚手架？（支持要不要 antd）

## 分享

- 分享前看下 pin-cli 和 cava 中相关应用
- 举例 tsdoc、抽取组件 interface 作为配置面板

## 收获

一、直接引入 @babel/core 的 transform，ts 被转译的问题

1、 @babel/core 与 @babel/parser 中的 parse 不同
`import { parse } from "@babel/core"`
不同于：
`import { parse } from "@babel/parser"`

<!-- 2、如果直接引入 transform，则 -->
