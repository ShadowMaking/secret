<template>
  <p class="nav-title">{{title}}</p>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'Navtitle',
  props: ['title'],
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
