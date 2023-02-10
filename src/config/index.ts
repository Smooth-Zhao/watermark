import { reactive, computed } from 'vue'


export const info = reactive({
  scale: 1,
  width: 0,
  height: 0,
  fontWeight: 800,
  rem: 0.036,
  fontFamily: ''
})

export const padding = computed(() => info.width * info.rem)
export const H1 = computed(() => info.width * 0.03)
export const H2 = computed(() => info.width * 0.02)
export const SPACE = computed(() => info.width * 0.01)

