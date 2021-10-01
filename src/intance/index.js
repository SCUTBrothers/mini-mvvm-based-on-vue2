import { stateMixin } from '../state.js'
import { initMixin } from './init.js'
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'

function Vue(options) {
  this._init(options)
}

// * 装饰者模式, 为Vue添加实例方法(原型方法), 在import Vue(模块装载时自动装载)
initMixin(Vue)
stateMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
