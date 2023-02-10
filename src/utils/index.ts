// 部分代码来自 zrender
import { isObject } from './is'

let idStart = 0x0907

export function guid() {
  return idStart++
}

/**
 * 查询数组中元素的index
 */
export function indexOf<T>(array: T[] | readonly T[] | ArrayLike<T>, value: T): number {
  if (array) {
      if ((array as T[]).indexOf) {
          return (array as T[]).indexOf(value);
      }
      for (let i = 0, len = array.length; i < len; i++) {
          if (array[i] === value) {
              return i;
          }
      }
  }
  return -1;
}

export function disableUserSelect(dom: HTMLElement) {
  const domStyle = dom.style
  domStyle.webkitUserSelect = 'none'
  domStyle.userSelect = 'none'
  // @ts-ignore
  domStyle.webkitTapHighlightColor = 'rgba(0,0,0,0)'
  (domStyle as any)['-webkit-touch-callout'] = 'none'
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

export type KeyOfDistributive<T> = T extends unknown ? keyof T : never;
export function keys<T extends object>(obj: T): (KeyOfDistributive<T> & string)[] {
  if (!obj) {
      return [];
  }
  // Return type should be `keyof T` but exclude `number`, becuase
  // `Object.keys` only return string rather than `number | string`.
  type TKeys = KeyOfDistributive<T> & string;
  if (Object.keys) {
      return Object.keys(obj) as TKeys[];
  }
  let keyList: TKeys[] = [];
  for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
          keyList.push(key as any);
      }
  }
  return keyList;
}
