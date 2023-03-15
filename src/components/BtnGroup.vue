<template>
  <div class="btn-group">
    <div
      class="upload-btn btn"
      @click="() => emit('upload')"
    >立即上传</div>
    <div
      v-if="!isNull(props.cu)"
      class="download-btn btn"
      @click="() => emit('download')"
    >下载图片</div>
  </div>
</template>

<script lang='ts' setup>
import * as canvasUtils from '@/utils/canvasUtils'
import { isNull } from '@/utils/is'

const emit = defineEmits(['upload', 'download'])
const props = withDefaults(defineProps<{
  cu: canvasUtils.CanvasUtils | null
}>(), {})

</script>

<style lang='scss' scoped>
.btn-group {
  display: flex;
  align-items: center;
  margin: 12px 0 32px;
  .btn {
    margin: 0 auto;
    display: inline-block;
    cursor: pointer;
    text-align: center;
    background-color: white;
    width: 120px;
    height: 32px;
    line-height: 32px;
    border-radius: 32px;
    font-size: 14px;
    user-select: none;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }
}
</style>
