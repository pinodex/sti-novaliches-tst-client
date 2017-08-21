<template>
  <div id="app">
    <div class="backdrop-overlay"></div>

    <transition name="fade">
      <router-view v-if="state.open"></router-view>
    </transition>

    <section class="hero is-fullheight" v-if="!state.open">
      <div class="hero-body has-text-centered">
        <div class="container">
          <div class="columns">
            <div class="column is-4 is-offset-4">
              <div class="box">                
                <i class="fa fa-3x" :class="state.icon"></i>
                <p>{{ state.text }}</p>

                <p v-if="message">{{ message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  const states = {
    HANDSHAKING: {
      icon: 'fa-circle-o-notch fa-spin',
      text: 'Initializing connection',
      open: false
    },

    HANDSHAKE_FAILED: {
      icon: 'fa-exclamation-triangle',
      text: 'Handshake failed',
      open: false
    },

    WS_CONNECTING: {
      icon: 'fa-circle-o-notch fa-spin',
      text: 'Connecting',
      open: false
    },

    WS_RECONNECTING: {
      icon: 'fa-circle-o-notch fa-spin',
      text: 'Reconnecting',
      open: false
    },

    WS_DISCONNECTED: {
      icon: 'fa-exclamation-triangle',
      text: 'Disconnected',
      open: false
    },

    CONNECTED: {
      icon: 'fa-check',
      text: 'Connected',
      open: true
    },

    LOCKED: {
      icon: 'fa-lock',
      text: 'Locked',
      open: false
    }
  }

  let clientToken = null

  export default {
    client: null,

    beforeCreate () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type == 'LOGIN') {
          this.$router.push('home')
        }

        if (mutation.type == 'LOGOUT') {
          this.$router.push('auth')
        }
      })

      this.client = this.$io.channel('root')
    },

    created () {
      this.state = states.HANDSHAKING

      this.$http.post('handshake', {})
        .then(response => {
          this.$http.interceptors.request.use(config => {
            config.headers['X-Client-Token'] = response.data.token

            return config
          })

          this.$store.dispatch('setClientToken', response.data.token)

          this.openSocket()
        })
        .catch(error => {
          this.state = states.HANDSHAKE_FAILED
          this.message = error.response.data.error.message || error.message    
        })
    },

    destroyed () {
      this.client.off('connect')
      this.client.off('disconnect')
      this.client.off('reconnecting')
      this.client.off('connect_error')
      this.client.off('connect_timeout')
      this.client.off('reconnect_error')
      this.client.off('reconnect_failed')
    },

    methods: {
      openSocket () {
        this.state = states.WS_CONNECTING

        this.client
          .withApiKey(this.$store.getters.clientToken)
          .connect()

        this.client.on('connect', () => {
          this.state = states.CONNECTED

          this.$router.push('auth')
        })

        this.client.on('disconnect', () => this.state = states.WS_DISCONNECTED)
        this.client.on('reconnecting', () => this.state = states.WS_RECONNECTING)

        this.client.on('connect_error', this.showConnectionError)
        this.client.on('connect_timeout', this.showConnectionError)
        this.client.on('reconnect_error', this.showConnectionError)
        this.client.on('reconnect_failed', this.showConnectionError)
      },

      showConnectionError (error) {
        this.state = states.WS_DISCONNECTED

        if (error) {
          this.message = error.toString()
        }
      },

      _clientTokenInterceptor (config) {

      }
    },

    data () {
      return {
        state: states.LOCKED,
        message: null
      }
    }
  }
</script>

<style>
  html, body {
    overflow-x: hidden !important;
    overflow-y: hidden !important;

    width: 100%;
  }

  #app {
    -webkit-user-select: none;
    -webkit-app-region: drag;
    -webkit-user-drag: none;

    position: absolute;
    width: 100%;

    cursor: default;
  }

  img {
    -webkit-user-drag: none;
  }

  .modal {
    -webkit-user-select: none;
    -webkit-app-region: drag;
    -webkit-user-drag: none;

    cursor: default;
  }

  .backdrop-overlay {
    background-image: linear-gradient(to bottom, rgba(0, 109, 183, 0.75), #006db7),
                      url('../../static/img/sti-novaliches-building.png');
    
    background-repeat: repeat-x, no-repeat;
    background-size: cover, cover;
    
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 300ms
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0
  }
</style>
