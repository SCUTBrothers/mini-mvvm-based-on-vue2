const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/
const fnInvokeRE = /\([^)]*?\);*$/
const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/

function genHandler(handler) {
  if (!handler) {
    return 'function(){}'
  }

  const isMethodPath = simplePathRE.test(handler)
  const isFunctionExpression = fnExpRE.test(handler)
  const isFunctionInvocation = simplePathRE.test(
    handler.replace(fnInvokeRE, '')
  )

  // 不处理modifier
  if (isMethodPath || isFunctionExpression) {
    // 如"clickMethod"这种, isMethodPath = true
    // * "value=$event.target.value", isMethod = isFunctionExpresion = isFunctionInvocation = true
    return handler
  }

  return `function($event) {
        ${isFunctionInvocation ? `return ${handler}` : handler}
    }`
}

/**
 * 简版的genHandlers
 * 相当于是将{click: "clickMethod"}转为了'natvieOn:{click:"clickMethod"}'
 */
export function genHandlers(events, isNative) {
  const prefix = isNative ? 'nativeOn:' : 'on:'
  let staticHandlers = ``
  for (const name in events) {
    const handlerCode = genHandler(events[name])
    if (events[name]) {
      staticHandlers += `${name}:${handlerCode},`
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  return prefix + staticHandlers
}
