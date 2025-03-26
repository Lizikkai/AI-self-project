import { getToken } from '@/utils/auth'
import { createRouter, createWebHistory } from 'vue-router'
import { whiteList } from './basic'

const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: () => import('@/views/dashboard/login.vue')
    },
    {
      path: '/home',
      name: 'HomePage',
      component: () => import('@/views/home/index.vue')
    },
    {
      path: '/info',
      name: 'InfoPage',
      component: () => import('@/views/info/index.vue')
    },
    {
      path: '/user',
      name: 'UserPage',
      component: () => import('@/views/info/users.vue')
    },
    {
      path: '/conversation',
      name: 'ConversationPage',
      component: () => import('@/views/conversation/index.vue')
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/dashboard/pageNotFound.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})
router.beforeEach((to, from, next) => {
    const token = getToken()
    // 检查是否在白名单中
    if (to.path === '/login') {
        if (token) {
            console.log('已登录用户访问登录页，重定向到info页')
            next({ name: 'InfoPage' })
        } else {
            console.log('未登录用户访问登录页，允许访问')
            next()
        }
        return
    }
    // 非白名单路径需要登录
    if (!token) {
        next({ name: 'LoginPage', query: { redirect: to.fullPath } })
        return
    }

    // 已登录，允许访问
    next()
})

export default router
