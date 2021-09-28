// 1 input: "{click: clickMethod, mousemove: [mm0, mm2]}"
// 2 input: "{click: clickMethod, mousemove: [mm0, mm2], }"
// 3 input: "{click: clickMethod, mousemove: [mm0, mm2] }"
// output(JSON style): {"click": "clickMethod", "mouse": "[mm0, mm2]"}
// g1: key, g2?: varName, g3?: array
const entryRE = /([a-zA-Z\$_]\w*):\s*(?:([a-zA-Z\$_]\w*)|(\[.*\]))\s*[,\}]/g
const validateRE = /[\w:,\[\]]/
export default function parseObj(str) {
  let res = ''
  let filteredStr = str.replace(
    entryRE,
    function (match, key, variableName, array) {
      if (match) {
        // 如果match成功了, 必然是匹配到了key: varibalbeName, 或者key: [...]中的一种
        let valueStr = variableName ? variableName : array
        res += `"${key}":"${valueStr}",`
      }
      return ''
    }
  )

  /** validate { ... }
   *  failed examples:
   * 1. single { or }
   * 2. }{
   * 3. {click: clickMethod, mouse: } => filteredStr "{mouse: }",
   *    if filteredStr contains any word or ":", ",", it will failed
   */
  let startQuoteIdx = str.indexOf('{')
  let endQuoteIdx = str.indexOf('}')
  if (
    !(startQuoteIdx > -1 && endQuoteIdx > -1 && startQuoteIdx < endQuoteIdx)
  ) {
    throw new Error(`invalid str of obj ${str}, parseObj failed`)
  } else if (validateRE.test(filteredStr)) {
    throw new Error(`invalid str of obj ${str}, parseObj failed`)
  }

  if (res.indexOf(',') > 0) {
    return `{${res.slice(0, -1)}}`
  }
}
