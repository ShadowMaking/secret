<template>
  <van-popup v-model="show" round :close-on-click-overlay="false" :class="['waiting-modal flex flex-center flex-column', {'waiting-modal-no-loadingIcon': !showSpinner} ]">
    <div class="inner-wrapper">
      <van-loading type="spinner" vertical>Confirming...</van-loading>
    </div>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Loading } from 'vant';
Vue.use(Loading)
export default {
  name: 'LoadingPopup',
  props: ['show', 'showSpinner'],
}
</script>
<style lang="scss" scoped>
  .waiting-modal-no-loadingIcon {
    ::v-deep.van-loading__spinner--spinner { display: none;}
  }
</style>