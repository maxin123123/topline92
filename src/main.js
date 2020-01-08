import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入组件库模块
import ElementUI from 'element-ui'

// 导入全局样式文件
import '@/assets/css/global.css'

// 导入axios模块
import axios from 'axios'
// 配置公共跟地址(线上地址)
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/'
// 配置为Vue的(原型)继承成员
Vue.prototype.$http = axios

// 注册
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
