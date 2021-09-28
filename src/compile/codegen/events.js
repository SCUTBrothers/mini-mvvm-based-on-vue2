function genHandler(handler) {
  if (!handler) {
    return 'function(){}'
  }
  // 由于没有modifier, 或者是使用路径, 如click = "a[b][c]", 而是直接使用methods当中的键名
  // 所以直接返回就好了
  return handler
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
