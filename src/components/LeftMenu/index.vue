<template>
  <div class="left-menu-box" id="leftmenu">
    <img src="~@/assets/menu.png" class="menu-icon" @click="showPopup" v-show="iconVisible">
    <van-popup v-model="menuVisible" position="left" class="popup-box" overlay-class="popup-overlay" :overlay="iconVisible">
      <div v-for="(item, index) in menuData" :key="index" :class="['left-menu-item', index == activeKey ? 'active' : '']" @click="changeMenu(index, item.route)"
       >
        <!-- <van-icon :name="item.icon" size="20px"/> -->
        <label style="font-size: 20px"><i :class="item.icon" size="60px"></i></label>
        <span>{{item.name}}</span>
      </div>
      <div class="network-container">
        <v-formSelect
          label="NETWORK"
          :labelShow="false"
          :defaultValue="defaultNetWork"
          :leftIcon="defaultIcon" 
          :dataSource="netWorkList"
          placeholder="chose network"
          @change="handleNetworkChange" />
      </div>
    </van-popup>
  </div>
</template>

<script>
import Vue from 'vue';
import web3 from 'web3'
import 'vant/lib/index.css'
import { Icon, Popup } from 'vant';
import formSelect from '@/components/Select/index';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Icon);
Vue.use(Popup);

export default {
  name: 'LeftMenu',
  data() {
    return {
      defaultNetWork: '',
      menuVisible: true,
      iconVisible: false,
      activeKey: 0,
      menuData: [
        {icon: 'el-icon-view', name: 'Overview', route: '/overView'},
        {icon: 'el-icon-position', name: 'Send', route: '/sendMenu'},
        {icon: 'el-icon-sell', name: 'Exchange', route: '/exchange'},
        // {icon: 'el-icon-guide', name: 'Bridge', route: '/bridge'},
      ],
      screenWidth: null,

      defaultIcon: null,
      netWorkList: [],
    }
  },
  components: {
    "v-formSelect": formSelect,
  },
  mounted() {
    this.defaultNetWork = this.getDefaultNetWork()
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    this.netWorkList.map(item => {
      if (item.id == this.defaultNetWork) {
        this.defaultIcon = item.icon
      }
    })

    this.screenWidth = document.body.clientWidth
    window.onresize = () => {
      return (() => {
        this.screenWidth = document.body.clientWidth
      })()
    }
  },
  watch: {
    screenWidth: {
      handler: function(val, oldVal) {
        if (val < 769) {
          this.iconVisible = true
          this.menuVisible = false
          this.$emit('oversize', false);
        } else {
          this.iconVisible = false
          this.menuVisible = true
          this.$emit('oversize', true);
        }
      },
      immediate: true
    },
  },
  methods: {
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    showPopup() {
      this.menuVisible = true;
    },
    changeMenu(index, route) {
      this.activeKey = index
      this.$router.push({ path: route})
    },
    async handleNetworkChange(data) {
      const chainInfo = CHAINMAP[web3.utils.numberToHex(data.value.id)]
      await this.$store.dispatch('StoreSelectedNetwork', { netInfo: chainInfo })
      this.$eventBus.$emit('networkChange', { chainInfo, from:'leftMenu' })
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'leftMenu') { return }
      this.defaultNetWork = chainInfo.id
      this.defaultIcon = chainInfo.icon
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
