<template>
  <div class="flex flex-row overflow-hidden" style="height: 100vh">
    <div class="img-pro__main w-full">
      <div class="img-pro__card flex flex-col">
        <div class="img-pro__owner flex flex-1">
          <div class="img-pro__owner-list flex flex-col">
            <div class="flex-1">
              <div @click="() => { selectedOwner = item }"
                   :class="['img-pro__owner-item', selectedOwner && selectedOwner.key == item.key ? 'active' : '']"
                   v-for="item in imgFuncConfig">
                <div>{{ item.name }}</div>
              </div>
            </div>
            <div class="text-center my-1">
              <div>
                <n-button size="small" class="my-1" type="info" secondary @click="fileSelect">
                  文件
                </n-button>
                <input type="file" id="img-file" @change="selectFile" accept="image/png,image/jpg,image/jpeg,image/gif"
                       style="display: none"/>
              </div>
              <div>
                <n-button size="small" class="my-1" type="info" secondary @mousedown="orgImgShow = true"
                          @mouseup="orgImgShow = false">
                  原图
                </n-button>
              </div>

              <div>
                <n-button size="small" class="my-1" type="info" secondary @click="savePic">保存</n-button>
              </div>
              <div>
                <n-button size="small" class="my-1" type="info" secondary @click="undo">撤销</n-button>
              </div>
            </div>
            <div class="text-center m-2 cursor-pointer" @click="()=>{selectedOwner = null;selectedFunc=null;}">收起
            </div>
          </div>
          <div class="img-pro__owner-select" v-if="selectedOwner">
            <div class="overflow-y-auto flex-1">
              <div :class="['img-pro__func-item', selectedFunc && selectedFunc.key == item.key ? 'active' : '']"
                   @click="($event) => selectFunc($event, item)" v-for="item in selectedOwner.funcList">
                {{ item.name }}
              </div>
            </div>
            <use-draggable class="absolute" :handle="handle">
              <div class="img-pro__func-select flex-1" v-if="selectedFunc" :key="'select_' + selectedFunc.key">
                <div ref="handle" class="text-center my-1 flex justify-center items-center" style="color: #c3c3c3">
                  <div class="text-center flex-1 select-none cursor-pointer">{{ selectedFunc.name }}</div>
                  <close-outline class="w-4 ml-auto cursor-pointer" @click="selectedFunc = null"></close-outline>
                </div>
                <div v-for="(param, i) in selectedFunc.params">
                  <image-func-param :func-key="selectedFunc.key" @change="() => doFunc(selectedFunc, false)"
                                    v-model="selectedFunc.params[i]"></image-func-param>
                </div>
                <n-button class="my-2" size="small" type="info" @click="() => doFunc(selectedFunc)" secondary>
                  应用
                </n-button>
                <n-button class="mx-2 my-2" size="small" type="info" @click="() => doFunc(selectedFunc, false)"
                          secondary>
                  预览
                </n-button>
              </div>
            </use-draggable>
          </div>
          <div class="img-pro__flow">
            <div class="img-pro__flow-item" v-for="flow in flowList">
              <div class="img-pro__flow-item__name mx-2">
                {{ flow.funcApi.name }}
              </div>
              <!--              <close-outline class="img-pro__flow-item__close"/>-->
            </div>
          </div>
        </div>
      </div>
      <div class="img-pro__workbench  flex justify-center items-center text-center">
        <div style="width: 100%" v-show="orgImgShow" class="flex justify-center items-center">
          <img class="org-img" :src="orgImg" alt="">
        </div>
        <canvas id="img-pro-img" :key="imgKey" :style="{ display: orgImgShow ? 'none' : 'block' }"
                @mousemove="(e)=>imageProcess&&pointSelect(e)">
        </canvas>
        <div class="img-cut" v-if="imgCutBox.show"
             :style="{ width: imgCutBox.width, height: imgCutBox.height, left: imgCutBox.left, top: imgCutBox.top }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {useMessage} from "naive-ui";
import {CloseOutline} from '@vicons/ionicons5'
import {ImageProcessGpu} from "./ImageProcessGpuFunctional";
import type {FuncProcessGpuRecord} from "./ImageProcessGpuFunctional";
import LineDraw from "./components/LineDraw.vue";

import {UseDraggable} from "@vueuse/components";
import ImageFuncParam from "./components/ImageFuncParam.vue";
import {useImageAnalysisData} from "@/stores/useImageAnalysisData";
import {storeToRefs} from "pinia";
import {useImagePoint} from "@/stores/useImagePoint";
import type {FuncApi} from "@/common/types/apiCommonTypes";
import {imageFuncApiList, imageOwnerNameDic} from "@/common/funcApis/imageFuncApiList";
import {funcApiParamDefaultValue} from "@/common/types/apiCommonTypes";

export default defineComponent({
  name: "ImageProcess",
  components: {ImageFuncParam, LineDraw, CloseOutline, UseDraggable},
  data() {
    return {
      orgImgShow: false,
      fileSelectShow: false,
      imageProcess: null as unknown as ImageProcessGpu,
      selectedOwner: null as unknown as { name: string, key: string, funcList: FuncApi[] },
      imgFuncConfig: [] as { name: string, key: string, funcList: FuncApi[] }[],
      imgProcedureConfig: [] as { name: string, key: string, params_dic: object }[],
      selectedFunc: null as unknown as FuncApi,
      selectedFuncParamsDic: {},
      imgSrc: "",
      imgKey: Date.now(),
      orgImg: "",
      flowList: [] as FuncProcessGpuRecord[],
      imgCutBox: {show: false, height: "0px", width: "0px", left: "0px", top: "0px"}
    }
  },
  methods: {
    fileSelect() {
      document.getElementById('img-file')?.click()
    },
    selectFile($event) {
      const input = $event.target;
      const reader = new FileReader();
      reader.readAsDataURL(input.files[0]);
      reader.onloadend = () => {
        const dataURL = reader.result as string;
        this.orgImg = dataURL
        this.init(dataURL)
        this.fileSelectShow = false
      }
    },
    pointSelect(e: MouseEvent) {
      const x = e.offsetX / (e.target as HTMLCanvasElement).offsetWidth
      const y = e.offsetY / (e.target as HTMLCanvasElement).offsetHeight
      const pointData = this.imageProcess.getPointData(x, y)
      pointData && this.setImagePoint(pointData)
    },
    savePic() {
      let canvas = document.querySelector("#img-pro-img") as HTMLCanvasElement;
      let strDataURI = canvas.toDataURL("image/jpeg");
      let image = strDataURI.replace("image/jpeg", "image/octet-stream");
    },
    async doFunc(funcApi: FuncApi, apply = true) {
      await this.imageProcess.doFunc(funcApi, apply)
      this.flowList = this.imageProcess.undoList
      this.setImageAnalysisData(this.imageProcess.analysisData)
    },
    selectFunc(e: MouseEvent, item: FuncApi) {
      this.selectedFunc = item
      this.selectedFuncParamsDic = {}
      this.$nextTick(() => {
        this.handle = this.$refs.handle as any
      })
    },
    getImgUrl(name: string) {
      return new URL(`../../../../assets/pic/${name}`, import.meta.url).href
    },
    initFuncConfigParams(funcConfig: FuncApi[]): any {
      const funcOwnerDic = {}
      const imageFuncApiListCopy: FuncApi[] = JSON.parse(JSON.stringify(funcConfig))
      imageFuncApiListCopy.forEach(func => {
        if (funcOwnerDic[func.owner] == undefined) {
          funcOwnerDic[func.owner] = []
        }
        func.params?.forEach(param => {
          if (param.config.default === undefined) {
            if (funcApiParamDefaultValue[param.config.type] !== undefined) {
              param.config.default = JSON.parse(JSON.stringify(funcApiParamDefaultValue[param.config.type]))
            } else {
              param.config.default = null
            }
          }
          if (param.config.value === undefined) {
            if (param.config.default !== undefined) {
              param.config.value = JSON.parse(JSON.stringify(param.config.default))
            } else {
              param.config.value = null
            }
          }
        })
        funcOwnerDic[func.owner].push(func)
      })
      const imgFuncConfig = Object.keys(funcOwnerDic).map(key => {
        return {
          funcList: funcOwnerDic[key],
          key: key,
          name: imageOwnerNameDic[key]
        }
      })
      return imgFuncConfig
    },
    getConfig() {
      this.imgFuncConfig = this.initFuncConfigParams(imageFuncApiList)
    },
    redo() {
      this.imageProcess.redo()
      this.setImageAnalysisData(this.imageProcess.analysisData)
    },
    undo() {
      this.imageProcess.undo()
      this.setImageAnalysisData(this.imageProcess.analysisData)
    },
    init(imgSrc: string) {
      this.imgKey = Date.now()
      this.$nextTick(() => {
        this.imageProcess = new ImageProcessGpu(imgSrc, 'img-pro-img')
        this.imageProcess.initImageCanvas(imgSrc).then(res => {
          this.setImageAnalysisData(this.imageProcess.analysisData)
        })
      })

    },
  },
  mounted() {
    this.getConfig()
  },
  setup(props) {
    const handle = ref<HTMLElement | null>(null)
    const message = useMessage()
    const imageAnalysisDataStore = useImageAnalysisData()
    // const {imageAnalysisData} =storeToRefs(imageAnalysisDataStore)
    const {setImageAnalysisData} = imageAnalysisDataStore

    const imagePointStore = useImagePoint()
    const {setImagePoint} = imagePointStore
    // const apiName = ref('图片处理')
    // useApiChildRoute(apiName.value)
    return {message, handle, setImageAnalysisData, setImagePoint}
  },

})
</script>

<style scoped>
.img-pro__main {
  @apply flex flex-row
}

.img-pro__owner {
  /*background: #252528;*/
  background: rgba(0, 0, 0, 0);
  border-right: 1px solid #494952;
  @apply flex
}

/*#1a1a1e*/
.img-pro__workbench {
  background: #1e1f21;
  /*padding: 0.5rem;*/
  @apply flex-1 w-full
}

.img-pro__img {
  @apply h-full w-full
}

.img-pro__owner-list {
  /*margin: 0.5rem;*/
  /*border: 2px solid #a1bdd442;*/
  color: rgb(231 231 231 / 88%);
  /*border-radius: 0.5rem;*/
  background: #252528;
  overflow: hidden;
}

.img-pro__owner-select {
  background: #2f2f35;
  @apply h-full flex flex-col
}

.img-pro__owner-item {
  text-indent: 1.5rem;
  padding-right: 1.5rem;
  /*border-bottom: 1px solid #929292;*/
  background: #252528;
  cursor: pointer;
  @apply py-1.5
}

.img-pro__owner-item:hover {
  color: #d9e2ff;
}

.img-pro__owner-item.active {
  /*background: linear-gradient(91deg, #3f3f48, #2f2f35);*/
  color: #7fb3ff;
}

.img-pro__owner {
  @apply overflow-y-auto
}

.img-pro__func-item {
  text-indent: 1.5rem;
  padding-right: 1.5rem;
  color: #ffffffa3;
  /*border-bottom: 1px solid #929292;*/
  cursor: pointer;
  min-width: 9rem;
  @apply py-1.5
  /*border: 2px solid #878786;*/
  /*display: flex;*/
  /*height: 5rem;*/
  /*width: 5rem;*/
  /*align-items: center;*/
  /*cursor: pointer;*/
  /*border-radius: 0.5rem;*/
  /*justify-content: center;*/
  /*@apply my-4 w-20 h-20 flex justify-center items-center*/
}

.img-pro__func-card {
  background: #3b3b42;
}

.img-pro__func-item:hover {
  color: #72a0e3;
  background: #53535d;
}

.img-pro__func-item.active {
  color: #93befdba;
  background: #41414a;
}

.img-pro__func-select {
  color: #9d9d9d;
  background: #2b2b30;
  border: 2px solid rgb(90 90 90 / 49%);
  border-radius: 1rem;
  min-width: 11rem;
  @apply px-4 mx-2 my-4
}

.img-pro__flow {
  background: #2b2b30;
}

.img-pro__flow-item {
  margin: 0.4rem 0rem 0.4rem 0.4rem;
  @apply flex flex-row items-center
}

.img-pro__flow-item__name {
  padding: 0.1rem 1.5rem;
  text-align: center;
  color: #c3c3c3a3;
  cursor: pointer;
  border: 1px solid #a9a9a991;
  border-radius: 0.25rem;
  display: inline-block;
}

.img-pro__flow-item__name:hover {
  color: rgba(255, 255, 255, 0.73);
  background: rgba(72, 72, 72, 0.35);
}

.img-pro__flow-item__close {
  display: inline-block;
  width: 1.5rem;
  @apply mx-1 ml-auto cursor-pointer
}

.img-pro__flow-item__close:hover {
  color: white;
}

.img-cut {
  position: absolute;
  border: 1px dashed white;
}

#img-pro-img {
  max-width: 100%;
  max-height: 100%;
  border: 2px solid #3b3b3b9c;
}

.org-img {
  max-height: 100%;
  max-width: 100%;
  border: 2px solid #3b3b3b9c;
}
</style>

<style>
.process-img-canvas {
  max-height: 100%;
  max-width: 100%;
}
</style>