import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
//
const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/login') },

  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home'),
    redirect: '/welcome', // 路由重定向
    children: [
      // 欢迎页面子路由配置
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') },
      { path: '/articleadd', name: 'articleadd', component: () => import('@/views/articleadd/articleadd.vue') }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 配置全局前置路由首位
router.beforeEach((to, from, next) => {
  // 获取用户登录状态信息
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (!userinfo && to.path !== '/login') {
    // 强制登录
    return next('/login')
  }
  // 放行
  next()
})

export default router
