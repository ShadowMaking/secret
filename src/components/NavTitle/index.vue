<template>
  <div class="nav-title">
  	<i class="el-icon-arrow-left back-icon" v-if="backIcon" @click="backPage"></i>
    <span>{{title}}</span>
    <img src="~@/assets/help.png" class="nav-title-help" @click="toHelp" v-if="helpUrl">
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'Navtitle',
  props: ['title', 'backIcon', 'backEvent', 'helpUrl'],
  methods: {
    backPage() {
      if (this.backEvent) {
        this.backEvent();
      } else {
        this.$router.go(-1)
      }
    },
    toHelp() {
      window.open('https://ieigen.github.io/#/'+ this.helpUrl, '_blank')
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
