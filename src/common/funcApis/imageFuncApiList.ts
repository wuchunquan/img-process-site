import type { FuncApi } from '@/common/types/apiCommonTypes'
import { funcApiParamDefaultValue } from '@/common/types/apiCommonTypes'

export const imageOwnerNameDic = {
  imageEnhance: '增强',
  imageProcess: '处理',
  imageSelect: '图像选择',
  input: '输入'
}
export const imageFuncApiList: FuncApi[] = [
  {
    name: '对比度',
    key: 'contrastRatio',
    owner: 'imageEnhance',
    params: [
      {
        name: '对比度',
        key: 'value',
        config: {
          default: 50,
          type: 'float',
          min: 0,
          max: 100
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '饱和度',
    key: 'saturation',
    owner: 'imageEnhance',
    params: [
      {
        name: '饱和度',
        key: 'value',
        config: {
          default: 50,
          type: 'float',
          min: 0,
          max: 100
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '亮度',
    key: 'brightness',
    owner: 'imageEnhance',
    params: [
      {
        name: '亮度',
        key: 'value',
        config: {
          default: 50,
          type: 'float',
          min: 0,
          max: 100
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色相',
    key: 'hue',
    owner: 'imageEnhance',
    params: [
      {
        name: '色相',
        key: 'value',
        config: {
          default: 50,
          type: 'float',
          min: 0,
          max: 100
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '颜色公式',
    key: 'colorFormula',
    owner: 'imageProcess',
    params: [
      {
        name: '颜色公式',
        key: 'value',
        config: {
          default: '',
          type: 'string'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色彩曲线',
    key: 'colorLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.rgbLine,
          type: 'rgbLine'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '亮度曲线',
    key: 'brightnessLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.line,
          type: 'line'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '明度曲线',
    key: 'lightnessLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.line,
          type: 'line'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '饱和度曲线',
    key: 'saturationLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.line,
          type: 'line'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色阶曲线',
    key: 'colorScaleLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.line,
          type: 'line'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色相曲线',
    key: 'hueLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.hueLine,
          type: 'hueLine'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色相饱和度曲线',
    key: 'hueSaturationLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.hueLine,
          type: 'hueLine'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色相亮度曲线',
    key: 'hueBrightnessLine',
    owner: 'imageProcess',
    params: [
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.hueLine,
          type: 'hueLine'
        }
      },
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  },
  {
    name: '色相明度曲线',
    key: 'hueLightnessLine',
    owner: 'imageProcess',
    params: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      },
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      },
      {
        name: '曲线',
        key: 'value',
        config: {
          default: funcApiParamDefaultValue.hueLine,
          type: 'hueLine'
        }
      }
    ],
    outParams: [
      {
        name: '图像数据',
        key: 'image',
        config: {
          type: 'imageData'
        }
      }
    ]
  }
]
