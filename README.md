# taroToWeb

将 taro 项目源码，转为可读性较高的（编译前的） web 项目源码，方便项目从小程序迁移到 web。

## 几个假设

- 判断是否为项目自身组件的方式，是 import 的 path 是否是相对路径

## TODO

- 分析相对路径的依赖，遇到 scss 照抄（view 和 text 比较困难），遇到组件同样进行编译
- 修复 const 变成 var 的问题
