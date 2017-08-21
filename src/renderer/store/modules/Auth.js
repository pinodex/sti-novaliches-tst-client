const LOGIN = 'LOGIN',
      LOGOUT = 'LOGOUT',
      SET_INTERCEPTOR = 'SET_INTERCEPTOR',
      SET_CLIENT_TOKEN = 'SET_CLIENT_TOKEN'

const state = {
  user: null,
  interceptorId: null,
  clientToken: null
}

const mutations = {
  [LOGIN] (state, user) {
    state.user = user
  },

  [LOGOUT] (state) {
    state.user = null
  },

  [SET_INTERCEPTOR] (state, id) {
    state.interceptorId = id
  },

  [SET_CLIENT_TOKEN] (state, token) {
    state.clientToken = token
  }
}

const actions = {
  login({ commit }, user) {
    commit(LOGIN, user)
  },

  logout({ commit }) {
    commit(LOGOUT)
  },

  setInterceptor({ commit }, id) {
    commit(SET_INTERCEPTOR, id)
  },

  setClientToken({ commit }, token) {
    commit(SET_CLIENT_TOKEN, token)
  }
}

const getters = {
  user: state => {
    return state.user
  },

  interceptorId: state => {
    return state.interceptorId
  },

  clientToken: state => {
    return state.clientToken
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
