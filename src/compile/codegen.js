export function codeGen(ast) {
  const code = ast ? genElement(ast) : "_h('div')"

  return makeFunction(`with (this) {return ${code}}`)
}

function genElement(el) {}
function nodir(el) {}
