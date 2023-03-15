<template>
  <div class="home" @click="showSidebar = false">
    <div class="header">
      <div
        :class="['toggle-btn', { show: showSidebar }]"
        @click.stop="showSidebar = !showSidebar"
      >
        <span />
      </div>
      <div class="title">Photo Watermark</div>
    </div>
    <div class="main global-container">
      <BtnGroup
        :cu="cu"
        @download="onDownload"
        @upload="onUpload"
        class="mobile-group"
      />
      <div :class="['sidebar', { show: showSidebar }]" @click.stop="">
        <BtnGroup
          :cu="cu"
          @download="onDownload"
          @upload="onUpload"
        />
        <Panel title="字体" class="font">
          <div style="margin-bottom: 12px;">当前字体：{{ info.fontFamily || '无' }}</div>
          <div style="display: flex;">
            <select v-model="curSelectFont" class="font-select">
              <option
                v-for="(item, index) in fonts"
                :key="index"
                :value="item.family"
              >{{ item.family }}</option>
            </select>
            <div
              :class="['btn', { disabled: info.fontFamily === curSelectFont }]"
              @click="() => setFont()"
            >应用</div>
          </div>
        </Panel>
        <Panel v-if="exifOriginal.DateTimeOriginal" title="EXIF 信息">
          <div v-for="(item, index) in exifInfo" :key="index" class="item">
            <div class="label">{{ item.label }}：</div>
            <div class="value">{{ item.value }}</div>
          </div>
        </Panel>
      </div>
      <div
          class="canvas-container"
      >
        <div
          :class="{
            dragover: isDragover,
            'no-canvas': isNull(cu)
          }"
          @drop="handleDrop"
          @dragover.prevent="onDrag(1)"
          @dragleave.prevent="onDrag(0)"
          ref="containerRef"
        >
          <div class="tips">可拖拽照片到此处上传</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive, computed, onMounted} from 'vue'
import { convertQualityToBit, file2DataURL, url2Image } from '@/utils/2'
import {is, isNull, isNumber} from '@/utils/is'
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

import BtnGroup from '@/components/BtnGroup.vue'
import Panel from '@/components/Panel.vue'

const containerRef = ref<HTMLDivElement>()
const file = ref<File | undefined>(undefined)
const curSelectFont = ref('')
const showSidebar = ref(false)

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
  setFont(fonts.value[1]?.family)
}
init()

// 设置字体
async function setFont(v?: string) {
  if (v) curSelectFont.value = v
  const index = fonts.value.findIndex(f => f.family === curSelectFont.value)
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
  // 未选择照片
  if (!file.value) return
  console.log('file: ', file)
  // 上传文件
  uploadFile(file.value)
}
// 上传文件
const uploadFile = async (file:File)=>{
  // file 照片转换为 base64
  const photoBase64 = await file2DataURL(file)
  // 转换失败
  if (!photoBase64) return
  // 转换为 Image 标签
  const photo = await url2Image(photoBase64)
  // 转换失败
  if (!photo) return

  // 应用画布
  containerRef.value && useCanvas(containerRef.value, { photo })

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

  // 压缩照片
  const quality = 92
  if (['image/jpeg', 'image/jpg'].includes(file.value.type)) {
    // jpg 的压缩
    canvas.toBlob(blob => {
      if (!blob) return
      saveAs(blob, file.value?.name)
    }, file.value.type, quality / 100)
  } else {
    // png 的压缩
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

/**
 * 拖拽上传
 */
const isDragover = ref(0)
const onDrag = (isOver:number) => {
  isDragover.value = isOver
}
const handleDrop = (e:DragEvent) => {
  e.preventDefault()
  if (!e.dataTransfer) return
  file.value = e.dataTransfer.files[0]
  if (!file.value.type.startsWith('image/')) return
  uploadFile(file.value)
}

</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  .header {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 64px;
    position: relative;
    .title {
      color: #333;
      font-size: 32px;
      text-align: center;
    }
  }
  .main {
    display: flex;
    margin: 32px auto;
    .btn-group {
      display: flex;
      &.mobile-group {
        display: none;
      }
    }
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
        &.disabled {
          color: #999;
          cursor: no-drop;
          background-color: #eee;
        }
      }
      :deep(.panel) {
        .content .item {
          color: #333;
          display: flex;
          align-items: flex-start;
          margin: 8px 0;
          .label {
            font-weight: bold;
          }
          .value {
            color: #666;
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
      .tips {
        display: none;

        font-size: 22px;
        text-align: center;
        line-height: 648px;
        user-select: none;
      }
      .no-canvas {
        width: 80%;
        height: 648px;
        margin: 0 auto;
        max-width: 648px;
        background-color: white;
        box-shadow: 0px 4px 10px 1px #E5E5E5;
        transition: box-shadow .2s ease;
        .tips {
          display: block;
        }
        &.dragover{
          box-shadow: 0 4px 15px 1px #bebebe;
        }
      }
      :deep(canvas) {
        display: block;
        margin: 0 auto;
        box-shadow: 0px 4px 10px 1px #E5E5E5;
      }
    }
  }
}
@media (max-width: 864px) {
  .header {
    padding-top: 0 !important;
    .title {
      font-size: 20px !important;
    }
    .toggle-btn {
      cursor: pointer;
      position: absolute;
      top: 30px;
      left: 26px;
      width: 26px;
      height: 18px;
      &::before, &::after {
        content: '';
        position: absolute;
        top: 0;
      }
      span {
        top: calc(50% + 1px);
        left: 0;
        transform: translateY(-50%);
        position: absolute;
      }
      &::before, &::after, span {
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #333;
        transition: all .3s ease-in-out;
      }
      &::after {
        top: 100%;
      }
      &.show {
        span {
          opacity: 0;
        }
        &::before {
          top: 50%;
          transform: rotate(45deg);
        }
        &::after {
          top: 50%;
          transform: rotate(-45deg);
        }
      }
    }
  }
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 80% !important;
    max-width: 420px;
    height: 100vh;
    padding: 12px;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    transform: translateX(120%);
    transition: .3s all ease-in-out;
    :deep(.panel) {
      .content .item {
        margin: 12px 0 !important;
      }
    }
    &.show {
      transform: translateX(0);
    }
  }
  .no-canvas {
    display: none;
  }
  .main {
    flex-direction: column;
    margin: 0 0 12px !important;
  }
  :deep(.btn-group) {
    display: none !important;
    &.mobile-group {
      display: flex !important;
      margin: 0px 0 32px !important;
    }
  }
}
</style>
