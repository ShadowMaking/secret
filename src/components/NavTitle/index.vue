<template>
  <div class="nav-title">
  	<i class="el-icon-arrow-left back-icon" v-if="backIcon" @click="backPage"></i>
    <span>{{title}}</span>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'Navtitle',
  props: ['title', 'backIcon', 'backEvent'],
  methods: {
    backPage() {
      if (this.backEvent) {
        this.backEvent();
      } else {
        this.$router.go(-1)
      }
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
