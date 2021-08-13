<template>
  <div class="mywallet-page">
    <div class="top-header">
      <van-row type="flex" justify="space-between" align="center">
        <van-col span="5" class="left-txt">我的钱包</van-col>
        <van-col>
          <van-popover
            v-model="showPopover"
            trigger="click"
            placement="bottom-start">
            <ul class="networklist">
              <li v-for="(item,index) in actions" :key="index" :class="`net-for-${item.key}`" @click="selectNetWork(item)">
                <span class="net-status"></span>
                <span class="net-text">{{ item.name }}</span>
              </li>
            </ul>
            <template #reference>
              <div :class="['selectedNetwork', `net-for-${selectedNet.key}`]">
                <span class="net-status"></span>
                <span class="net-text">{{selectedNet.name}}</span>
                <van-icon name="arrow-down" />
              </div>
            </template>
          </van-popover>
        </van-col>
        <van-col>
          <div class="account"></div>
        </van-col>
      </van-row>
    </div>
    <div class="connect-account">
      <van-row type="flex" justify="space-between" align="center">
        <van-col span="5" class="left-connect-status">
          <i></i><span>已连接</span>
        </van-col>
        <van-col span="14" class="account-info">
          <span class="account-name">Account 1</span>
          <span class="account-address">0x329...du89</span>
        </van-col>
        <van-col span="5"></van-col>
      </van-row>
    </div>
    <div class="balance-info">
      <img :src="DEFAULTIMG.ETH_LOGO" class="eth-logo" />
      <span class="balance-acount">0 ETH</span>
      <span class="usd-acount">$0.00 USD</span>
    </div>
    <v-exchangeList key="comon-exchangeList" type="myWallet" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Col, Row, Icon, Popover } from 'vant';
import { DEFAULTIMG, DEFAULT_NETLIST } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';

Vue.use(Col);
Vue.use(Row);
Vue.use(Icon);
Vue.use(Popover);

export default {
  name: 'MyWallet',
  components: {
    'v-exchangeList': ExchangeList,
  },
  data() {
    return {
      DEFAULTIMG,
      showPopover: false,
      customRpc: { key: 'custom', name: '自定义RPC', url: '',},
      selectedNet: { key: 'ethereum', name: '以太坊Ethereum主网络', url: '', },
    }
  },
  computed: {
    actions() {
      return [].concat(DEFAULT_NETLIST, [this.customRpc]);
    },
  },
  methods: {
    selectNetWork(action) {
      console.log(action)
      this.showPopover = false;
      if (action.key === 'custom') { // 设置网络
        this.$router.push({ name:'SetNet' });
        return
      }
      this.selectedNet = action
      
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>
