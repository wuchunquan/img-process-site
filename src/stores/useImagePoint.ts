import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ImagePoint {
  hsl: [number, number, number]
  hsv: [number, number, number]
  rgb: [number, number, number]
}

export const useImagePoint = defineStore('imagePoint', () => {
  const imagePoint = ref<ImagePoint>({
    hsl: [0, 0, 0],
    hsv: [0, 0, 0],
    rgb: [0, 0, 0]
  })
  function setImagePoint(imagePointValue: ImagePoint) {
    imagePoint.value = imagePointValue
  }
  return { imagePoint, setImagePoint }
})
