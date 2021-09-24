const mustache = /\{\{(.+)?\}\}/g

export function generate(ast) {
  const code = ast ? genElement(ast) : '_c("div")'

  return code
}

function generateText(text) {
  if (!mustache.test(text)) return "'" + text + "'"

  let preIndex = (mustache.lastIndex = 0)
  let match = mustache.exec(text)
  let tokens = []
  while (match) {
    tokens.push("'" + text.slice(preIndex, match.index) + "'")
    tokens.push(`_s(${match[1].trim()})`)
    preIndex = mustache.lastIndex
    match = mustache.exec(text)
  }

  if (preIndex < text.length) {
    tokens.push("'" + text.slice(preIndex) + "'")
  }
  return tokens.join('+')
}

function generateChildren(children) {
  let res = ''
  if (children.length) {
    return children
      .map((child) => {
        return genElement(child)
      })
      .join(',')
  }
  return res
}

function generateAttr(attrs) {
  let res = ''
  if (attrs.length) {
    attrs.forEach((attr) => {
      res = res + `${attr.name}: ${attr.value},`
    })
  }
  return res.slice(0, -1)
}

function genElement(el, stateProcessed) {
  if (el.for) {
    return genFor(el)
  } else if (el.if && !stateProcessed) {
    return genIf(el)
  } else {
    if (el.type === 3) {
      return `_v(${generateText(el.text)})`
    } else if (el.type === 1) {
      return `_c("${el.tagName}", {${generateAttr(
        el.attrs
      )}}, ${generateChildren(el.children)})`
    }
  }
}

// todo
function genFor(el) {
  // 暂时用genElement代替
  return genElement(el)
}

function genIf(el) {
  // v-if = "isDone"
  // value -> "isDone"
  // _a(name) 用于从vm实例上获取属性isDone的值
  // 如果value字符串中的属性值为true, 则创建该element, 否则创建一个空元素(div)
  // v-if仍然是创建元素, 所以是一个元素节点, 可以作为_c(child1, child2, ...)函数的参数
  let value = el.directives['if'].value
  console.log(`genIf 被调用, v-if指令的指示值为${value}`)
  let res = `_a(${createExecutableExp(value)}) ? ${genElement(el, true)} : _e()` // true是为了不重复调用, 意指if已经解析过了
  console.log(`genIf的返回结果为${res}`)
  return res
}

function createExecutableExp(expression) {
  // 输入的字符串形式的expression可能是包含有嵌套引号, 如'"name"', 这是由于属性值可以是字符串, 如果属性值是100或者是'name', 将会被解析为"100"或者"'name'"
  expression = expression.replace(/'|"/g, '')
  return new Function('return ' + expression)
}
