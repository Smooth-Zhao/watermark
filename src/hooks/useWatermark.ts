import { url2Image } from '@/utils/2'
import * as canvasUtils from '@/utils/canvasUtils'
import exifr from 'exifr'
import dayjs from 'dayjs'
import getLogo from '@/config/logo'
import { info, H1, H2, SPACE, padding } from '@/config'

export interface PhotoExif {
  Make: string; // 品牌
  Model: string; // 型号
  DateTimeOriginal: Date | null, // 时间
  FocalLengthIn35mmFormat: number; // 等效焦距
  FNumber: number; // 光圈
  ISO: number; // ISO
  ExposureTime: number; // 快门速度 / 曝光时间
  LensModel: string; // 镜头信息
}
interface IOpts {
  photo: HTMLImageElement;
  exifOriginal: PhotoExif;
}
export async function useWatermark(cu: canvasUtils.CanvasUtils, {
  photo,
  exifOriginal
}: IOpts) {

  // 设置照片
  const image = new canvasUtils.Image({
    style: {
      image: photo,
      width: info.width,
      height: 'auto'
    }
  })
  cu.add(image)
  const exif = await exifr.parse(photo, Object.keys(exifOriginal))
  if (exif) Object.assign(exifOriginal, exif)
  console.log('exif: ', exif)
  
  // logo
  const logoDom = await url2Image(getLogo(exif.Make))

  const fontParams = {
    fontWeight: info.fontWeight,
    fontFamily: info.fontFamily
  }
  
  // 左侧文字
  const leftText1 = new canvasUtils.Text({
    style: {
      text: exif.Model ? exif.Model : '',
      size: H1.value,
      x: padding.value,
      y: image.height + padding.value,
      ...fontParams
    }
  })
  cu.add(leftText1)
  const leftText2 = new canvasUtils.Text({
    style: {
      text: exif.Model ? dayjs(exif.DateTimeOriginal).format('YYYY/MM/DD HH:mm') : '',
      color: '#625f5f',
      size: H2.value,
      x: padding.value,
      y: image.height + padding.value + H1.value + SPACE.value,
      ...fontParams
    }
  })
  cu.add(leftText2)

  // 右侧文字
  const { FocalLengthIn35mmFormat, FNumber, ISO, ExposureTime } = exif
  const unit = ['%dMM', 'F/%d', 'ISO%d', '1/%dS']
  const photoParams = exif
    ? [FocalLengthIn35mmFormat, FNumber, ISO, ExposureTime].reduce((t, c, i) => {
      const value = i === 3 ? Math.round(1 / c) : c
      const space = i === 3 ? '' : ' '
      return t + (!value ? '' : `${unit[i].replace('%d', value)}${space}`)
    }, '')
    : ''

  const rightText1 = new canvasUtils.Text({
    style: {
      text: photoParams,
      textAlign: 'right',
      size: H1.value,
      x: info.width - padding.value,
      y: image.height + padding.value,
      ...fontParams
    }
  })
  const LensModel = exif.LensModel !== '----' ? exif.LensModel.replace(`${exif.Model} `, '') : ''
  const rightText2 = new canvasUtils.Text({
    style: {
      text: LensModel,
      textAlign: 'right',
      color: '#625f5f',
      size: H2.value,
      x: info.width - padding.value,
      y: image.height + padding.value + H1.value + SPACE.value,
      ...fontParams
    }
  })
  cu.add(rightText1)
  cu.add(rightText2)

  // 计算右侧文本宽度，使两行文本居左对齐
  const rightText1Width = rightText1.width
  const rightText2Width = rightText2.width
  const maxWidth = Math.max(rightText1Width, rightText2Width)
  const diff = Math.abs(rightText1Width - rightText2Width)

  const instance = rightText1Width > rightText2Width ? rightText2 : rightText1
  instance.attr({
    style: {
      x: info.width - padding.value - diff
    }
  })

  // 相机 Logo
  if (!logoDom) return null

  const logoHeight = H1.value + H2.value
  const logoWidth = (logoDom.naturalWidth * logoHeight / logoDom.naturalHeight)
  const logo = new canvasUtils.Image({
    style: {
      image: logoDom,
      x: info.width - padding.value - maxWidth - (SPACE.value * 2) - logoWidth,
      y: image.height + padding.value + SPACE.value / 2,
      width: logoWidth,
      height: logoHeight
    }
  })
  cu.add(logo)

  return {
    leftText1,
    leftText2,
    rightText1,
    rightText2,
    logo
  }
}
