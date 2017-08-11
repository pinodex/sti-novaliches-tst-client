<template>
  <div id="app">
    <div class="backdrop-overlay"></div>

    <transition name="fade">
      <router-view v-if="ws_state == 'connected'"></router-view>
    </transition>

    <section class="hero is-fullheight" v-if="ws_state != 'connected'">
      <div class="hero-body has-text-centered">
        <div class="container">
          <div class="columns">
            <div class="column is-4 is-offset-4">
              <div class="box">

                <div v-if="ws_state == 'connecting'">
                  <i class="fa fa-circle-o-notch fa-spin fa-3x"></i>
                  
                  <p>Connecting</p>
                </div>

                <div v-if="ws_state == 'disconnected'">
                  <i class="fa fa-exclamation-triangle fa-3x"></i>
                  
                  <p>Disconnected</p>
                </div>

                <div v-if="ws_state == 'locked'">
                  <i class="fa fa-lock fa-3x"></i>
                  
                  <p>Locked</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  export default {
    created () {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type == 'LOGIN') {
          this.$router.push('home')
        }

        if (mutation.type == 'LOGOUT') {
          this.$router.push('login')
        }
      })

      this.ws_state = 'connecting'

      const client = this.$io.channel('root')

      client.connect((error, connected) => {
        if (connected) {
          this.ws_state = 'connected'

          return
        }

        this.ws_state = 'disconnected'
      })
    },

    data () {
      return {
        ws_state: 'locked'
      }
    }
  }
</script>

<style>
  html, body {
    overflow-y: hidden;
  }

  .backdrop-overlay {
    background-image: linear-gradient(to bottom, rgba(0, 109, 183, 0.75), #006db7),
                      url('/static/img/sti-novaliches-building.png');
    
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
