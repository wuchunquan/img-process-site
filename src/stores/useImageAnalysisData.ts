import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ImageAnalysisData {
  count: {
    r: number[]
    g: number[]
    b: number[]
    scale: number[]
  }
}

export const useImageAnalysisData = defineStore('imageAnalysisData', () => {
  const imageAnalysisData = ref<ImageAnalysisData>({
    count: { r: [], g: [], b: [], scale: [] }
  })

  function setImageAnalysisData(imageAnalysisDataValue: ImageAnalysisData) {
    imageAnalysisData.value = imageAnalysisDataValue
  }

  return { imageAnalysisData, setImageAnalysisData }
})
