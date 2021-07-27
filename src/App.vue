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
  }
</script>

<style lang="scss">
@import "app";
</style>
