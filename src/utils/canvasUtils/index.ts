import * as cuUtil from '@/utils'
import Storage from './store'
import CuElement from './CuElement'
export { default as Text } from './Text'
export { default as Image } from './Image'

let instances: { [key: number]: CanvasUtils } = {}

function delInstance(id: number) {
  delete instances[id]
}


interface CanvasUtilsOpts {
  width?: number;
  height?: number;
  bgColor?: string;
  devicePixelRatio?: number;
}
export class CanvasUtils {
  id: number;
  dom: HTMLElement;
  opts: CanvasUtilsOpts;
  storage: Storage | null;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  dpr: number;

  constructor(id: number, dom: HTMLElement, opts: CanvasUtilsOpts) {
    this.id = id
    this.dom = dom
    this.opts = opts || {}
    this.storage = new Storage()
    this.canvas = null
    this.ctx = null
    this.dpr = opts.devicePixelRatio || window.devicePixelRatio || 1

    this.createCanvas(this.opts)
  }

  createCanvas(opts: CanvasUtilsOpts) {
    this.canvas = document.createElement('canvas')
    const { width: oWidth = 'auto', height: oHeight = 'auto' } = opts
    const width = oWidth === 'auto' ? 100 : oWidth
    const height = oHeight === 'auto' ? 100 : oHeight
    this.canvas.width = width
    this.canvas.height = height
    this.dom.append(this.canvas)
    this.ctx = this.canvas.getContext('2d')
  
    this.size({ width, height })
  }

  add(el: CuElement) {
    if (!el || !this.storage) return

    this.storage.addRoot(el)
    el.addSelfToZr(this)
    this.refresh()
  }

  remove(el: CuElement) {
    if (!el || !this.storage) return
    
    this.storage.delRoot(el)
    el.removeSelfFromZr()
    this.refresh()
  }

  refresh() {
    if (!this.canvas || !this.ctx || !this.storage) return

    // 清除画布
    const { width, height } = this.canvas
    this.ctx.clearRect(0, 0, width, height)
    // 背景颜色
    const { bgColor } = this.opts
    if (bgColor) {
      this.ctx.save()
      this.ctx.fillStyle = bgColor
      this.ctx.fillRect(0, 0, width, height)
      this.ctx.restore()
    }
    // 渲染所有元素
    this.storage.getRoots().forEach(f => {
      f.draw()
    })
  }
  dispose() {
    this.clear()
    this.storage?.dispose()
    this.storage = null

    delInstance(this.id)
    
    return null
  }
  /**
   * 清楚所有对象和 canvas.
   */
  clear() {
    if (!this.canvas || !this.storage) return
    
    this.dom.removeChild(this.canvas)
    this.canvas = this.ctx = null

    const roots = this.storage.getRoots()
    for (let i = 0; i < roots.length; i++) {
      roots[i].removeSelfFromZr()
    }
    this.storage.delAllRoots()
  }

  size (opts: {
    width: number;
    height: number;
  }) {
    if (!this.canvas) return

    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const { width, height } = opts || {}
    const canvasData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    if (width) {
      this.canvas.width = Math.round(width * this.dpr)
      this.canvas.style.width = `${width}px`
    }
    if (height) {
      this.canvas.height = Math.round(height * this.dpr)
      this.canvas.style.height = `${height}px`
    }
    ctx.scale(this.dpr, this.dpr)
    ctx.putImageData(canvasData, 0, 0)
  }
}

export function init(dom: HTMLElement, opts: CanvasUtilsOpts) {
  const cu = new CanvasUtils(cuUtil.guid(), dom, opts)
  instances[cu.id] = cu
  return cu
}
