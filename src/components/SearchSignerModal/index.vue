<template>
  <div class="search-sign-page">
    <div class="add-signer-btn" style="width: 100%" @click="addSignerBtn">
      <img src="~@/assets/friendIcon.png" class="signer-icon">
      <span class="blueColor">Add Guardian</span>
    </div>
  <van-popup v-model="showPopup" class="search-modal-popUp" @close="closeModal">
    <div class="sign-modal">
      <div class="sign-modal-wraper">
        <div class="sign-modal-top">
          <div class="sign-modal-title">Search your friend Eigen account and add him as Guardian</div>
          <div class="sign-model-input">
            <el-select
              v-model="searchInput"
              filterable
              remote
              reserve-keyword
              placeholder=""
              :remote-method="remoteMethod"
              style="width: 94%;margin-left: 3%"
              no-data-text="no data"
              value-key="address">
              <el-option
                v-for="(item, index) in signListoptions"
                :key="index"
                :label="item.address"
                :value="item" style="padding-left: 10px;">
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="button-content">
          <van-button class="opt-button" type="default" @click="cancelModal">Cancel</van-button>
          <van-button class="opt-button" color="#367BCF" @click="confirmAdd">Confirm</van-button>
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
  watch: {
    dataSource() {
      console.log(this.dataSource)
      this.signListoptions = this.dataSource
    },
  },
  methods: {
    cancelModal() {
      this.showPopup = false;
    },
    confirmAdd() {
      this.showPopup = false;
      this.$emit('addConfirm', this.searchInput);
    },
    closeModal() {
      this.showPopup = false;
    },
    remoteMethod(query) {
      this.$emit('confirm', query)
    },
    addSignerBtn() {
      this.signListoptions = []
      this.searchInput = ''
      this.showPopup = true
    },
  },
}
</script>
<style lang="scss">
  @import './index.scss';
  .el-select-dropdown {
    z-index: 2020 !important;
  }
  .search-modal-popUp {
    z-index: 2019 !important;
  }
  .search-sign-page .van-overlay {
    z-index: 2018 !important;
  }
</style>
