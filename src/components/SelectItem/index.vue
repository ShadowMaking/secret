<template>
    <li class="select-item" @click="selectChange">
      <div class="select-left">
        <div class="select-left-icon">
          <img :src="icon">
        </div>
        <div class="select-left-text">
          <h3 class="select-left-title">{{leftTitle}}</h3>
          <p class="select-left-value">{{leftDes}}</p>
        </div>
      </div>
      <h3 class="select-price-right">{{rightVal}}<label v-if="labelShow">Gwei</label></h3>
    </li>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'selectItem',
  props: ['rightVal', "labelShow", "leftTitle", "leftDes", "icon"],
  methods: {
    selectChange() {
      this.$emit('childevent');
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
