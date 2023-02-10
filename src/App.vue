<template>
  <div class="home">
    <div class="header">
      <div class="title">Photo Watermark</div>
    </div>
    <div class="main global-container">
      <div class="sidebar">
        <div class="btn-group">
          <div
            class="upload-btn btn"
            @click="onUpload"
          >立即上传</div>
          <div
            v-if="!isNull(cu)"
            class="download-btn btn"
            @click="onDownload"
          >下载图片</div>
        </div>
        <div class="panel font">
          <div class="title">字体</div>
          <div class="content">
            <div style="margin-bottom: 12px;">当前字体：{{ info.fontFamily || '无' }}</div>
            <div style="display: flex;">
              <select v-model="fontSelect" class="font-select">
                <option
                  v-for="(item, index) in fonts"
                  :key="index"
                  :value="item.family"
                >{{ item.family }}</option>
              </select>
              <div
                class="btn"
                @click="() => setFont()"
              >应用</div>
            </div>
          </div>
        </div>
        <div v-if="exifOriginal.Make" class="panel">
          <div class="title">EXIF 信息</div>
          <div class="content">
            <div v-for="(item, index) in exifInfo" :key="index" class="item">
              <div class="label">{{ item.label }}：</div>
              <div class="value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="canvas-container">
        <div
          ref="containerRef"
          :class="[{ 'no-canvas': isNull(cu) }]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { convertQualityToBit, file2DataURL, url2Image } from '@/utils/2'
import { isNull, isNumber } from '@/utils/is'
import { keys } from '@/utils'
import { fonts, fontInit } from '@/config/fonts'
import { info } from '@/config'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

import { useCanvas } from '@/hooks/useCanvas'
import { useChooseImage } from '@/hooks/useChooseImage'
import { useWatermark, PhotoExif } from '@/hooks/useWatermark'
import { useAllFont } from '@/hooks/useAllFont'
import { ICuInstance, useTextPosition } from '@/hooks/usePosition'

const containerRef = ref()
const file = ref<File | undefined>(undefined)
const fontSelect = ref('')

// 实例
const cuInstance = ref<ICuInstance | null>(null)

// exif 信息
const exifOriginal = reactive<PhotoExif>({
  Make: '', // 品牌
  Model: '', // 型号
  DateTimeOriginal: null, // 时间
  FocalLengthIn35mmFormat: 0, // 等效焦距
  FNumber: 0, // 光圈
  ISO: 0, // ISO
  ExposureTime: 0, // 快门速度 / 曝光时间
  LensModel: ''
})
const exifInfo = computed(() => {
  return keys(exifOriginal).map(k => {
    let value = exifOriginal[k]
    if (k) {
      // 格式化时间
      if (k === 'DateTimeOriginal') value = dayjs(value).format('YYYY/MM/DD HH:mm')
      // 格式化快门速度
      else if (k === 'ExposureTime' && isNumber(value)) value = `1/${Math.round(1/value)}`
    } else {
      value = '无'
    }
    return {
      label: k,
      value
    }
  })
})

const cu = useCanvas.init()

const init = async () => {
  await fontInit()
  setFont(fonts.value[0]?.family)
}
init()

// 设置字体
async function setFont(v?: string) {
  if (v) fontSelect.value = v
  const index = fonts.value.findIndex(f => f.family === fontSelect.value)
  if (index < 0) return

  const font = fonts.value[index]
  const isLoad = await useAllFont(cu.value, font)
  fonts.value[index].isLoad = isLoad
  if (isLoad) {
    useTextPosition(cuInstance.value as ICuInstance)
    info.fontFamily = font.family
  }
}
// 上传
const onUpload = async () => {

  // 选择照片
  file.value = await useChooseImage()
  if (!file.value) return
  console.log('file: ', file)

  // file 照片转换为 base64
  const photoBase64 = await file2DataURL(file.value)
  if (!photoBase64) return
  // 转换为 Image 标签
  const photo = await url2Image(photoBase64)
  if (!photo) return

  useCanvas(containerRef.value, { photo })
  
  if (!cu.value) return
  // 画上水印
  cuInstance.value = await useWatermark(cu.value, {
    photo,
    exifOriginal
  })
}
// 下载
const onDownload = () => {
  const canvas = cu.value?.canvas
  const ctx = cu.value?.ctx
  if (!canvas || !ctx || !file.value) return

  const quality = 92
  if (['image/jpeg', 'image/jpg'].includes(file.value.type)) {
    canvas.toBlob(blob => {
      if (!blob) return
      saveAs(blob, file.value?.name)
    }, file.value.type, quality / 100)
  } else {
    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data
    const bit = convertQualityToBit(quality)
    console.log('bit: ', bit)
    const png = (window as any).UPNG.encode([imageData.buffer], canvas.width, canvas.height, bit)
    saveAs(new File([png], file.value.name, {
      type: file.value.type,
    }), file.value.name)
  }
}
</script>

<style lang="scss" scoped>
.home {
  .header {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 64px;
    .title {
      color: #333;
      font-size: 32px;
      text-align: center;
    }
  }
  .main {
    display: flex;
    margin: 32px auto;
    .sidebar {
      width: 320px;
      .btn {
        display: inline-block;
        cursor: pointer;
        text-align: center;
        background-color: white;
        width: 120px;
        height: 32px;
        line-height: 32px;
        border-radius: 32px;
        font-size: 14px;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      }
      .btn-group {
        display: flex;
        align-items: center;
        margin: 12px 0 32px;
        .btn {
          margin: 0 auto;
        }
      }
      .panel {
        margin: 24px 0;
        .title {
          color: #333;
          font-size: 24px;
          margin-bottom: 24px;
        }
        .content {
          padding-left: 14px;
          .item {
            color: #333;
            display: flex;
            align-items: center;
            margin: 8px 0;
          }
        }
        &.font .content {
          .font-select {
            flex: 1;
            margin-right: 12px;
          }
        }
      }
    }
    .canvas-container {
      flex: 1;
      .no-canvas {
        width: 80%;
        height: 648px;
        margin: 0 auto;
        max-width: 648px;
        background-color: white;
        box-shadow: 0px 4px 10px 1px #E5E5E5;
      }
      :deep(canvas) {
        display: block;
        margin: 0 auto;
        box-shadow: 0px 4px 10px 1px #E5E5E5;
      }
    }
  }
}
</style>
