
export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object')
}
export function isNumber(val: unknown): val is number {
  return is(val, 'Number')
}

export function isNull(val: unknown): val is null {
  return val === null
}
