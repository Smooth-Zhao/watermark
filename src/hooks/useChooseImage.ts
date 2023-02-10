
const input = document.createElement('input')
input.type = 'file'

export function useChooseImage(accept = 'image/*'): Promise<File | undefined> {
  return new Promise((resolve) => {
  
    input.accept = accept
    input.click()

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      input.value = ''
      resolve(file)
    }
  })
}
