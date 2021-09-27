// g1: dirname, g2?: :arg, g3: modifier
// v- -> (dirname) -> (:arg) ? -> .? -> (modifier?)
// v-if -- dirname => if
// v-on:submit.prevent -- dirname, arg, modifier => on, submit, prevent
// v-model.lazy -- dirname, modifier => model, lazy
// v-bind: class -- arg => class
export const directiveRE = /^v\-(\w+)(\:[^\.]+)?\.?([^\:]+)?/
/**
 * @param el ast节点元素
 * @param attrs: attr[], attr {name: ..., value: ...}, el的属性attrs值
 */
export function setElDirective(el, attrs) {
  for (let i = 0, l = attrs.length; i < l; i++) {
    let name = attrs[i].name
    let dirAttr = name.match(directiveRE)

    if (dirAttr) {
      const dirname = dirAttr[1]
      el[dirname] = {
        name: dirname,
        arg: dirAttr[2] && dirAttr[2].slice(1),
        modifier: dirAttr[3] ? { [dirAttr[3]]: true } : null,
        expression: attrs[i].value,
      }
    }
  }
}

export function setELAttrs(el) {
  const attrs = el.attrsMap
  for (let key in attrs) {
    const value = attrs[key]

    // todo
    // if (isAttr(key)) {
    //   el.props[key] = "'" + value + "' "
    // } else {
    //   el.atts[key] = "'" + value + "'"
    // }
  }
}

/**
 * makeAttrsMap: 将[{name: <attrName>, value: <attrValue>}, ...] 转换为 {<attrName>: <attrValue>, ...}
 * attrs: attr[], attr: {name: ..., value: ...}
 */
export function makeAttrsMap(attrs) {
  const map = {}
  attrs.forEach((attr) => {
    map[attr.name] = attr.value
  })
}

const noop = () => {}

export function makeFunction(code) {
  try {
    return new Function(code)
  } catch (e) {
    return noop
  }
}
