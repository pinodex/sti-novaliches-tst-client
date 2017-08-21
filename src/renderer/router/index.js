import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/components/Index')
    },

    {
      path: '/auth',
      name: 'auth',
      component: require('@/components/Auth')
    },
    
    {
      path: '/home',
      name: 'home',
      component: require('@/components/Home')
    },

    {
      path: '*',
      redirect: '/'
    }
  ]
})
