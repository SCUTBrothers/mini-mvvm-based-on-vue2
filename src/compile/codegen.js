export function codeGen(ast) {
  const code = ast ? genElement(ast) : "_h('div')"

  console.log(`code is ${code}`)
  const render = new Function(`with (this) {return ${code}}`)

  return render
}

function genElement(el) {
  // if (el.for) {
  //   return genFor(el)
  // } else if (el.if && !stateProcessed) {
  //   return genIf(el)
  // } else {
  //   if (el.type === 3) {
  //     return `_v(${generateText(el.text)})`
  //   } else if (el.type === 1) {
  //     return `_c("${el.tagName}", {${generateAttr(
  //       el.attrs
  //     )}}, ${generateChildren(el.children)})`
  //   }
  // }
  const data = genData(el)

  if (el.type === 3) {
    return `_v(${el.text})`
  } else if (el.type === 1) {
    return `_h("${el.tag}", ${data}, ${genChildren(el.children)})`
  }
}

function genData(el) {
  let data = '{'

  if (el.on) {
    // 单种事件, v-on: click = "clickHandler"
    //  arg = "click", expression = "clickHandler"
    // 多种事件, v-on = "{click: clickHandler, mousemove: mouseMoveHandler}"
    //  arg = "", expression = "{click: clickHandler, mousemove: mouseMoveHandler}"
    data += 'on:' + genProps(el.on) + ','
  }

  data += '}'
  return data
}

function genProps(directive) {
  let res
  if (directive.arg) {
    res = '{'
    res += `${directive.arg}: ${directive.expression}`
    res += '}'
  } else {
    res = directive.expression
  }
  return res
}

function genChildren(children) {
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

// function generateAttr(attrs) {
//   let res = ''
//   if (attrs.length) {
//     attrs.forEach((attr) => {
//       res = res + `${attr.name}: ${attr.value},`
//     })
//   }
//   return res.slice(0, -1)
// }
