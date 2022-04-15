<template>
  <div id="app" class="theme-light">
    <div :class="['page-box', isMargin && 'page-oversize']">
      <div class="page-box-con">
        <div class="header-box">
          <v-leftmenu @oversize="oversize"></v-leftmenu>
          <!-- <v-Header></v-Header> -->
        </div>
        <div class="right-content-box">
          <router-view :key="$route.path" />
          <v-socketModal></v-socketModal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import leftmenu from '@/components/LeftMenu/index';
  // import Header from '@/components/Header/index';
  import socketModal from '@/components/socketModal/index';
  
 
  export default {
    name: 'APP',
    data() {
      return {
        isMargin: true,
      };
    },
    components: {
      "v-leftmenu": leftmenu,
      // "v-Header": Header,
      "v-socketModal": socketModal,
    },
    methods: {
      oversize(margin) {
        this.isMargin = margin
      },
    },
    created () {},
  }
</script>

<style lang="scss">
@import "app";
</style>
