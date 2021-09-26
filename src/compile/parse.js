const cnameCapture = `([a-zA-Z][\\w\\d\-]*)`
const qnameCapture = `(?:\\w+:\s*)?${cnameCapture}`
const startTagOpen = new RegExp(`^<\s*${qnameCapture}`)

const prefix = 'v-'
const directiveCapture = `(?:${prefix}(\\w+):?\\s*)`
// ! 当要解析指令的时候, 不应匹配属性名, 而应匹配表达式: (prefix + directive + :?)? + attrName =  attrValue
const attr = `(?:(?:([a-zA-Z]+)\\s*)?(=)\\s*(?:("[^"]*")|('[^']*')|([^"'<>\\s]+)))`
/**
 * g1?: directive | undefined
 * g2?: attrname | undefined
 * g3 : =
 * g4 : value
 *
 * example:
 *  1. v-if = "false"
 *    g1: if, g2: undefined, g3: =, g4: "false"
 *  2. class = "done"
 *    g1: undefined, g2: class, g3: =, g4: "done"
 *  3. v-bind: class = "isDone"
 *    g1: bind, g2: class, g3: =, g4: "isDone"
 *
 */
const expressionCapture = new RegExp(`\\s+${directiveCapture}?${attr}?`)

const startTagClose = /^\s*>/

const endTag = new RegExp(`^<\\s*\\/${qnameCapture}\\s*>`)

export function HTMLParser(html) {
  html = html.trim()
  const stack = []
  let root
  let currentParent
  let textEnd
  while (html) {
    if (startTagOpen.test(html)) {
      let startRes = start(html)
      if (!startRes) return
      currentParent = startRes.element
      html = startRes.html
      if (!root) {
        root = currentParent
      }

      stack.push(currentParent)
    }

    textEnd = html.indexOf('<')
    if (textEnd > 0) {
      let text = html.slice(0, textEnd)
      let trimText = text.trim()
      if (trimText) {
        // todo
        if (currentParent) {
          currentParent.children.push(createTextNode(trimText))
        }
      }
      html = advance(html, text.length)
    }

    if (endTag.test(html)) {
      ;({ html, currentParent } = end(html, stack))
    }
  }
  return root
}

const start = (html) => {
  const openMatch = html.match(startTagOpen)
  if (!openMatch) return

  const tagName = openMatch[1]

  html = advance(html, openMatch[0].length)

  let attrs = []
  let directives = {}

  let expressionMatch = html.match(expressionCapture)
  let closeMatch = html.match(startTagClose)

  while (expressionMatch && !closeMatch) {
    const expression = {
      directiveName: expressionMatch[1],
      attrName: expressionMatch[2],
      value: expressionMatch[4],
    }

    html = advance(html, expressionMatch[0].length)

    let isDirective = !!expression.directiveName
    if (isDirective) {
      let name = expression.directiveName
      directives[name] = {
        rawName: prefix + expression.directiveName,
        name: expression.directiveName,
        value: expression.value,
        arg: expression.attrName || null,
      }
    } else {
      attrs.push({
        name: expression.attrName,
        value: expression.value,
      })
    }

    expressionMatch = html.match(expressionCapture)
    closeMatch = html.match(startTagClose)
  }

  if (startTagClose.test(html)) {
    html = advance(html, html.match(startTagClose)[0].length)
  }

  return {
    element: createElement(tagName, attrs, directives),
    html,
  }
}

const parseModifiers = (name) => {}

const processAttrs = (el) => {}

const end = (html, stack) => {
  let endMatch = html.match(endTag)
  html = advance(html, endMatch[0].length)

  let currentParent = stack.pop()
  let parent = stack[stack.length - 1]
  if (parent) {
    parent.children.push(currentParent)
    currentParent.parent = parent
  }

  return {
    currentParent: parent,
    html,
  }
}

const advance = (html, n) => {
  return html.slice(n)
}

const createElement = (tagName, attrs, directives) => {
  let res = {
    type: 1,
    tagName,
    attrs,
    children: [],
    parent: null,
    directives,
  }

  for (let directive in directives) {
    // 将元素具有指令directive设置为true
    console.log(
      `指令directive名字为:${directive}, 将会被设置为ast元素的属性, 值为true`
    )
    res[directive] = true
  }

  return res
}

const createTextNode = (text) => {
  return {
    type: 3,
    text,
  }
}
