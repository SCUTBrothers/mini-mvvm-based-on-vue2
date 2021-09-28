export function updateModel(oldVnode, vnode) {
  let oldModel = oldVnode.data.model
  let model = vnode.data.model

  if (!oldModel && !model) return
  if (oldModel === model) return
  oldModel = oldModel || ''
  model = model || ''

  const oldElm = oldVnode.elm
  const elm = vnode.elm

  // model指向的值是一个字符串, 字符串指向vm.data中的属性
  // 需要从vm身上取值, 然后input修改vm身上的值
  if (oldModel) {
    if (model) {
      // ! thinking ...
    }
  }
}

function createInputListener() {
  return function inputHandler(event) {
    handleInput(event, inputHandler.vnode)
  }
}

function handleInput(event, vnode) {
  if ((event.type = 'input')) {
  }
}

function invokeInputHandler(handler, vnode, event) {}

export const modelModule = {
  create: updateModel,
  update: updateModel,
}
