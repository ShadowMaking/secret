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
        <textarea placeholder="请输入转账地址" class="address-textarea"></textarea>
      </div>
      <span class="tip"><i class="info_icon"></i>请勿输入交易所地址</span>
      <v-tokenAmount key="tokenAmount-transfer" type="transfer" @childEvent="submitTransfer"/>
    </div>
    <v-exchangeList key="comon-exchangeList" type="transfer" />
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
import { Popup } from 'vant';

Vue.use(Popup);

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
      tipShow: true,
      showStatusPop: false,
      popStatus: "success"
    }
  },
  methods: {
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
    },
    submitTransfer(info) {
      this.showStatusPop = true;
      console.log('金额', info.amount)
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>