<template>
  <div v-if="param.config.type=='int'">
    <div class="m-1">
      <span class="mr-2">{{ param.name }}</span>
      <span class="m-1">{{ param.config.min }}</span>
      <span>~</span>
      <span class="m-1">{{ param.config.max }}</span>
    </div>
    <n-input-number size="small" v-model:value="param.config.value" :min="param.config.min"
                    @input="change"
                    :max="param.config.max"></n-input-number>
  </div>
  <div v-else-if="param.config.type=='float'">
    <div class="my-1">
      <span class="m-1">{{ param.name }}</span>
      <span class="m-1">{{ param.config.min }}</span>
      <span>~</span>
      <span class="m-1">{{ param.config.max }}</span>
    </div>
    <n-input-number size="small" v-model:value="param.config.value" :min="param.config.min"
                    @input="change"
                    :max="param.config.max" clearable/>
  </div>
  <div v-else-if="param.config.type=='option'">
    <n-select size="small" v-model:value="param.config.value"
              @change="change"
              :options="param.config.options"/>
  </div>
  <div v-else-if="param.config.type=='string'">
    <div class="m-1">
      {{ param.name }}
    </div>
    <n-input size="small" v-model:value="param.config.value"
             @input="change"
             clearable/>
  </div>
  <div v-else-if="param.config.type=='rgbLine'">
    <div class="m-1">
      {{ param.name }}
      <span class="mx-1 cursor-pointer"
            @click="param.config.value.select=item"
            v-for="item in ['r','g','b']"
            :style="{color: param.config.value.select==item?'#7ca6dc':'unset' }">
            {{ {r: "红", g: "绿", b: "蓝"}[item] }}
      </span>
    </div>
    <line-draw
        :config="{points:{color:'red'},defaultPointsY:param.config.default.r.pointsY,histogram:{show:true,color:'red',value:imageAnalysisData.count.r}}"
        v-model="param.config.value.r"
        @change="change"
        :mark-point="markPoint.r"
        v-show="param.config.value.select=='r'"></line-draw>
    <line-draw
        :config="{points:{color:'green'},defaultPointsY:param.config.default.r.pointsY,histogram:{show:true,color:'green',value:imageAnalysisData.count.g}}"
        v-model="param.config.value.g"
        @change="change"
        :mark-point="markPoint.g"
        v-show="param.config.value.select=='g'"></line-draw>
    <line-draw
        :config="{points:{color:'blue'},defaultPointsY:param.config.default.b.pointsY,histogram:{show:true,color:'blue',value:imageAnalysisData.count.b}}"
        v-model="param.config.value.b"
        @change="change"
        :mark-point="markPoint.b"
        v-show="param.config.value.select=='b'"></line-draw>
  </div>
  <div v-else-if="param.config.type=='hueLine'">
    <div class="m-1">
      {{ param.name }}
    </div>
    <line-draw
        :config="{showHueLine:true,hasHueMap:true,height:360,width:361,defaultPointsY:param.config.default.pointsY,xLineHeightProportion:0.5}"
        style="z-index: 5"
        :mark-point="markPoint"
        @change="change"
        v-model="param.config.value"></line-draw>
  </div>
  <div v-else-if="param.config.type=='line'">
    <div class="m-1">
      {{ param.name }}
    </div>
    <line-draw
        :config="{defaultPointsY:param.config.default.pointsY,histogram:{show:funcKey=='img_scale_line',color:'white',value:funcKey=='img_scale_line'?imageAnalysisData.count.scale:[]}}"
        style="z-index: 5"
        :mark-point="markPoint"
        @change="change"
        v-model="param.config.value"></line-draw>
  </div>
  <div v-else-if="param.config.type=='chooseFile'">
    <api-file-upload
        :allow-upload="false"
        style="height: 100%;width: 100%" @file-select="fileSelect"
        :allow-file-types="param.config.fileTypes"
        ></api-file-upload>
  </div>
  <!-- <div v-else>
    {{ param.name}}
  </div> -->
</template>

<script lang="ts">
import type {PropType} from "vue";
import LineDraw from "./LineDraw.vue";
import {defineComponent} from "vue";
import {useImageAnalysisData} from "@/stores/useImageAnalysisData";
import {storeToRefs} from "pinia";
import {useImagePoint} from "@/stores/useImagePoint";
import type {FuncApiParam} from "@/common/types/apiCommonTypes";
import {funcApiParamDefaultValue} from "@/common/types/apiCommonTypes";

export default defineComponent({
  emits: ['update:modelValue', "change"],
  name: "ImageFuncParam",
  components: { LineDraw},
  computed: {
    markPoint(): any {
      let x: any = null
      if (this.funcKey == 'saturationLine') {
        return this.imagePoint.hsl[1]
      }
      // if (this.funcKey == 'img_saturation_line2') {
      //   return this.imagePoint.hsv[1]
      // }
      if (this.funcKey == 'colorLine') {
        let [r, g, b] = this.imagePoint.rgb
        return {r, g, b}
      }
      if (this.funcKey == 'lightnessLine') {
        return this.imagePoint.hsv[2]
      }
      if (this.funcKey == 'brightnessLine') {
        return this.imagePoint.hsl[2]
      }
      if (this.param.config.type == 'hueLine') {
        return this.imagePoint.hsl[0]
      }
    }
  },
  props: {
    funcKey: {
      type: String,
      default: ""
    },
    modelValue: {
      required: true,
      type: Object as PropType<FuncApiParam>
    }
  },
  data() {
    return {
      defaultValue: null as any,
      param: {config: {}} as FuncApiParam
    }
  },
  setup(props) {
    const imagePointStore = useImagePoint()
    const {imagePoint} = storeToRefs(imagePointStore)
    const imageAnalysisDataStore = useImageAnalysisData()
    const {imageAnalysisData} = storeToRefs(imageAnalysisDataStore)
    return {imageAnalysisData, imagePoint}
  },
  methods: {
    change() {
      this.$emit('update:modelValue', this.param)
      this.$emit('change')
    },
    fileSelect(file:UserFile){
      this.param.config.value={md:file.md,url:file.file_url,fileType:file.mime_type};this.change()
    }
  },
  mounted() {
    this.param = JSON.parse(JSON.stringify(this.modelValue))
    if (this.param.config.default === undefined) {
      if(funcApiParamDefaultValue[this.param.config.type]!==undefined){
        this.param.config.default = JSON.parse(JSON.stringify(funcApiParamDefaultValue[this.param.config.type]))
      }
    }
    if (this.param.config.value === undefined) {
      if(funcApiParamDefaultValue[this.param.config.type]!==undefined){
        this.param.config.value = JSON.parse(JSON.stringify(funcApiParamDefaultValue[this.param.config.type]))
      }
    }
  }
})
</script>

<style scoped>

</style>