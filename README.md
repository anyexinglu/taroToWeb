# taroToWeb

将 taro 项目源码，转为可读性较高的（编译前的） web 项目源码，方便项目从小程序迁移到 web。

这是一个学习目的的玩具项目。计划通过这个项目，掌握自己感兴趣但还不熟练的技能：

- 通过将 taro 小程序项目转为 PC 项目，来学习 babel & ast 的使用。
- 然后 PC 项目用 vite 脚手架作为模板，支持将转化后的代码运行起来，来学习 vite 项目的配置，以及脚手架的基础使用。
- 最后将 PC 项目模板改成 ssr 方式，来学习 vite ssr 知识。

## 项目模板

基于 vite 脚手架，`yarn add sass fs readline events util`

scss: https://vitejs.dev/guide/features.html#css-pre-processors

## 几个假设

- 判断是否为项目自身组件的方式，是 import 的 path 是否是相对路径

## TODO

- 修复 ts 丢失、空行被删除的问题
- 引入模板（选型考虑：react + vite + antd？），尽量 yarn && yarn dev 后就能跑起来

1、当前的编译内容
2、用 recast 改写
3、学习个把 eslint 插件提醒：import 顺序、合并 import、禁止 setState callback 。
项目中有 new IntersectionObserver，但没有
require('intersection-observer')
4、分享前看下 pin-cli 和 cava 中相关应用。
5、举例 tsdoc、抽取组件 interface 作为配置面板
