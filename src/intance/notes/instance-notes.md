# instance 笔记

## index.js模块(Vue)

作用: 导出Vue构造函数
```JS
import { initMixin } from './init.js'
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'

function Vue(options) {
  this._init(options)
}

// * 装饰者模式, 为Vue添加实例方法(原型方法)
initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

详解: 该模块被导入的时候会自动执行(模块装载阶段), `initMixin(Vue)`, `lifecycle(Vue)`, `renderMixin(Vue)`会为Vue设置相应的原型方法
> 使用这种手段的原因是为了**给Vue不同的原型方法进行分类**, 我们当然可以不采用这种手段, 将Vue的所有原型方法放到index.js里面, 不过这样
> 会显得代码臃肿不堪, 不利于阅读
> 这种手段可以称作为**装饰者模式**, 即动态给类添加功能, 或者你可以认为它是一种对原型方法进行分块的手段

## init.js模块

作用: 主要包含为Vue设置原型方法的函数`initMixin(Vue)`, 该函数会在Vue模块装载(import Vue)的时候被调用

`initMixin`
1. `Vue.prototype._init`
2. `Vue.prototype.$mount`

1. `Vue.prototype._init`
作用(**todo**):

```JS
 Vue.prototype._init = function _init(options) {
    const vm = this

    vm.$options = options
    this._uid = uid++

    initState(vm)

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
```

1. `Vue.prototype.$mount`
作用
1. 获取挂载对象el的dom元素指针
2. 确定模板template
3. 如果用户没有设置render函数, 则通过template生成render函数, 挂载到vm.$options.render上
4. 调用hook - "beforeMount"(**todo**)
5. 调用mountComponent方法, 进行挂载
```JS
 /**
   * $mount
   *
   * @param el 代表虚拟节点生成的元素的挂载容器(并不是挂载作为el的子元素
   *           el会在patch后替换. 参照snabbdom patch源码)
   */
  Vue.prototype.$mount = function $mount(el) {
    const vm = this
    // * options和vm.$options指针相同(引用类型赋值)
    const options = vm.$options

    if (typeof el == 'string') {
      el = document.querySelector(el)
    } else if (typeof el != 'object') {
      return
    }

    /**
     * * 优先级: render函数 > template > el
     *
     * * 如果vm.$options当中包含有render函数, 那么就不用通过template生成render函数,
     * * 后面直接通过vm.$options.render获取render函数
     * * 如果vm.$options当中没有render函数, 那么通过template去生成render函数
     *    * 如果没有template, 那么将el的outerHTML作为template
     */
    if (!options.render) {
      let template = options.template
      if (template) {
        /**
         * template的指定方式
         * 1. 字符串
         *  1.1 id选择器"#xxx", 指向元素<template id="xxx">...(template inner></template>
         *  2.1 字符串模板 eg. <div> ... </div>
         * 2. dom元素
         *  template: document.querySelector("<selector>")
         */
        if (typeof template == 'string') {
          if (template[0] === '#') {
            // 1.1情形
            template = document.querySelector(template).innerHTML
          }
          // 不包含"#"则认为是情形1.2
        } else if (template.nodeType) {
          // 情形2
          template = template.innerHTML
        }
      } else if (el) {
        template = el.outerHTML
      }
      const render = compileToRenderFunction(template, vm)
      options.render = render
    }

    // todo "beforeMount" hook
    mountComponent(vm, el)
  }
}
```

## lifecycle.js模块

作用: 