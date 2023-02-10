import { isNumber } from '../is'
import CuElement, { ElementProps } from './CuElement'

interface TextStyleProps {
  x?: number;
  y?: number;
  text?: string;
  color?: string;
  size?: number;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
}
interface TextProps extends ElementProps  {
  style?: TextStyleProps;
}

class CUText extends CuElement<TextProps> {
  type = 'text';
  width: number = 0;

  constructor(opts?: TextProps) {
    super(opts)
  }

  draw() {
    const ctx = this.__cu?.ctx
    if (!ctx) return

    ctx.save()
    ctx.textBaseline = 'top'
    const {
      text = '',
      x = 0,
      y = 0,
      color = 'black',
      size = 16,
      fontWeight = '',
      textAlign = 'left',
      fontFamily
    } = this.style
    
    ctx.textAlign = textAlign
    ctx.fillStyle = color
    let font = `${fontWeight}`
    font += isNumber(size) ? ` ${(Math.round(size * 100) / 100)}px` : ` ${size}`
    font += ` ${fontFamily ? fontFamily : 'serif'}`
    ctx.font = font
    ctx.textAlign = textAlign
    ctx.fillStyle = color
    this.width = ctx.measureText(text).width || 0
    
    ctx.fillText(text, x, y)
    ctx.restore()
  }
}

export default CUText
