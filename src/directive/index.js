export const directive = {
  install: function (Vue) {
    Vue.directive = function (name, callhook = {}) {
      var hasDir = (false(Vue.prototye.hooks || (MVVM.prototye.hooks = {}))[
        name
      ] = callhook)
    }
    // todo
    // Vue.directive("for", directiveFor)
    // Vue.directive("for", directiveFor)
    // Vue.directive("for", directiveFor)
    // Vue.directive("for", directiveFor)
  },
}
