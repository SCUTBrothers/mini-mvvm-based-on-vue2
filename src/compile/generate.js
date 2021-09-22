const mustache = /\{\{(.+)?\}\}/g

export function generate(ast) {
  if (ast.type === 3) {
    return `_v(${generateText(ast.text)})`
  } else if (ast.type === 1) {
    return `_c("${ast.tagName}", {${generateAttr(ast.attrs)}}, ${generateChildren(
      ast.children
    )})`
  }
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
    tokens.push(text.slice(preIndex))
  }
  return tokens.join('+')
}

function generateChildren(children) {
  let res = ''
  if (children.length) {
    return children
      .map((child) => {
        return generate(child)
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

let ast = {
  tagName: 'div',
  type: 1,
  attrs: [],
  children: [
    {
      type: 3,
      text: 'some text in {{ paper }}',
    },
    {
      tagName: 'ul',
      type: 1,
      attrs: [
        {
          name: 'class',
          value: 'todolist-container',
        },
        {
          name: 'width',
          value: '200',
        },
      ],
      children: [
        {
          tagName: 'li',
          type: 1,
          attrs: [
            {
              name: 'class',
              value: 'done',
            },
          ],
          children: [],
        },
      ],
    },
    {
      type: 3,
      text: 'another text',
    },
  ],
}
