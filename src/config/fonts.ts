import { ref } from 'vue'

export interface IFontItem {
  family: string;
  source: string;
  isLoad: boolean
}

export const fonts = ref<IFontItem[]>([])

export async function fontInit() {
  const metaRouters = import.meta.glob('@/assets/fonts/*.*')
  for (let key of Object.keys(metaRouters)) {
    const family = key.replace(/(.*\/)*([^.]+).*/ig, '$2')
    const source = await metaRouters[key]() as any

    fonts.value.push({
      family,
      source: source.default,
      isLoad: false
    }) 
  }
}
