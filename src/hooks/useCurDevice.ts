import { computed } from 'vue'

export function useCurDevice() {
  
  const isMobile = computed(() => {
    return /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(navigator.userAgent)
  })
  const isIOS = computed(() => {
    return /(iPhone|iPod|ios|iPad)/i.test(navigator.userAgent)
  })
  const isWechat = computed(() => /micromessenger/i.test(navigator.userAgent.toLowerCase()))

  return {
    isMobile,
    isWechat,
    isIOS
  }
}
