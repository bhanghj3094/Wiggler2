import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '../components/HomePage'
import ShowGame from '../components/ShowGame'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'homePage',
      component: HomePage
    },
    {
      path: '/api/showGame',
      name: 'showGame',
      component: ShowGame
    }
  ]
})
