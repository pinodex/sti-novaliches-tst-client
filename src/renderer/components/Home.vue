<template>
  <section v-if="$store.getters.user">
    <article class="media current-user">
      <figure class="media-left">
        <p class="image is-48x48">
          <img :src="avatar" />
        </p>
      </figure>

      <div class="media-content">
        <div class="content">
          <p><small>Logged in as</small></p>
          <p><strong>{{ $store.getters.user.name }}</strong></p>
        </div>
      </div>

      <div class="media-right">
        <button class="button is-danger is-inverted" title="Logout" @click="logout()">
          <span class="icon">
            <i class="fa fa-sign-out"></i>
          </span>
        </button>
      </div>
    </article>

    <div class="container is-fluid">
      <div class="columns is-gapless">
        <div class="column is-2">
          <section class="navigator">
            <div class="hero is-info is-bold">
              <div class="hero-body">
                <div class="has-text-centered">
                  <img src="../../../static/img/logo-100.png" />
                  <h2 class="subtitle">Talent Search Tabulation</h2>
                </div>
              </div>
            </div>

            <aside class="menu" v-if="categories.length > 0">
              <p class="menu-label">Programs</p>

              <ul class="menu-list">
                <li v-for="category in categories">
                  <a :class="{ 'is-active': category.is_active }">{{ category.name }}</a>
                </li>
              </ul>
            </aside>
          </section>
        </div>

        <div class="column is-10" :class="{ 'is-white': active_category }">
          <section v-if="active_category">
            
            <section class="hero is-primary is-bold is-header">
              <div class="hero-body">
                <div class="container">
                  <h1 class="title">
                    {{ active_category.name }}

                    <i v-show="is_emitting" class="fa fa-circle-o-notch fa-spin"></i>
                  </h1>
                </div>
              </div>
            </section>

            <div class="container is-fluid table-container">
              <table class="table is-bordered is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Contestant</th>
                    <th v-for="criteria in active_category.criterias">
                      {{ criteria.name }}

                      <span v-if="active_category.is_weighted">({{ criteria.percentage }}%)</span>

                      <button class="button is-small is-light is-pulled-right" title="More information"
                        @click="showCriteriaDescription(criteria)">

                        <span class="icon is-small">
                          <i class="fa fa-question-circle"></i>
                        </span>
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="candidate in candidates" v-if="candidate.categories.indexOf(active_category.id) > -1">
                    <td>
                      <h2 class="subtitle">{{ candidate.number }}</h2>
                    </td>
                    <td>
                      <div class="media candidate" @click="showCandidatePicture(candidate)" title="View Picture">
                        <div class="media-left">
                          <figure class="image is-48x48">
                            <img :src="candidate.thumb" alt="Candidate Photo" />
                          </figure>
                        </div>

                        <div class="media-content">
                          <h1 class="title is-5">{{ candidate.name }}</h1>
                        </div>
                      </div>
                    </td>

                    <td class="is-fit" v-for="criteria in active_category.criterias">
                      <input class="input is-short" type="number" max="100"
                        v-model.number="scores[candidate.id + ':' + active_category.id + ':' + criteria.id]"
                        @change="sendScore(candidate.id + ':' + active_category.id + ':' + criteria.id)"
                        :min="criteria.minimum_value"
                        :disabled="!criteria.is_enabled || status[candidate.id + ':' + active_category.id + ':' + criteria.id] == 'disabled'"
                        :class="{
                          'is-success': criteria.is_enabled && status[candidate.id + ':' + active_category.id + ':' + criteria.id] == 'success',
                          'is-danger': criteria.is_enabled && status[candidate.id + ':' + active_category.id + ':' + criteria.id] == 'error'
                        }" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-else>
            <section class="hero is-fullheight">
              <div class="hero-body has-text-centered">
                <div class="container">
                  <div class="columns">
                    <div class="column is-4 is-offset-4">
                      <div class="box">
                        <i class="fa fa-ban fa-3x"></i>

                        <p>No active program</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import avatar from '../../../static/img/default-image.jpg'

  export default {
    client: null,

    beforeCreate () {
      if (!this.$store.getters.user) {
        this.$router.push('login')
      }

      this.client = this.$io.channel('data')
    },

    created () {
      this.client.connect()

      let userId = null

      if (this.$store.getters.user) {
        userId = this.$store.getters.user.id
      }

      this.client.on('categories', data => {
        this.categories = data.filter(category => {
          return category.judges.findIndex(id => id == userId) > -1
        })
      })

      this.client.on('candidates', data => {
        this.candidates = data.map(candidate => {
          if (candidate.picture) {
            candidate.picture = URL.createObjectURL(new Blob([candidate.picture]))
          }

          if (candidate.thumb) {
            candidate.thumb = URL.createObjectURL(new Blob([candidate.thumb]))
          }

          return candidate
        })

        this.client.emit('request', 'categories')
      })
    },

    mounted () {
      this.client.emit('request', 'candidates')

      this.$http.get('score')
        .then(response => {
          for (let id in response.data.scores) {
            this.scores[id] = response.data.scores[id]
            this.status[id] = 'success'
          }
        })
        .catch(error => {})
    },

    destroyed () {
      this.client.off('categories')
      this.client.off('candidates')
    },

    data () {
      return {
        is_emitting: false,

        categories: [],
        candidates: [],

        scores: {},

        status: {},

        avatar
      }
    },

    computed: {
      active_category: function () {
        return this.categories.find(category => category.is_active)
      }
    },

    methods: {
      showCriteriaDescription (criteria) {
        this.$modal.open({
          content: `
            <div class="box">
              <div class="content">
                <h1 class="title is-4">${criteria.name} (${criteria.percentage}%)</h1>

                <p>${criteria.description}</p>
              </div>
            </div>
          `
        })
      },

      showCandidatePicture (candidate) {
        this.$modal.open(
          `<p class="image is-square">
            <img src="${candidate.picture}" />
          </p>`
        )
      },

      sendScore (id) {
        const value = this.scores[id]

        this.status[id] = 'disabled'

        this.$http.post('score', { id, value })
          .then(response => {
            this.status[id] = 'success'

            this.$forceUpdate()
          })
          .catch(error => {
            const message = error.response.data.error.message || error.message

            this.$dialog.alert({ message,
              title: 'Scoring Error',
              type: 'is-danger'
            })

            this.scores[id] = null
            this.status[id] = 'error'

            this.$forceUpdate()
          })
      },

      logout () {
        this.$dialog.confirm({
          message: 'Are you sure you want to logout?',
          onConfirm: () => {
            const loader = this.$loading.open()

            this.$http
              .post('auth/logout', {
                username: this.$store.getters.user.username,
                token: this.$store.getters.user.token
              })
              .then(response => {
                this.$store.dispatch('logout')

                loader.close()
              })
              .catch(error => {
                loader.close()

                const message = error.response.data.error.message || error.message

                this.$dialog.alert({ message,
                  title: 'Login Error',
                  type: 'is-danger'
                })
              })
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .container.is-fluid {
    margin: 0;
  }

  .column.is-white {
    background: #fff;
  }

  .sidebar {
    transition: all 500ms ease;
    overflow: hidden;

    &.hidden {
      width: 0 !important;
    }
  }

  .current-user {
    align-items: center;

    position: fixed;
    top: 0;
    right: 2rem;

    background: #fff;
    padding-right: 1rem;

    z-index: 9;

    .content {
      line-height: 1;

      p {
        small {
          font-size: 0.7rem;
        }

        margin: 0;
      }
    }
  }

  .navigator {
    background: #222;
    height: 100vh;

    .menu {
      margin: 1rem;
      margin-right: 0;

      .menu-label {
        font-size: 1rem;
      }

      .menu-list {
        a {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;

          font-size: 1.2rem;

          &:hover {
            background: inherit;
            color: inherit;
          }

          &.is-active,
          &.is-active:hover {
            background: hsl(217, 71%, 53%);
            color: #fff;
          }
        }
      }
    }
  }

  .hero {
    &.is-header {
      .hero-body {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        
        &.has-tabs {
          padding-bottom: 0;
        }

        .title {
          margin-left: 1rem;
        }
      }
    }
  }

  .tabs {
    li {
      a {
        cursor: default;
      }

      &:not(.is-active):hover {
        a {
          background: transparent !important;
          opacity: 0.9 !important;
        }
      }

      &.is-active:hover {
        a {
          opacity: 1 !important;
        }
      }
    }
  }

  .table-container {
    overflow-y: scroll;
    height: calc(100vh - 84px);
  }

  table, .table {
    tbody {
      td {
        vertical-align: middle;
        text-align: center;
      }
    }
  }

  .input.is-short {
    width: 100px;
  }

  .media {
    align-items: center;

    &.candidate {
      cursor: pointer;
    }
  }
</style>
