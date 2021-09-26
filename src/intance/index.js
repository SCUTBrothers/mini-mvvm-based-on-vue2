import { globalStaticMixin } from '../global-api/global.js'
import { initMixin } from './init.js'
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'

function Vue(options) {
  this._init(options)
}

initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

globalStaticMixin(Vue)

export default Vue
