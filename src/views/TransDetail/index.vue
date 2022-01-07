<template>
  <div class="trans-detail-page">
    <v-navTitle title="Transactions Detail" :backIcon="true" :backEvent="backHistory"></v-navTitle >
    <div class="trans-detail-box">
      <div class="trans-detail-info">
        <div class="trans-item">
          <span class="trans-item-name">Transaction hash:</span>
          <span class="trans-item-value">0xda89dfdfkjekks</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">SafeTxHash:</span>
          <span class="trans-item-value">0x85sdsdfs</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Nonce:</span>
          <span class="trans-item-value">3</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Created:</span>
          <span class="trans-item-value">Nov 27,2021-4:11:34 PM</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Executed:</span>
          <span class="trans-item-value">Nov 27,2021-4:11:34 PM</span>
        </div>
      </div>
      <div class="trans-path-title">Execution Path</div>
      <div class="trans-path-list">
        <div class="trans-path-item active">
          <div class="path-item-top">
            <span class="path-item-icon">1</span>
            <span class="path-item-status success">Created</span>
          </div>
          <div class="path-item-bottom"></div>
        </div>
        <div class="trans-path-item active">
          <div class="path-item-top">
            <span class="path-item-icon active">2</span>
            <span class="path-item-status success">Confirmed</span>
          </div>
          <div class="path-item-bottom">
            <div class="path-item-bottom-img">
              <img src="@/assets/network/Ropsten.png">
            </div>
            <div class="path-item-bottom-con">
              <p>lee-1</p>
              <p>0xjkskdsdj</p>
            </div>
          </div>
        </div>
        <div class="trans-path-item">
          <div class="path-item-top">
            <span class="path-item-icon active">3</span>
            <span class="path-item-status error">To be confirmed by other signers</span>
          </div>
          <div class="path-item-bottom">
            <div class="path-item-bottom-btn">
              <el-button type="primary">Confirm</el-button>
              <el-button>Refuse</el-button>
            </div>
          </div>
        </div>
        <div class="trans-path-item">
          <div class="path-item-top">
            <span class="path-item-icon active">4</span>
            <span class="path-item-status error">failed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import navTitle from '@/components/NavTitle/index'

export default {
  name: 'signManage',
  data() {
    return {
      signList: [{
        CreateTime:1,
        WalletName: 2,
        Balance: 3,
        Address: 4,
        State: 1,
        id: 1,
      },{
        CreateTime:1,
        WalletName: 2,
        Balance: 3,
        Address: 4,
        State: 5,
        id: 1,
      }],

      searchSignerList: [],

      signerPercent: 0,
      signerTotal: 0,
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    backHistory() {
      this.$router.push({
        path: `/overview`,
        query: {tabActive: 1},
      })
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .el-button {
    padding: 5px 10px;
  }
</style>
