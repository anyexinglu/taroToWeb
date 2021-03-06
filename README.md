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

最新情况：

- [x] 改造成 Asset，让代码逻辑更清晰
- [x] 解决空行丢失问题：用 recast 改写，parse、visit、print 三步走。
- [x] 支持 ts：分拆为 babel 的 parse、traverse、generator 三步走，解决 ts 类型丢失的问题。
- [x] 支持 sass 样式
- [x] Demo 完整跑起来
- [x] 引入 react-loadable 按需加载路由
- [x] 支持 SPA（使用 Browser history）
- [x] 自动 @tarojs/taro 内部方法，如 navigateTo 等
  - [x] 支持页面内部链接跳转
- [x] 支持 antd（less）

## 渐进式

- v0: 用 core 的 transform 完成要求，但存在 ts 类型丢失的问题
- v1：分拆为 parse、traverse、generator 三步走，解决 ts 类型丢失的问题。
- v2: 尝试 recast 的 parse、visit、print 三步走，并改造成 Asset
- v3（TODO）: 尝试 https://github.com/facebook/jscodeshift

## TODO

- 支持命令行方式调用
- vite 模板改成 ssr
- 学习个把 eslint 插件提醒：import 顺序、合并 import、禁止 setState callback 。
  项目中有 new IntersectionObserver，但没有
  require('intersection-observer')
- 写一个 vite-react 项目脚手架？（支持要不要 antd）

## 分享

- 分享前看下 pin-cli 和 cava 中相关应用
- 举例 tsdoc、抽取组件 interface 作为配置面板

## 学习收获

[Learn.md](./Learn.md)
