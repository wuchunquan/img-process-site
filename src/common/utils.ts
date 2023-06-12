// import SparkMD5 from 'spark-md5'
export function parseJwt(token: string) {
  const strings = token.split('.') //截取token，获取载体
  const info = JSON.parse(
    decodeURIComponent(
      window.atob(strings[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
  )
  return info
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isArray(arr) {
  return Array.isArray(arr)
}

export function merge<T>(target, ...arg): T {
  return arg.reduce((acc, cur) => {
    return Object.keys(cur).reduce((subAcc, key) => {
      const srcVal = cur[key]
      if (isObject(srcVal)) {
        subAcc[key] = merge(subAcc[key] ? subAcc[key] : {}, srcVal)
      } else if (isArray(srcVal)) {
        // series: []，下层数组直接赋值
        subAcc[key] = srcVal.map((item, idx) => {
          if (isObject(item)) {
            const curAccVal = subAcc[key] ? subAcc[key] : []
            return merge(curAccVal[idx] ? curAccVal[idx] : {}, item)
          } else {
            return item
          }
        })
      } else {
        subAcc[key] = srcVal
      }
      return subAcc
    }, acc)
  }, target)
}
export function getFileMd5(file: File): string {
  // SparkMD5.
  // file.arrayBuffer()
  return ''
}

export function copy(obj) {
  if (obj === undefined || obj === null) {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}

export async function sleep(ms: number) {
  await new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}
