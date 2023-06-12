import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ImageProcessVue from '../ImageProcess/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'imageProcess',
            component: ImageProcessVue
        }
    ]
})

export default router
