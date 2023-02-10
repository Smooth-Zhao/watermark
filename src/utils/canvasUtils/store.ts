import * as cuUtil from '../index'
import CuElement from './CuElement'

export default class Storage {
  private _roots: CuElement[] | null = [];

  constructor() {}

  addRoot(el: CuElement) {
    if (!this._roots) return

    this._roots.push(el)
  }
  delRoot(el: CuElement) {
    if (!this._roots) return

    const idx = cuUtil.indexOf(this._roots, el)
    console.log('idx', idx)
    if (idx >= 0) {
        this._roots.splice(idx, 1)
    }
  }
  getRoots() {
    if (!this._roots) return []

    return this._roots
  }
  delAllRoots() {
    this._roots = []
  }
  dispose() {
    this._roots = null
  }
}
