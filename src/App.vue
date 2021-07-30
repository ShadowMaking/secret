<template>
  <div id="app" class="theme-light">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> -->
      <v-header></v-header>
    </div>
    <router-view :key="$route.path" />
  </div>
</template>

<script>
  import header from '@/components/Header/index';
  export default {
    name: 'APP',
    data() {
      return {
        
      };
    },
    components: {
      'v-header': header,
    },
    created () {
      //在页面加载时读取sessionStorage里的状态信息
      if (sessionStorage.getItem("store") ) {
        this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(sessionStorage.getItem("store"))))
      }

      //在页面刷新时将vuex里的信息保存到sessionStorage里
      window.addEventListener("beforeunload",()=>{
        sessionStorage.setItem("store",JSON.stringify(this.$store.state))
      })

      //ios废弃了beforeunload，使用pagehide代替
      window.addEventListener("pagehide",()=>{
        sessionStorage.setItem("store",JSON.stringify(this.$store.state))
      })
    }
  }
</script>

<style lang="scss">
@import "app";
</style>
