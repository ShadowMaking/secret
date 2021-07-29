<template>
  <div class="withdraw-page">
    <van-row type="flex" justify="space-between" align="center" class="top-address">
      <van-col span="12" class="textAlignLeft">提现地址</van-col>
      <van-col span="12" class="textAlignRight">
        <van-button color="#E4E6F5" size="mini" @click="setMyAddress">
          <span slots="default" style="coloe:#495ABE">我的地址</span>
        </van-button>
      </van-col>
    </van-row>
    <div class="withdraw-opt-area">
      <div class="flex flex-center address-wrapper">
        <textarea placeholder="请输入提现地址" class="address-textarea"></textarea>
      </div>
      <v-tokenAmount key="tokenAmount-withdraw" type="withdraw" @childEvent="submitWithdraw"/>
    </div>
    <v-exchangeList key="comon-exchangeList" type="withdraw" />
    <v-statusPop
      :status="popStatus"
      title="您的提现已提交"
      timeTxt="预计等待 20-40 分钟汇出"
      tip="请在链上钱包中查看到账情况"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import TokenAmount from '@/components/TokenAmount';
import ExchangeList from '@/components/ExchangeList';
import StatusPop from '@/components/StatusPop';
export default {
  name: "withdraw",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      popStatus: 'sucess',
      showStatusPop: false
    }
  },
  methods: {
    setMyAddress() { },
    changeVisible() {},
    submitWithdraw(info) {
      this.showStatusPop = false;
      console.log('金额', info.amount)
    }
  },
}
</script>

<style lang="scss" scoped>
  @import 'index';
</style>