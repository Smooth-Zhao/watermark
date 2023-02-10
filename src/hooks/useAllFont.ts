import * as canvasUtils from '@/utils/canvasUtils'

export async function useAllFont(cu: canvasUtils.CanvasUtils | null, { family, source, isLoad }: {
  family: string;
  source: string;
  isLoad: boolean
}) {
  try {
    if (!isLoad) {
      const font = new FontFace(family, `url(${source})`);
      (document.fonts as any).add(await font.load())
    }
  
    if (!cu) return true
    console.log('traverse')
    cu.storage?.traverse(function(el) {
      console.log('el: ', el)
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
