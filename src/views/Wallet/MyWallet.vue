<template>
  <div class="mywallet-page">
    <div class="top-header">
      <van-row type="flex" justify="space-between" align="center">
        <van-col span="5" class="left-txt">我的钱包</van-col>
        <van-col>
          <van-popover
            key="networkpopover"
            v-model="showNetworkListPopover"
            trigger="click"
            placement="bottom-start">
            <ul class="networklist-popover">
              <li
                v-for="(item,index) in networkList"
                :key="index"
                :class="[`net-for-${item.key}`, {'active': selectedNet&&selectedNet['key']===item['key']}]"
                @click="selectNetWork(item)">
                <van-icon name="success" class="active-status-icon"/>
                <span class="net-status"></span>
                <span class="net-text">{{ item.netName }}</span>
              </li>
            </ul>
            <template #reference>
              <div :class="['selectedNetwork', `net-for-${selectedNet&&selectedNet['key']}`]">
                <span class="net-status"></span>
                <span class="net-text">{{selectedNet&&selectedNet['netName']}}</span>
                <van-icon name="arrow-down" />
              </div>
            </template>
          </van-popover>
        </van-col>
        <van-col>
          <van-popover
            key="accountListpopover"
            v-model="showAccountListPopover"
            trigger="click"
            placement="bottom-end">
            <div class="account-popover">
              <div class="van-hairline--bottom account-header">
                <span>我的账户</span>
                <van-button plain type="info" class="lockbutton" size="small">锁 定</van-button>
              </div>
              <ul class="accountlist">
                <li
                  v-for="(item,index) in accoutList"
                  :key="index"
                  :class="[{'active':selectedAccount['address']===item.address}]"
                  @click="selectAccount(item)">
                  <van-icon name="success" class="active-status-icon"/>
                  <div class="account-text">
                    <span>{{ item.name }}</span>
                    <span>0 ETH</span>
                  </div>
                </li>
              </ul>
              <div class="account-setting-wrapper van-hairline--top">
                <div class="opt-item van-hairline--bottom" @click="accountSeeting('addCount')">
                  <van-icon name="plus" class="opt-icon" />
                  <span>创建账户</span>
                </div>
                <div class="opt-item van-hairline--bottom" @click="accountSeeting('importCount')">
                  <van-icon name="down" class="opt-icon" />
                  <span>导入账户</span>
                </div>
                <div class="opt-item van-hairline--bottom" @click="accountSeeting('pairingNet')">
                  <van-icon name="cluster-o" class="opt-icon" />
                  <span>配置网络对</span>
                </div>
              </div>
            </div>
            <template #reference><div class="account"></div></template>
          </van-popover>
        </van-col>
      </van-row>
    </div>
    <div class="connect-account">
      <van-row type="flex" justify="space-between" align="center">
        <van-col span="5" class="left-connect-status">
          <i></i><span>已连接</span>
        </van-col>
        <van-col span="14" class="account-info">
          <span class="account-name">{{ selectedAccount['name'] }}</span>
          <span class="account-address">
            {{ `${selectedAccount['address'].slice(0,4)}...${selectedAccount['address'].slice(selectedAccount['address'].length-4)}`}}
          </span>
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
// import UnlockWallet from '@/components/UnlockWallet';
import { getInfoFromStorageByKey } from '@/utils/storage';
import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)

Vue.use(Col);
Vue.use(Row);
Vue.use(Icon);
Vue.use(Popover);

export default {
  name: 'MyWallet',
  components: {
    'v-exchangeList': ExchangeList,
    // 'v-unlockwallet': UnlockWallet,
  },
  data() {
    return {
      DEFAULTIMG,
      showNetworkListPopover: false,
      customRpc: { key: 'custom', netName: '自定义RPC', rpcUrl: '',},
      selectedNet: { key: 'ethereum', name: '', rpcUrl: '', }, // 默认选择以太坊主网
      showAccountListPopover: false,
      selectedAccount: {address:'', name:''},
    }
  },
  computed: {
    walletIsLock() {
      const walletInfo = getInfoFromStorageByKey('walletInfo')
      if (walletInfo) {
        return walletInfo.isLock
      }
      return true;
    },
    networkList() {
      console.log(1)
      const customNetList = getInfoFromStorageByKey('netList') || [];
      const pairNetList = getInfoFromStorageByKey('netPairList') || [];
      return [].concat(DEFAULT_NETLIST, customNetList, pairNetList, [this.customRpc]);
    },
    accoutList() {
      const info = getInfoFromStorageByKey('walletAccounts') || []
      return info
    },
  },
  // 异步计算属性
  /* asyncComputed: {
    async selectedNet() {
      const netInfo = await this.getSelectedNet();
      return netInfo
    },
  }, */
  methods: {
    accountSeeting(type) {
      switch(type) {
        case 'addCount':
          break;
        case 'importCount':
          this.$router.push({ name:'ImportAccount' })
          break;
        case 'pairingNet':
          this.$router.push({ name:'PairingNet' })
          break;
      }
    },
    async selectNetWork(record) {
      console.log(record)
      this.showNetworkListPopover = false;
      if (record.key === 'custom') { // 设置网络
        this.$router.push({ name:'SetNet' });
        return
      }
      this.selectedNet = record;
      await this.$store.dispatch('updateConnectNet', record.key);
    },
    selectAccount(record) {
      console.log(record)
    },
    async setConnectNet() {
      const netKey = await this.$store.dispatch('getConnectNet');
      const allNetList = await this.$store.dispatch('getAllNetList');
      const target = _.find(allNetList, {key: netKey})
      this.selectedNet = target;
    },
    async setConnectAccount() {
      const { info } = await this.$store.dispatch('getLoginInfo');
      this.selectedAccount = info;
    },
  },
  created() {
    
  },
  async mounted() {
    await this.setConnectNet();
    await this.setConnectAccount();

  },
  
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
