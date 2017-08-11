<template>
  <section v-if="$store.getters.user">
    <article class="media current-user">
      <figure class="media-left">
        <p class="image is-48x48">
          <img src="/static/img/default-image.jpg" />
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
      <div class="columns">
        <div class="column is-3">
          <section class="navigator">
            <div class="hero is-light is-bold">
              <div class="hero-body">
                <div class="has-text-centered">
                  <img src="/static/img/logo-100.png" />
                  <h2 class="subtitle">Talent Search Tabulation</h2>
                </div>
              </div>
            </div>

            <aside class="menu">
              <p class="menu-label">Programs</p>

              <ul class="menu-list">
                <li><a class="is-active">Dashboard</a></li>
                <li><a>Customers</a></li>
              </ul>
            </aside>
          </section>
        </div>

        <div class="column">

        </div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    created () {
      if (!this.$store.getters.user) {
        this.$router.push('login')
      }
    },

    methods: {
      logout () {
        this.$dialog.confirm({
          message: 'Are you sure you want to logout?',
          onConfirm: () => this.$store.dispatch('logout')
        })
      }
    }
  }
</script>

<style lang="scss">
  .container.is-fluid {
    margin-left: 0;
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
</style>
