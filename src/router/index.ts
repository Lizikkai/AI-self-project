import { getToken } from '@/utils/auth';
import { createRouter,createWebHistory } from 'vue-router'
import { whiteList } from './basic'

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            redirect:'/info'
        },
        {
            path:'/login',
            name: "LoginPage",
            component:()=>import('@/views/dashboard/login.vue')
        },
        {
            path:"/home",
            name: "HomePage",
            component: () => import('@/views/home/index.vue')
        },
        {
            path: "/info",
            name: "InfoPage",
            component: () => import('@/views/info/index.vue')
        },
        {
            path: "/user",
            name: "UserPage",
            component: () => import('@/views/info/users.vue')
        }
    ]
})
router.beforeEach((to,from,next) => {
    const token = getToken();
    if(whiteList.includes(to.path)) {
        console.log("21313",whiteList.includes(to.path),token)
        if(token && to.path === '/login') {
            next({ name: 'InfoPage' })
        }else {
            next()
        }
        return
    }
    if(!token) {
        next({ name: 'LoginPage', query: { redirect: to.fullPath } })
        return
    }
    next()
})

export default router;