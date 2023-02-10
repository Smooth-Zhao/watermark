import * as canvasUtils from '@/utils/canvasUtils'
import { IFontItem } from '@/config/fonts'

export async function useAllFont(
  cu: canvasUtils.CanvasUtils | null,
  { family, source, isLoad }: IFontItem
) {
  try {
    if (!isLoad) {
      const font = new FontFace(family, `url(${source})`);
      (document.fonts as any).add(await font.load())
    }
  
    if (!cu) return true
    
    cu.storage?.traverse(function(el) {
      if (el.type === 'text') {
        el.attr({
          style: {
            fontFamily: family
          }
        })
      }
    })
    return true
  } catch {
    return false
  }
}
