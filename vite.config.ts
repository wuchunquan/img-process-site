import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'


import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver,NaiveUiResolver} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    build:{
        outDir:"docs"
    },
    base:"/img-process-site",
    plugins: [vue(), vueJsx(), AutoImport('vue',
        {
            'naive-ui': [
                'useDialog',
                'useMessage',
                'useNotification',
                'useLoadingBar'
            ]
        }
        ,
        {
            resolvers: [ElementPlusResolver()],
        }
        ),
        Components({
            resolvers: [ElementPlusResolver(),NaiveUiResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
