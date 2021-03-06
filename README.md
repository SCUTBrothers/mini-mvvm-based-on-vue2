# mini-mvvm based on vue2
repo github地址: [SCUTBrothers/mini-mvvm-based-on-vue2](https://github.com/SCUTBrothers/mini-mvvm-based-on-vue2)
## Introduction

> Note: not finish yet, it's just a draft

vue2源码包含很多为了兼容边缘情况和实现高级功能的代码, 不方便阅读, 很容易一头雾水. 网上部分源码解读的博客通常是贴出源码中的代码片段来解析框架当中的部分功能, 然而这样效果并不好, 因为一个框架的模块并不是独立存在的, 一环扣一环, 如果要较好地实现某一功能, 那么必须要了解它相关的一些模块的功能  


- 要实现响应式更新视图, 那么就需要知道render函数(数据修改调用render函数), 
- 要了解render函数, 就要先知道如何通过栈形式解析html template, 生成易于计算机处理的树状节点结构, 然后将该结构解析为嵌套的字符串形式的函数结构, 生成render函数. 
- 再接着你需要明白with语句的作用, 以及with语句作用域关闭后, 会为其中的函数生成对象或变量的闭包, 这样你才能知道render函数被调用后的函数逻辑, 还有如何实现v-model
- ...

学习源码的最好手段就是在参考源码及其文档的思想后, 自己手动实现一个包含核心功能的简版框架, 这样比直接去阅读繁杂的源码更有成就感, 而且在实现某个小feature以后能得到很强的正反馈, 刻意练习效果更好.

这是一个**简单版本的vue2框架**, 纯js, 不需要折腾webpack, rollup和package配置, 用大家熟悉的live server就能看渲染效果了, 方便大家入门学习vue源码. 然后, 源码中包含我在实现这个框架的时候一些注释.

不过, 这里小小的提一点, 虽然给源码添加注释, 然后分享出去, 看起来能够很好的帮助它人学习代码, 但是我认为这种帮助效果是很微小的. 代码注释应该算是指南针, 是用于在学习的时候对照着看的. 真正有作用的应该是地图, 它能够在全局上提供整个代码思路脉络, 当程序员开始阅读源码的时候,他一定是对于源码部分思想和功能有较强的心理表征的.

授人以鱼不如授人以渔, 以下是帮助我学习vue源码, 建立心理表征的学习资源(按照学习优先级排列):
1. vue官方文档
2. 珠峰架构前端核心课手写vue源码课(姜文老师)
3. B栈尚硅谷vue源码课(老师声音听起来很舒服, 而且举的例子通俗易懂)
4. snabbdom源码(强烈建议去看一下, 不然的话较难想到vue2是如何实现指令v-on, v-bind, vnode, diff算法和patch函数. 这部分内容应该在实现响应式以后学习)
5. [fastCreator/MVVM: vue 源码解析及实现](https://github.com/fastCreator/MVVM)
6. Vue.js全方位深入解析的pdf课件(其实我是不推荐看这个课程的, 看课件就可以了. 课程我全看过, 实际上就是对着源码给你说一遍, 我不太喜欢这种风格, 脑子跟不上, 不如直接看pdf)
7. <深入浅出Vue.js> 讲的不是很详细, 不容易学习. 看完前面的资料再对照着看这本书
8. [推荐 7 个 Vue2、Vue3 源码解密分析的重磅开源项目 👍 - 掘金](https://juejin.cn/post/6942492146725290020) (网上的一些还不错的vue源码资料收集, 聊胜于无吧. 最重要的是完成2, 3, 4, 这些文字版的内容在开始学习的时候帮助不大, 只有在老师给你讲明白代码逻辑以后, 对照着看才有用)

看完这些资料, 再参照这个repo的源码, 我相信你也可以学好vue, 然后自己重新实现一个简版vue~

## 实现的功能

> 实现的功能不是很多, 真的蛮简单的, 不过也花了我很多时间, 踩了很多坑🥳 

- [x] 响应式
    - [x] 计算属性
    - [x] watcher
- [x] v-on, v-bind, v-model, v-if(v-else-if, v-else), v-for

- [x] virtual dom
  - [x] 模板编译
  - [x] render函数生成 
  - [x] vnode
- [x] watch
- [x] patch中的diff算法
- [x] lifeCycle hooks

**todo**

Vue2

- [ ] Vue.set
- [ ] nextTick
- [ ] mixins
- [ ] vdom/modules
- [ ] 组件化
- [ ] mergeOptions

Vue3

- [ ] lazy proxy(Proxy and Reflect)
- [ ] better algorithm (track bit ...) for cleaning watcher deps 
- [ ] composition api
- [ ] effect