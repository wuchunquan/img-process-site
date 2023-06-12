<template>
  <div :style="{width:(width+useConfig.offset)+'px',height:(height+useConfig.offset*2)+'px'}"
       class="select-none">
    <svg style="position: relative;z-index: 2"
         :width="width+useConfig.offset*2" :height="height+useConfig.offset*2"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hue_line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgb(255,0,0)"></stop>
          <stop offset="16.66%" stop-color="rgb(255,255,0)"></stop>
          <stop offset="33.3%" stop-color="rgb(0,255,0)"></stop>
          <stop offset="50%" stop-color="rgb(0,255,255)"></stop>
          <stop offset="66.6%" stop-color="rgb(0,0,255)"></stop>
          <stop offset="83%" stop-color="rgb(255,0,255)"></stop>
          <stop offset="100%" stop-color="rgb(255,0,0)"></stop>
        </linearGradient>
      </defs>
      <text :x="useConfig.offset+8" @click="rest" fill="white" cursor="pointer" fill-opacity="0.7"
            :y="useConfig.offset-useConfig.fontSize/2-4">
        重置
      </text>
      <polyline
          :points="`${useConfig.offset},${height*(1-useConfig.xLineHeightProportion)+useConfig.offset} ${width+useConfig.offset-1},${height*(1-useConfig.xLineHeightProportion)+useConfig.offset}`"
          :fill="useConfig.xLine.color"
          :stroke="useConfig.xLine.color"
          :fill-opacity="useConfig.xLine.opacity"
          :stroke-opacity="useConfig.xLine.opacity"
          stroke-width="2"></polyline>
      <polyline
          :points="`${useConfig.offset},${useConfig.offset} ${useConfig.offset},${height+useConfig.offset}`"
          :fill="useConfig.xLine.color"
          :stroke="useConfig.xLine.color"
          :fill-opacity="useConfig.xLine.opacity"
          :stroke-opacity="useConfig.xLine.opacity"
          stroke-width="2"></polyline>
      <polyline cursor="pointer" :points="pointsLineStr"
                :stroke="useConfig.points.color"
                style="fill:none;stroke-width:2"/>
      <polyline @click="addDragPoint" cursor="pointer" :points="pointsLineStr"
                style="fill:none;stroke:white;stroke-width:8;stroke-opacity: 0;"/>
      <polyline :points="histogramLineStr"
                v-if="useConfig.histogram.show&&useConfig.histogram.value"
                :stroke="useConfig.histogram.color"
                :stroke-opacity="0.2"
                style="fill:none;stroke-width:2;"/>
      <circle
          @mousedown="(e)=>startPointDrag(e,point)"
          @click.right.prevent="(e)=>deleteDragPoint(e,point)"
          cursor="pointer"
          v-for="point in controlPoints"
          :cx="point[0]+useConfig.offset"
          :cy="height-point[1]+useConfig.offset"
          r="4"
          stroke="yellow"
          stroke-width="2"
          fill="yellow"
      />
      <circle
          v-if="markPoint!==null"
          :cx="markPoint*width+useConfig.offset"
          :cy="height+useConfig.offset"
          r="4"
          stroke="pink"
          stroke-width="2"
          fill="pink"
      />
      <rect v-if="useConfig.showHueLine" height="8" :width="width" :x="useConfig.offset"
            :y="height+useConfig.offset+6"
            fill="url(#hue_line)"></rect>
      <text
          v-if="useConfig.hasHueMap"
          :x="useConfig.offset+8+useConfig.fontSize*3+14" @click="changeHueMapShow" fill="white" cursor="pointer"
          fill-opacity="0.7"
          :y="useConfig.offset-useConfig.fontSize/2-4">
        色相图
      </text>
      <foreignObject :x="useConfig.offset+8+useConfig.fontSize*12+14" :y="useConfig.offset-22"
                     style="width: 120px;height: 24px">
        <select v-model="lineType" style="background: #7575752b">
          <option value="conic" style="background: #2b2b30">曲线</option>
          <option value="straight" style="background: #2b2b30">直线</option>
        </select>
        <select v-model="scale" style="margin-left:10px;background: #7575752b">
          <option v-for="item in [1,1.25,1.5,1.75,2]" :value="item" style="background: #2b2b30">{{ item }}</option>
        </select>
      </foreignObject>
    </svg>
    <canvas
        class="hue-map"
        :id="canvasId" :width="width" :height="height"
        :style="{marginTop:(-height-useConfig.offset)+'px', marginLeft:(useConfig.offset)+'px'}"
        v-show="hueMapShow"
    ></canvas>

  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, computed, watch} from "vue";
import {merge} from "@/common/utils";
import type { LineDrawConfig, LineType } from "./LineDrawTypes";



const lineDrawConfigDefault: LineDrawConfig = {
  showHueLine: false,//显示色相轴
  hasHueMap: false,//包含色相图
  defaultPointsY: [],//默认值
  offset: 20,
  width: 256,//宽度
  height: 256,//高度
  defaultLineType: "conic",
  xLineHeightProportion: 0,//横坐标在y轴上下的位置比
  xRange: [0, 255],//x值的范围
  yRange: [0, 1],//y值的范围
  fontSize: 6,
  points: {
    color: "red",
    opacity: 1
  },
  controlPoint: {
    color: "rgb(251,255,144)",
    opacity: 0.6,
  },
  xLine: {//样式配置
    color: "white",
    opacity: 0.6,
  }, histogram: {
    show: false,
    color:"grey",
    value: []
  }
}
type Point = [number, number]
type ModelValue = { controlPointsX: number[], pointsY: number[] }

function copy(obj: any): typeof obj {
  if (!obj) {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}

const props = withDefaults(defineProps<{
  config?: Partial<LineDrawConfig>,
  modelValue: ModelValue,
  markPoint?:null|number
}>(), {})
const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void
  (e: 'change', value: ModelValue): void
}>()
const pointsY = ref<number[]>([])
const lineType = ref<LineType>("conic")
const controlPoints = ref<Point[]>([])
const useConfig = ref<LineDrawConfig>(lineDrawConfigDefault)
const dragInfo = ref({
  point: [0, 0] as Point,
  start: [0, 0],
  mouseStart: [0, 0],
})
const canvasId = ref('canvas__' + Math.random())
const scale = ref(1)
const hueMapShow = ref(false)
const histogramValue = ref([])
const histogramLineStr = computed(() => {
      const max = Math.max(...useConfig.value.histogram.value)
      const length = useConfig.value.histogram.value.length
      const ratio = height.value / max / 2
      return useConfig.value.histogram.value.map((y, i) => {
        return `${i * width.value/length + useConfig.value.offset},${height.value - y * ratio + useConfig.value.offset}`
      }).join(' ')
    }
)
const pointsLineStr = computed(() =>
    pointsY.value.map((y, i) => {
      return `${i + useConfig.value.offset},${height.value - y + useConfig.value.offset}`
    }).join(' ')
)
const width = computed(() => Math.round(scale.value * useConfig.value.width))
const height = computed(() => Math.round(scale.value * useConfig.value.height))

watch(scale, (newValue, oldValue) => {
  const ratio = newValue / oldValue
  pointsY.value = lineInterpolation(pointsY.value.map(y => ratio * y), Math.ceil(width.value))
  controlPoints.value = controlPoints.value.map(point => {
    let x = Math.round(point[0] * ratio)
    let y = Math.round(point[1] * ratio)
    return [x, y]
  })

})
watch(()=>props.config?.histogram?.value,(newValue)=>{
  if(newValue){
    useConfig.value.histogram.value=newValue
  }
})
function initConfig() {
  if (props.config) {
    //这里一定要用copy，不然会破坏双向绑定
    useConfig.value = merge<LineDrawConfig>(copy(lineDrawConfigDefault), copy(props.config))
  } else {
    useConfig.value = copy(lineDrawConfigDefault)
  }
  if (!useConfig.value.defaultPointsY || useConfig.value.defaultPointsY.length == 0) {
    useConfig.value.defaultPointsY = new Array(useConfig.value.width).fill(0).map((v, i) => {
      return i / useConfig.value.height
    })
  }
  lineType.value = useConfig.value.defaultLineType
}

function pointsYConvertIn(pointsY: number[]) {
  const arr = pointsY.map(y => Math.round(y / (useConfig.value.yRange[1] - useConfig.value.yRange[0]) * height.value))
  return lineInterpolation(arr, Math.ceil(width.value))
}

function pointsYConvertOut(pointsY: number[]) {
  const arr = pointsY.map(y => y / height.value * (useConfig.value.yRange[1] - useConfig.value.yRange[0]))
  return lineInterpolation(arr, useConfig.value.width)
}

function initModelValue() {
  if (props.modelValue.pointsY && props.modelValue.pointsY.length > 0) {
    pointsY.value = copy(props.modelValue.pointsY)
  } else {
    pointsY.value = copy(useConfig.value.defaultPointsY)
  }

  pointsY.value = pointsYConvertIn(pointsY.value)

  controlPoints.value = props.modelValue.controlPointsX.map(x => {
    return [x, pointsY.value[x]]
  })
}

onMounted(() => {
  initConfig()
  initModelValue()
})

function lineFit(x1: number, y1: number, x2: number, y2: number) {
  let k = (y1 - y2) / (x2 - x1) ** 2
  if (k < 100) {
    return (x: number) => (y1 - (x - x1) ** 2 * k)
  } else {
    return straightLineFit(x1, y1, x2, y2)
  }
}

function straightLineFit(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => (y1 - y2) / (x1 - x2) * x + (y2 * x1 - y1 * x2) / (x1 - x2)
}


function rest() {
  pointsY.value = pointsYConvertIn(copy(useConfig.value.defaultPointsY))
  controlPoints.value = []
  change()
}

function fitPoints(point: Point) {
  const index = controlPoints.value.indexOf(point)
  const length = controlPoints.value.length
  let fitPointsList: Point[] = []
  if (index == 0 && length != 1) {
    fitPointsList = [[0, pointsY.value[index]], point, controlPoints.value[index + 1]]
  } else if (index == controlPoints.value.length - 1 && length != 1) {
    fitPointsList = [controlPoints.value[index - 1], point, [width.value - 1, pointsY.value.slice(-1)[0]]]
  } else {
    if (length == 1) {
      fitPointsList = [[0, pointsY.value[0]], point, [width.value - 1, pointsY.value.slice(-1)[0]]]
    } else {
      fitPointsList = [controlPoints.value[index - 1], point, controlPoints.value[index + 1]]
    }
  }
  let point1 = fitPointsList[0]
  let point2 = fitPointsList[1]
  let point3 = fitPointsList[2]
  if (point1[0] != point2[0] && point2[0] != point3[0]) {
    let k1 = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let k2 = (point3[1] - point2[1]) / (point3[0] - point2[0])
    if (Math.abs(Math.atan(k2) - Math.atan(k1)) / (2 * Math.PI) * 360 < 10) {
      const lineLeft = straightLineFit(point1[0], point1[1], point2[0], point2[1])
      const lineRight = straightLineFit(point2[0], point2[1], point3[0], point3[1])
      for (let i = point1[0]; i < point2[0]; i++) {
        pointsY.value[i] = lineLeft(i)
      }
      for (let i = point2[0]; i < point3[0]; i++) {
        pointsY.value[i] = lineRight(i)
      }
      return
    }
  }
  let lineLeft, lineRight
  if (lineType.value == 'straight') {
    lineLeft = straightLineFit(fitPointsList[1][0], fitPointsList[1][1], fitPointsList[0][0], fitPointsList[0][1])
    lineRight = straightLineFit(fitPointsList[1][0], fitPointsList[1][1], fitPointsList[2][0], fitPointsList[2][1])
  } else {
    lineLeft = lineFit(fitPointsList[1][0], fitPointsList[1][1], fitPointsList[0][0], fitPointsList[0][1])
    lineRight = lineFit(fitPointsList[1][0], fitPointsList[1][1], fitPointsList[2][0], fitPointsList[2][1])
  }
  for (let i = fitPointsList[0][0]; i < fitPointsList[1][0]; i++) {
    pointsY.value[i] = lineLeft(i)
  }
  if (fitPointsList[1][0] !== fitPointsList[2][0]) {
    for (let i = fitPointsList[1][0]; i < fitPointsList[2][0]; i++) {
      pointsY.value[i] = lineRight(i)
    }
  } else {
    pointsY.value[fitPointsList[1][0]] = fitPointsList[1][1]
  }
}

function addDragPoint(e: MouseEvent) {
  const y = height.value - (e.offsetY - useConfig.value.offset)
  const x = e.offsetX - useConfig.value.offset
  if (!controlPoints.value.find(point => Math.abs(point[0] - x) < 2 && Math.abs(point[1] - y) < 2)) {
    const distanceArray = pointsY.value.map((v, i) => ((i - x) ** 2 + (v - y) ** 2))
    const minNum = Math.min(...distanceArray)
    const index = distanceArray.indexOf(minNum)
    controlPoints.value.push([index, pointsY.value[index]])
    controlPoints.value = controlPoints.value.sort((a, b) => a[0] - b[0])
  }
}

function movePoint(e: MouseEvent) {
  let x = 0, y = 0
  x = dragInfo.value.start[0] + (e.x - dragInfo.value.mouseStart[0])
  y = dragInfo.value.start[1] - (e.y - dragInfo.value.mouseStart[1])
  if (x > width.value + 1) {
    x = width.value + 1
  }
  if (x < 0) {
    x = 0
  }
  if (y > height.value) {
    y = height.value
  }
  if (y < 0) {
    y = 0
  }
  const index = controlPoints.value.indexOf(dragInfo.value.point)
  const length = controlPoints.value.length
  let xMin = -2
  let xMax = width.value
  if (index > 0) {
    xMin = controlPoints.value[index - 1][0]
  }
  if (index < length - 1) {
    xMax = controlPoints.value[index + 1][0]
  }
  if (x >= xMin && x < xMax) {
    dragInfo.value.point[0] = x
  }
  dragInfo.value.point[1] = y
  fitPoints(dragInfo.value.point)
}

function startPointDrag(e: MouseEvent, point: Point) {
  dragInfo.value.mouseStart[0] = e.x
  dragInfo.value.mouseStart[1] = e.y
  dragInfo.value.point = point
  dragInfo.value.start = [...point]
  window.addEventListener('mousemove', movePoint)
  window.addEventListener('mouseup', endPointDrag)

}

function deleteDragPoint(e: MouseEvent, point: Point) {
  const index = controlPoints.value.indexOf(point)
  controlPoints.value.splice(index, 1)
}

function change() {
  const emitPointsY = pointsYConvertOut(pointsY.value)
  emit('update:modelValue', {
    pointsY: emitPointsY, controlPointsX: controlPoints.value.map(item => item[0])
  })
  emit('change', {
    pointsY: emitPointsY, controlPointsX: controlPoints.value.map(item => item[0])
  })
}

function endPointDrag(e: MouseEvent) {
  window.removeEventListener('mousemove', movePoint)
  window.removeEventListener('mouseup', endPointDrag)
  change()
}

function drawHueMap() {
  let rx = 255, gx = 255, bx = 255
  const w = width.value
  const h = height.value
  const part = width.value / 6
  const hueColorArr = new Array(w).fill(0).map((v, x) => {
    if (x < part) {
      rx = 255
      gx = 255 * x / part
      bx = 0
    } else if (x < part * 2) {
      rx = 255 - 255 * (x - part) / part
      gx = 255
      bx = 0
    } else if (x < part * 3) {
      rx = 0
      gx = 255
      bx = 255 * (x - part * 2) / part
    } else if (x < part * 4) {
      rx = 0
      gx = 255 - 255 * (x - part * 3) / part
      bx = 255
    } else if (x < part * 5) {
      rx = 255 * (x - part * 4) / part
      gx = 0
      bx = 255
    } else {
      rx = 255
      gx = 0
      bx = 255 - 255 * (x - part * 5) / part
    }
    return [rx, gx, bx, 255]
  })
  const arr: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      arr.push(...hueColorArr[(x + w * 2 - y * 2 + w) % w])
    }
  }
  const imgData = new ImageData(new Uint8ClampedArray(arr), w, h)
  const el = document.getElementById(canvasId.value) as HTMLCanvasElement
  if (el) {
    const ctx = el.getContext('2d')
    if (ctx) {
      ctx.putImageData(imgData, 0, 0)
    }
  }
}

// 线性插值
function lineInterpolation(arr, length) {
  const straightLineFit = (x1, y1, x2, y2) => (x) => (y1 - y2) / (x1 - x2) * x + (y2 * x1 - y1 * x2) / (x1 - x2)
  const orgLength = arr.length
  const newArr = [arr[0]]
  if (orgLength <= 1) {
    return [...arr]
  }
  const ratio = (orgLength - 1) / (length - 1)
  for (let i = 1; i < length - 1; i++) {
    const transI = ratio * i
    const indexLeft = Math.ceil(transI) - 1
    const v = straightLineFit(indexLeft, arr[indexLeft], indexLeft + 1, arr[indexLeft + 1])(transI)
    newArr.push(v)
  }
  newArr.push(arr.slice(-1)[0])
  return newArr
}

function changeHueMapShow() {
  hueMapShow.value = !hueMapShow.value
  if (hueMapShow.value) {
    drawHueMap()
  }
}


</script>

<style scoped>
.hue-map {
  position: relative;
  z-index: 1;
}

.histogram {
  position: relative;
  z-index: 1;
}

select:focus-visible {
  outline: none;
}
</style>