'use strict'

/*!
 * STI College Novaliches
 * Talent Search Tabulation System
 *
 * Copyright 2017, Raphael Marco <raphaelmarco@outlook.com>
 */

import Vue from 'vue'
import Buefy from 'buefy'
import axios from 'axios'
import ws from 'adonis-websocket-client'

import App from './App'
import router from './router'
import store from './store'

import 'buefy/lib/buefy.css'
import 'bulma/css/bulma.css'
import 'font-awesome/css/font-awesome.css'

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}

Vue.use(Buefy)

window.config = require('../../config.json')

Vue.config.productionTip = false

Vue.http = Vue.prototype.$http = axios.create({
  baseURL: `${window.config.server}/api`
})

Vue.io = Vue.prototype.$io = ws(window.config.server)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')