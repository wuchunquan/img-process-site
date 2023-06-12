import type { FuncApi, TheFile } from '@/common/types/apiCommonTypes'

function fileSelect({ value }: { value: TheFile }) {
  return { value }
}

export const inputFuncMap = {
  fileSelect
}
export const inputFuncApiList: FuncApi[] = [
  {
    key: 'fileSelect',
    name: '文件选择',
    type: 'input',
    owner: 'input',
    params: [
      {
        name: '选择文件',
        key: 'value',
        config: {
          type: 'chooseFile',
          fileTypes: []
        }
      }
    ],
    outParams: [
      {
        name: '文件',
        key: 'value',
        config: {
          type: 'file'
        }
      }
    ]
  },
  {
    key: 'createImageProcessGpu',
    name: '创建图像处理GPU',
    type: 'input',
    owner: 'input',
    // params: [
    //     {
    //         name: '图像数据',
    //         key: 'image',
    //         config: {
    //             type: "imageData"
    //         }
    //     }
    // ],
    outParams: [
      {
        name: '图像处理GPU',
        key: 'gpu',
        config: {
          type: 'imageProcessGpu'
        }
      }
    ]
  },
  {
    key: 'getImageDataFromTheFile',
    name: '获取图像数据',
    type: 'input',
    owner: 'input',
    params: [
      {
        name: '图片',
        key: 'file',
        config: {
          type: 'file'
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
