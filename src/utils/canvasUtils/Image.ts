import { isNumber } from '../is'
import CuElement, { ElementProps } from './CuElement'

interface ImageStyleProps {
  x?: number;
  y?: number;
  image?: HTMLImageElement;
  width?: number | 'auto';
  height?: number | 'auto';
}
interface ImageProps extends ElementProps {
  style?: ImageStyleProps;
}

class CUText extends CuElement<ImageProps> {
  type = 'text';
  width: number = 0;
  height: number = 0;

  constructor(opts?: ImageProps) {
    super(opts)
    this._setWH()
  }
  _setWH() {
    const { image, width = image.naturalWidth, height = image.naturalHeight } = this.style
    if (!image) return
    
    let w = isNumber(width) ? width : image.naturalWidth,
    h = isNumber(height) ? height : image.naturalHeight
    if (width === 'auto' && isNumber(height)) {
      w = image.naturalWidth * height / image.naturalHeight
      h = height
    } else if (height === 'auto' && isNumber(width)) {
      w = width
      h = image.naturalHeight * width / image.naturalWidth
    }
    
    this.width = w
    this.height = h
  }

  draw() {
    const ctx = this.__cu?.ctx
    if (!ctx) return

    const { image, x = 0, y = 0 } = this.style
    if (!image) return

    ctx.drawImage(image, x, y, this.width, this.height)
  }
}

export default CUText
