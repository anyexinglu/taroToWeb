# taroToWeb

将 taro 项目源码，转为可读性较高的（编译前的） web 项目源码，方便项目从小程序迁移到 web。

## 几个假设

- 判断是否为项目自身组件的方式，是 import 的 path 是否是相对路径

## TODO

- 递归拷贝文件。普通文件要 copy 过来，比如 scss / css / json 等
- 修复 const 变成 var 的问题
- 非 tsx 就不需要 transform，直接照抄
- output copy 一下 template（选型考虑：react + vite + antd？），尽量 yarn && yarn dev 后就能跑起来

1、当前的编译内容
2、用 recast 改写
3、学习个把 eslint 插件提醒：import 顺序、合并 import、禁止 setState callback 。
项目中有 new IntersectionObserver，但没有
require('intersection-observer')
4、分享前看下 pin-cli 和 cava 中相关应用。
5、举例 tsdoc、抽取组件 interface 作为配置面板
