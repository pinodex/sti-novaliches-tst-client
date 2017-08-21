<template>
  <section class="login-view">
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container">
          <div class="row">
            <div class="column is-4 is-offset-4">
              <div class="login-panel">
                <div class="login-header">
                  <div class="logo logo-100"></div>
                </div>

                <div class="user" v-if="$store.getters.user">
                  <p>Logged in as <strong>{{ $store.getters.user.name }}</strong></p>
                </div>

                <div v-else>
                  <h2 class="subtitle has-text-centered">Talent Search Tabulation</h2>

                  <form autocomplete="off" @submit.prevent="login">
                    <div class="field">
                      <p class="control has-icons-left has-icons-right">
                        <input class="input" type="text" name="username" placeholder="Username" required
                          v-model="credentials.username" />

                        <span class="icon is-small is-left">
                          <i class="fa fa-user"></i>
                        </span>
                      </p>
                    </div>

                    <div class="field">
                      <p class="control has-icons-left has-icons-right">
                        <input class="input" type="password" name="password" placeholder="Password" required
                          v-model="credentials.password" />

                        <span class="icon is-small is-left">
                          <i class="fa fa-key"></i>
                        </span>
                      </p>
                    </div>

                    <div class="is-clearfix">
                      <div class="field is-grouped is-pulled-right action">
                        <p class="control">
                          <button type="submit" class="button" :disabled="disableLoginButton">

                            <span class="icon is-small">
                              <i class="fa fa-sign-in"></i>
                            </span>

                            <span>Login</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
  export default {
    created () {
      if (this.$store.getters.user) {
        this.$router.push('home')
      }

      this.$on('auth.logout', this.logout)
    },

    data () {
      return {
        disableLoginButton: false,

        credentials: {
          username: null,
          password: null
        }
      }
    },

    methods: {
      login () {
        const loader = this.$loading.open()
        this.disableLoginButton = true
  
        this.$http.post('auth/login', this.credentials)
          .then(response => {
            const id = this.$http.interceptors.request.use(this._authInterceptor)

            this.$store.dispatch('login', response.data.user)
            this.$store.dispatch('setInterceptor', id)

            this.disableLoginButton = false
            
            loader.close()
          })
          .catch(error => {
            const message = error.response.data.error.message || error.message

            this.credentials.password = null

            this.$dialog.alert({ message,
              title: 'Login Error',
              type: 'is-danger'
            })

            this.disableLoginButton = false
            
            loader.close()
          })
      },

      _authInterceptor (config) {
        if (this.$store.getters.user) {
          config.headers['Authorization'] = `Bearer ${this.$store.getters.user.token}`
        }

        return config
      }
    }
  }
</script>

<style lang="scss">
  .login-view {
    .login-container {
      z-index: 1;
    }

    .title, .subtitle {
      margin-bottom: 1rem;
    }

    .login-panel {
      background: #fff;
      padding: 1.5rem 0;
      padding-top: 0;
      border-radius: 0.25rem;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
      overflow: hidden;

      .login-header {
        background: #fff400;
        margin-bottom: 1rem;
        padding-top: 5px;
        height: 110px;
      }

      .logo {
        margin: 0 auto;
        margin-bottom: 1rem;
      }

      .input {
        border-left: none;
        border-right: none;
        border-radius: 0;
        box-shadow: none;
      }

      .action {
        margin-right: 1rem;
      }

      .notification {
        border-radius: 0;
      }
    }
  }

  .logo {
    background: #fff300;

    &.logo-100 {
      background: url('../../../static/img/logo-100.png') no-repeat center;
      height: 100px;
      width: 129px;
    }
  }

  .user {
    margin: 0 1.5rem;
  }
</style>
