import { directive } from '../directive.js'

export function globalStaticMixin(Vue) {
  Vue.use = function (plugin) {
    if (plugin && plugin.install) {
      plugin.install(Vue)
    }
  }
}

export function initGlobal(Vue) {
  Vue.use(directive)
}
