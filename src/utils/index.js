export function isObject(value) {
  // return Object.prototype.toString.call(value) == "[object Object]"
  return typeof value == 'object' && value !== null
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value instanceof String ||
    value instanceof Number
  )
}
