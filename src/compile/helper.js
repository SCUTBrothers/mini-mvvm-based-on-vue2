import parseObj from './parseObj.js'
/**
 * makeAttrsMap: 将[{name: <attrName>, value: <attrValue>}, ...] 转换为 {<attrName>: <attrValue>, ...}
 * attrs: attr[], attr: {name: ..., value: ...}
 */
export function makeAttrsMap(attrs) {
  const map = {}
  attrs.forEach((attr) => {
    map[attr.name] = attr.value
  })
  return map
}

const noop = () => {}

export function makeFunction(code) {
  try {
    return new Function(code)
  } catch (e) {
    return noop
  }
}

// addHandler(el, name, value, list[i])
export function addHandler(el, name, value) {
  // 由于没有设置modifier, 如v-on:click.prevent(modefier: prevent),
  // 所以v-on添加的事件都是原生事件.
  // 暂时不处理modifier的逻辑
  let events = el.nativeEvents || (el.nativeEvents = {})
  if (name) {
    // v-on:click = "clickMethod"
    events[name] = value.trim()
  } else {
    // v-on = "{click: clickMethod}"
    // 这里不能使用events = value<string>, 因为events指向el.events, 如果这样做, 则events会断开与el.events的连接
    // 指向value, el.events仍然为{}
    // * 这里需要通过正则来解析, 将字符串"{click: clickMethod}"转为JSON形式的字符串,
    // * 然后解析为对象, 直接赋值给el.events
    let JSONObj = parseObj(value)
    if (JSONObj) {
      el.nativeEvents = JSON.parse(JSONObj)
    }
  }
}

// v-bind:price = "xxx"
export function addProp(el, name, value) {
  console.log(`v-bind prop ${name}: ${value}`)
  ;(el.props || (el.props = [])).push({ name, value })
  // 在addProp和addAttr中都含有el.plain = false, 我猜是为了标记一个元素是否包含有属性
  // 如果不包含属性, 则是一个纯元素, plain element
  el.plain = false
}

export function addAttr(el, name, value) {
  const attrs = el.attrs || (el.attrs = [])
  attrs.push({ name, value })
  el.plain = false
}

export function addDirective(el, name, rawName, value, arg) {
  ;(el.directives || (el.directives = [])).push({
    name,
    rawName,
    value,
    arg,
  })
}
