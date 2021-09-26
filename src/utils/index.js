export function isObject(value) {
  // return Object.prototype.toString.call(value) == "[object Object]"
  return typeof value == 'object' && value !== null
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isPrimitive(value) {
  return (
    typeof s === 'string' ||
    typeof s === 'number' ||
    s instanceof String ||
    s instanceof Number
  )
}
