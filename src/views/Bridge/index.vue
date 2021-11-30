<template>
  <div class="bridge-page content-box">
    <v-navTitle title="Bridge"></v-navTitle>
    <div class="send-menu content-page">
      <v-bridge></v-bridge>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { Icon, Popup } from 'vant';
import navTitle from '@/components/NavTitle/index';
import bridge from '@/views/Home/index';

Vue.use(Icon);
Vue.use(Popup);

export default {
  name: 'Bridge',
  data() {
    return {
      
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-bridge": bridge,
  },
  methods: {
    
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
