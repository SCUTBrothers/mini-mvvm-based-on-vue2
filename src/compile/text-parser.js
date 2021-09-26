// 用于匹配{{ name }}
const mustache = /\{\{(.+)?\}\}/g

export default function TextParser(text) {
  const tokens = []

  let lastIndex = (mustache.lastIndex = 0)
  let match = mustache.exec(text)
  while (match) {
    tokens.push("'" + text.slice(lastIndex, match.index) + "'")
    tokens.push(`_s(${match[1].trim()})`)

    lastIndex = mustache.lastIndex
    match = mustache.exec(text)
  }

  if (lastIndex < text.length) {
    tokens.push("'" + text.slice(lastIndex) + "'")
  }
  return tokens.join('+')
}
