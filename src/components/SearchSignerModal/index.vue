<template>
  <div class="search-sign-page">
    <div class="add-signer-btn" style="width: 100%" @click="addSignerBtn">
      <img src="~@/assets/friendIcon.png" class="signer-icon">
      <span>Add another signer</span>
    </div>
  <van-popup v-model="showPopup" class="search-modal-popUp" @close="closeModal">
    <div class="sign-modal">
      <div class="sign-modal-wraper">
        <div class="sign-modal-title">Search Google account name,address and ENS to add signer</div>
        <div class="sign-model-input">
          <el-select
            v-model="searchInput"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="Google Account Name、Address or ENS"
            :remote-method="remoteMethod"
            style="width: 94%;margin-left: 3%"
            no-data-text="no data">
            <el-option
              v-for="(item, index) in signListoptions"
              :key="index"
              :label="item.label"
              :value="item.value" style="padding-left: 10px;">
            </el-option>
          </el-select>
        </div>
        <div class="button-content">
          <van-button class="opt-button" color="#367BCF" plain @click="cancelModal">Cancel</van-button>
          <van-button class="opt-button" color="#367BCF" @click="confirm">Add</van-button>
        </div>
      </div>
    </div>
  </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Popup, Button} from 'vant';

Vue.use(Popup);
Vue.use(Button);


export default {
  name: 'SearchSignerModal',
  props: {
    'dataSource': { type: Array, default: null },
  },
  data() {
    return {
      showPopup: false,
      searchInput: '',
      signListoptions: this.dataSource,

    }
  },
  // watch: {
  //   dataSource() {
  //     this.signListoptions = this.dataSource
  //   },
  // },
  methods: {
    cancelModal() {
      this.showPopup = false;
    },
    confirm() {
      this.showPopup = false;
      // this.$emit('confirm');
    },
    closeModal() {
      this.showPopup = false;
    },
    remoteMethod(query) {
      console.log(query)
    },
    addSignerBtn() {
      this.showPopup = true
    },
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
