const cnameCapture = `([a-zA-Z][\\w\\d\-]*)`
const qnameCapture = `(?:\\w+:\s*)?${cnameCapture}`
const startTagOpen = new RegExp(`^<\s*${qnameCapture}`)
const attr = /\s+([a-zA-Z]+)\s*(=)\s*(("[^"]*")|('[^']*')|([^"'<>\s]+))/
const startTagClose = /^\s*>/

const endTag = new RegExp(`^<\\s*\\/${qnameCapture}\\s*>`)

export function parseHTML(html) {
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
        currentParent.children.push(createTextNode(trimText))
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

  let attrMatch = html.match(attr)
  let closeMatch = html.match(startTagClose)
  let attrs = []

  while (attrMatch && !closeMatch) {
    const attribute = {
      name: attrMatch[1],
      value: attrMatch[3],
    }
    attrs.push(attribute)
    html = advance(html, attrMatch[0].length)

    attrMatch = html.match(attr)
    closeMatch = html.match(startTagClose)
  }

  if (startTagClose.test(html)) {
    html = advance(html, html.match(startTagClose)[0].length)
  }

  return {
    element: createElement(tagName, attrs),
    html,
  }
}

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

const createElement = (tagName, attrs) => {
  return {
    type: 1,
    tagName,
    attrs,
    children: [],
    parent: null,
  }
}
const createTextNode = (text) => {
  return {
    type: 3,
    text,
  }
}
