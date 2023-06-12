<template>
  <use-draggable class="absolute" :handle="handle">
    <div class="func-select flex-1" v-if="selectedFunc"
         :key="'select_'+selectedFunc.key">
      <div ref="handle" class="text-center my-1 flex justify-center items-center" style="color: #c3c3c3">
        <div class="text-center flex-1 select-none cursor-pointer">{{ selectedFunc.name }}</div>
        <close-outline class="w-4 ml-auto cursor-pointer" @click="$emit('close')"></close-outline>
      </div>
      <div v-for="(param,i) in selectedFunc.params">
        <image-func-param :func-key="selectedFunc.key"
                          v-model="selectedFunc.params[i]">
        </image-func-param>
      </div>
      <n-button class="my-2" size="small" type="info" @click="save" secondary>
        确定
      </n-button>
    </div>
  </use-draggable>
</template>

<script lang="ts">
import type {PropType} from "vue";
import {defineComponent, ref} from "vue";
import type {FuncApi, FuncApiParam} from "@/common/types/apiCommonTypes";
import {UseDraggable} from "@vueuse/components";
import {CloseOutline} from '@vicons/ionicons5'
import ImageFuncParam from "./ImageFuncParam.vue";

export default defineComponent({
  name: "ApiFuncParamSetCard",
  components: {ImageFuncParam, UseDraggable,CloseOutline},
  emits:["paramsSave","close"],
  props: {
    selectedFunc: {
      type: Object as PropType<FuncApi>,
      default: null
    }
  },
  methods: {
    save() {
      const paramsCopy = JSON.parse(JSON.stringify(this.selectedFunc.params))
      this.$emit('paramsSave', paramsCopy)
    }
  },
  setup(props) {
    // const emit = defineEmits<{
    //   (e: 'close', value: null): void
    //   (e: 'paramsSave', value: FuncApiParam[]): void
    // }>()
    const handle = ref<HTMLElement | null>(null)
    return {handle}
  },
})
</script>

<style scoped>
.func-select {
  color: #9d9d9d;
  background: #2b2b30;
  border: 2px solid rgb(90 90 90 / 49%);
  border-radius: 1rem;
  min-width: 11rem;
  @apply px-4 mx-2 my-4
}
</style>