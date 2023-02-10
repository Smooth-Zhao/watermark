import * as canvasUtils from '@/utils/canvasUtils'
import { info, padding, SPACE } from '@/config'

export interface ICuInstance {
  leftText1: canvasUtils.Text;
  leftText2: canvasUtils.Text;
  rightText1: canvasUtils.Text;
  rightText2: canvasUtils.Text;
  logo: canvasUtils.Image;
}

export async function useTextPosition(cuInstance: ICuInstance | null) {
  if (!cuInstance) return

  const r1 = cuInstance.rightText1
  const r2 = cuInstance.rightText2
  // 计算右侧文本宽度，使两行文本居左对齐
  const rightText1Width = r1.width
  const rightText2Width = r2.width
  const maxWidth = Math.max(rightText1Width, rightText2Width)
  const diff = Math.abs(rightText1Width - rightText2Width)

  const instance = rightText1Width > rightText2Width ? r2 : r1
  instance.attr({
    style: {
      x: info.width - padding.value - diff
    }
  })

  // 相机 Logo
  const logoWidth = cuInstance.logo.width
  cuInstance.logo.attr({
    style: {
      x: info.width - padding.value - maxWidth - (SPACE.value * 2) - logoWidth
    }
  })
}
