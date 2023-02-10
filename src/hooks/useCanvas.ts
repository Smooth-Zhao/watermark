import { ref, Ref } from 'vue'
import { useCurDevice } from './useCurDevice'
import * as canvasUtils from '../utils/canvasUtils'
import { isNull } from '../utils/is'

const { isIOS } = useCurDevice()
interface IUseCanvasOpts {
  photo: HTMLImageElement;
  config: {
    scale: number;
    width: number;
    height: number;
    fontWeight: number;
    rem: number;
    fontFamily: string;
  };
}

const cu = ref<canvasUtils.CanvasUtils | null>(null)

export function useCanvas(container: HTMLElement, { photo, config }: IUseCanvasOpts) {

  // 获取、换算参数
  // 最大 canvas 分辨率有限制, 限制是针对面积
  // IOS9 以下最大允许 2096 2096 的 canvas，IOS9以上最大允许 4096 4096 (safari 也是)
  let { width, height } = photo
  if (isIOS.value) {
    if (width > height) {
      width = Math.min(photo.width, 4096)
      height = width * photo.height / photo.width
    } else {
      height = Math.min(photo.height, 4096)
      width = height * photo.width / photo.height
    }
  }

  const { innerWidth } = window
  config.scale = Math.round(Math.min(innerWidth - 32, 648) / width * 100) / 100
  config.width = width * config.scale
  config.height = (height + (width * config.rem * 2) + (width * 0.03) + (width * 0.02) + (width * 0.01)) * config.scale

  // 创建画布
  if (!isNull(cu.value)) {
    cu.value = cu.value.dispose()
  }

  cu.value = canvasUtils.init(container, {
    width: config.width,
    height: config.height,
    bgColor: 'white',
    devicePixelRatio: 1 / config.scale
  })
}

useCanvas.init = () => {
  return cu as Ref<canvasUtils.CanvasUtils | null>
}
