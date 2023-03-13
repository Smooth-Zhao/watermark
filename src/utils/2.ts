
export function url2Blob(url: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      const url = URL.createObjectURL(this.response)
      resolve(url)
    }
    xhr.onerror = function () {
      reject(undefined)
    }
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.send()
  })
}
export function file2DataURL(file: File): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      if (fileReader.result && typeof fileReader.result == 'string') {
        resolve(fileReader.result)
      }else {
        reject(undefined)
      }
    }
    fileReader.onerror = () => reject(undefined)
    fileReader.readAsDataURL(file)
  })
}
export function url2Image(url: string): Promise<HTMLImageElement | undefined> {
  return new Promise((resolve) => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      resolve(undefined)
    }
  })
}
export const convertQualityToBit = (quality: number) => {
  let bit = 0
  if (quality > 100 || quality < 0) {
    bit = 0
  } else {
    bit = !quality ? 0 : quality * 256 * 0.01
  }
  return bit
}
