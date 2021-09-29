import { addHandler, addProp } from '../helper.js'

/**
 * v-model="<xxx>"
 * directive = {
 *       name: "model",
 *      rawName: "v-model",
 *      value: "<xxx>",
 *      arg: null
 * }
 */
export default function model(el, dir) {
  const value = dir.value
  const tag = el.tag

  if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value)
  }
}

function genDefaultModel(el, value) {
  const event = 'input'
  let valueExpression = '$event.target.value'
  let code = genAssignmentCode(value, valueExpression)
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code)
}

function genAssignmentCode(value, assignment) {
  // * 源码中是 res = parseModel(value), 需要去解析如v-model="handlerObj[key1][key2]"这种形式的代码中的嵌套引用值
  // * 在这个简单的框架中, 暂时不去做这种处理
  return `${value}=${assignment}`
}
