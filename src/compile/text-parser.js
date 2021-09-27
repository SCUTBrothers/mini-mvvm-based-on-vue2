// 用于匹配{{ name }}
const mustache = /\{\{(.+?)\}\}/g

export default function TextParser(text) {
  // 如果不包含mustache语法, 那么直接返回空值
  if (!mustache.test(text)) return

  const tokens = []

  let lastIndex = (mustache.lastIndex = 0)
  let match = mustache.exec(text)
  while (match) {
    // ! 注意要trim()删除换行符, 在后续生成函数的时候, '<code>'引号中不能有换行符
    tokens.push("'" + text.slice(lastIndex, match.index).trim() + "'")
    tokens.push(`_s(${match[1].trim()})`)

    lastIndex = mustache.lastIndex
    match = mustache.exec(text)
  }

  if (lastIndex < text.length) {
    tokens.push("'" + text.slice(lastIndex).trim() + "'")
  }
  return tokens.join('+')
}
