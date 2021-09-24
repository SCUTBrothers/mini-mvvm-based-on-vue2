export function isObject(value) {
  // return Object.prototype.toString.call(value) == "[object Object]"
  return typeof value == 'object' && value !== null
}
