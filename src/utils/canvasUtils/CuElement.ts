import * as cuUtil from '../index'
import { isObject } from '../is';
import { CanvasUtils } from './index'

export interface ElementProps {
  style?: Record<string, any>;
}

export default class CuElement<Props extends ElementProps = ElementProps> {
  type: string = '';
  id: number;
  style: Record<string, any>;
  __cu: null | CanvasUtils = null;

  constructor(opts?: Props) {
    const { style = {} } = opts || {}
    this.id = cuUtil.guid()
    this.style = style
  }

  addSelfToZr(cu: CanvasUtils) {
    if (this.__cu === cu) return
    
    this.__cu = cu
  }
  removeSelfFromZr() {
    this.__cu = null
  }
  
  draw() {}

  getWidth(): number | null {
    return null
  }

  traverse<Context>(
    cb: (this: Context, el: this) => void,
    context?: Context
  ) {
    cb.call(context as Context, this)
  }

  attr(keyOrObj: Props): this
  attr<T extends keyof Props>(keyOrObj: T, value: Props[T]): this
  attr(keyOrObj: keyof Props | Props, value?: unknown): this {
    if (typeof keyOrObj === 'string') {
      this.attrKV(keyOrObj, value)
    } else if (isObject(keyOrObj)) {
      let keysArr = cuUtil.keys(keyOrObj)
      for (let i = 0; i < keysArr.length; i++) {
        let key = keysArr[i]
        const newValue = keyOrObj[key]
        if (isObject(newValue)) {
          this.attrKV(key, {
            ...(this as any)[key],
            ...newValue
          })
        } else {
          this.attrKV(key, keyOrObj[key])
        }
      }
    }
    this.markRedraw()
    return this
  }
  attrKV(key: string, value: unknown) {
    (this as any)[key] = value
  }
  markRedraw() {
    const cu = this.__cu
    if (!cu) return

    cu.refresh()
  }
}
