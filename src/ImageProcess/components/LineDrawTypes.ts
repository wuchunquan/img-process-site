export type LineType = "straight" | "conic"

export interface LineDrawConfig {
  showHueLine: boolean,//显示色相轴
  hasHueMap: boolean,//包含色相图
  defaultPointsY: number[],//默认值
  defaultLineType: LineType,
  offset: number,//边距
  width: number,//宽度
  height: number,//高度
  xLineHeightProportion: number,//横坐标在y轴上下的位置比
  fontSize: number,
  xRange: number[],//x值的范围
  yRange: number[],//y值的范围
  points: {
    color: string,
    opacity: number
  },
  controlPoint: {
    color?: string,
    opacity?: number,
  },
  xLine: {//样式配置
    color: string,
    opacity: number,
  },
  histogram: {
    show: boolean,
    color:string,
    value: number[]
  }
}