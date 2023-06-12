import type { GPU } from 'gpu.js'

export const funcApiParamDefaultValue = {
  int: 0,
  float: 0,
  string: '',
  option: null,
  rgbLine: {
    r: {
      pointsY: new Array(256).fill(1).map((v, i) => i / (256 - 1)),
      controlPointsX: []
    } as LineDrawValue,
    g: {
      pointsY: new Array(256).fill(1).map((v, i) => i / (256 - 1)),
      controlPointsX: []
    } as LineDrawValue,
    b: {
      pointsY: new Array(256).fill(1).map((v, i) => i / (256 - 1)),
      controlPointsX: []
    } as LineDrawValue,
    select: 'r'
  },
  line: {
    pointsY: new Array(256).fill(1).map((v, i) => i / (256 - 1)),
    controlPointsX: []
  } as LineDrawValue,
  hueLine: {
    pointsY: new Array(360).fill(0.5),
    controlPointsX: []
  } as LineDrawValue
}

export type FileType = 'image/png' | 'image/jpeg' | 'audio/mpeg'

export interface FuncApi {
  name: string
  key: string
  owner: string
  type?: string | 'input'
  params?: FuncApiParam[]
  outParams?: FuncApiParam[]
}

export interface FuncApiParam {
  name: string
  key: string
  config:
    | ParamInt
    | ParamFloat
    | ParamStr
    | ParamOption
    | ParamLine
    | ParamRgbLine
    | ParamHueLine
    | ParamChooseFile
    | ParamFile
    | ParamImageData
    | ParamImageProcessGpu
}

export interface FuncApiOwner {
  name: string
  key: string
  funcList: FuncApi[]
}

export interface ParamInt {
  type: 'int'
  value?: number
  default?: number
  max?: number
  min?: number
}

export interface ParamFloat {
  type: 'float'
  value?: number
  default?: number
  max?: number
  min?: number
}

export interface ParamStr {
  type: 'string'
  value?: string
  default?: string
}

export interface ParamOption {
  type: 'option'
  value?: any
  default?: any
  options: { label: string; value: any }[]
}

export interface LineDrawValue {
  pointsY: number[]
  controlPointsX: []
}

export interface ColorLineDrawValue {
  r: LineDrawValue
  g: LineDrawValue
  b: LineDrawValue
  select: string
}

export interface ParamLine {
  type: 'line'
  value?: LineDrawValue
  default?: LineDrawValue
}

export interface ParamRgbLine {
  type: 'rgbLine'
  value?: ColorLineDrawValue
  default?: ColorLineDrawValue
}

export interface ParamHueLine {
  type: 'hueLine'
  value?: LineDrawValue
  default?: LineDrawValue
}

export interface ParamImageData {
  type: 'imageData'
  value?: ImageData
  default?: ImageData
}

export interface ParamImageProcessGpu {
  type: 'imageProcessGpu'
  value?: GPU
  default?: null | GPU | undefined
}

export interface ParamChooseFile {
  type: 'chooseFile'
  value?: TheFile
  default?: string
  fileTypes: FileType[]
}

export interface ParamFile {
  type: 'file'
  value?: TheFile
  default?: TheFile | null | undefined
}

export interface TheFile {
  md: string
  url: string
  fileType: FileType
  default?: FileType | null | undefined
}
