<template>
  <div class="input-page">
  	<div class="input-label">{{label}}</div>
  	<div class="input-con">
  	  <input
        @input="inputChange"
  	    type="text"
        :value="value" 
  	    class="input-text" 
  	    :style="{paddingLeft: (leftIcon ? (25+'px') : (0 + 'px'))}"
  	    :placeholder="placeholder ? placeholder : ''" 
  	  >
  	  <img :src="leftIcon" class="input-value-icon" v-if="leftIcon">
  	  <div class="input-right" v-if="rightIcon">
  	  	<img :src="rightIcon" class="input-right-icon">
  	  </div>
  	</div>
  </div>
  
</template>

<script>
import Vue from 'vue';
import { Field } from 'vant';

Vue.use(Field);

export default {
  name: 'Input',
  props: ['label', 'leftIcon', 'rightIcon', 'placeholder', 'value'],
  methods: {
    inputChange(e) {
      const value = e.target.value
      this.$emit('inputChange',{ value });
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
