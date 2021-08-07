<template>
  <div class="transfer-page">
    <div class="transfer-toL2-tip flex">
      <div><i class="info_icon"></i></div>
      <div class="flex flex-column">
        <p>L2 转账</p>
        <div class="expand">
          <span class="expand-tip">{{ TRANSFER_TIP }}</span>
        </div>
      </div>
    </div>
    <div class="transfer-opt-area">
      <div class="flex flex-center address-wrapper">
        <div class="address-wrapper-inner">
          <van-field
            v-model="transferAddress"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="walletIsLock"
            placeholder="请输入转账地址"
            @input="handleAddressInputChange"
            @focus="handleAddressInputFocus"
          />
        </div>
      </div>
      <span class="tip"><i class="info_icon"></i>请勿输入交易所地址</span>
      <v-tokenAmount key="tokenAmount-transfer" type="transfer" @childEvent="submitTransfer" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="transfer" v-show="!walletIsLock" />
    <van-popup v-model="tipShow" class="safe-tip-toast" overlay-class="noneOverlay">
      <i class=""></i>
      <span>您的交易地址和交易金额已被加密保护</span>
    </van-popup>
    <v-statusPop
      :status="popStatus"
      title="您的转账已提交"
      timeTxt="预计 1 分钟内完成资金变动"
      tip="可以到“L2 钱包”对应资产的详情查看明细"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import Vue from 'vue';
import { TRANSFER_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import { Popup, Field } from 'vant';

Vue.use(Popup);
Vue.use(Field);

export default {
  name: "Transfer",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      TRANSFER_TIP,
      tipShow: false,
      showStatusPop: false,
      popStatus: "success",
      transferAddress: '',
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
  },
  methods: {
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
    },
    submitTransfer(info) {
      this.showStatusPop = true;
      console.log('金额', info.amount)
    },
    handleAddressInputChange(value) {

    },
    handleAddressInputFocus() {
      this.tipShow = true;
      setTimeout(()=>{
        this.tipShow = false;
      }, 2000)
    },
  },
  mounted() {
    console.log("metamask是否安装-transfer", this.$store.state.metamask.metamaskInstall)
    console.log('钱包账户是否锁定-transfer', this.$store.state.metamask.walletIsLock);
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>