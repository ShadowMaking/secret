<template>
  <div class="left-container">
  <div class="left-menu-box" id="leftmenu">
    <img src="~@/assets/menu.png" class="menu-icon" @click="showPopup" v-show="iconVisible">
    <van-popup v-model="menuVisible" position="left" class="popup-box" overlay-class="popup-overlay" :overlay="iconVisible">
      <div class="account-header-warp">
        <v-leftHeader></v-leftHeader>
      </div>
      <div v-for="(item, index) in menuData" :key="index" @click="changeMenu(index, item.route, 'activeKey')"
      >
        <!-- <van-icon :name="item.icon" size="20px"/> -->
        <div :class="['left-menu-item', index == activeKey ? 'active' : '']">
          <label style="font-size: 20px"><i :class="item.icon" size="60px"></i></label>
          <span>{{item.name}}</span>
        </div>
        <div v-if="item.subMenu">
          <div v-for="(itemChild, indexChild) in item.subMenu" :key="indexChild" :class="['left-menu-item-child', (indexChild == activeChildKey && index == activeKey)? 'active' : '']" @click.stop="changeMenu(indexChild, itemChild.route, 'activeChildKey', index)">
            <!-- <label style="font-size: 20px"><i :class="itemChild.icon" size="60px"></i></label> -->
            <span>{{itemChild.name}}</span>
          </div>
        </div>
      </div>
      <div class="left-menu-item-for-hasSub">
        <van-collapse v-model="activeNames" v-for="(item, index) in multiMenuData" :key="index">
          <van-collapse-item :name="item.name" class="item" v-if="!(currentAccountType == 2 && item.name == 'Tools')">
            <template #title><div><label style="font-size: 20px"><i :class="item.icon" size="60px"></i></label>{{ item.name }}</div></template>
            <div v-for="(_item, index) in item.subMenu" :key="index" :class="['item-menu', {'active': `${index}-${_item.route}` == activeKey}]"  @click="_changeMenu(index, _item.route, 'activeKey')">
              <router-link :to="_item.route" v-if="!(currentAccountType == 1 && _item.name == 'Security Setting')"><span>{{ _item.name }}</span></router-link>
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>
      <!-- <div v-for="(item, index) in menuData" :key="index"
      :class="[!item.children||item.children && item.children.length===0 ? 'left-menu-item':'left-menu-item-for-hasSub', index == activeKey ? 'active' : '']" @click="changeMenu(index, item.route)"
       >
        <div v-if="!item.children||item.children && item.children.length===0">
          <label style="font-size: 20px"><i :class="item.icon" size="60px"></i></label>
          <span>{{item.name}}</span>
        </div>
        <div v-else>
          <van-collapse v-model="activeNames">
            <van-collapse-item :title="item.name" name="1" icon="shop-o" class="item">
              <div v-for="(item, index) in item.children" :key="index" class="item-menu">
                <router-link :to="item.path">
                  <span>{{ item.name }}</span>
                </router-link>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>
      </div> -->
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
  <div id="leftHeaderBox" style="width: 100%;"></div>
  </div>
</template>

<script>
import Vue from 'vue';
import web3 from 'web3'
import 'vant/lib/index.css'
import { Icon, Popup, Collapse, CollapseItem } from 'vant';
import formSelect from '@/components/Select/index';
import leftHeader from './Header/index';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Icon);
Vue.use(Popup);
Vue.use(Collapse);
Vue.use(CollapseItem);

export default {
  name: 'LeftMenu',
  data() {
    return {
      defaultNetWork: '',
      menuVisible: true,
      iconVisible: false,
      activeKey: 0,
      activeChildKey: 0,
      menuData: [
        {icon: 'el-icon-view', name: 'Overview', route: '/overview'},
        {icon: 'el-icon-position', name: 'Send', route: '/sendMenu'},
        {icon: 'el-icon-sell', name: 'Exchange', route: '/exchange'},
        // {icon: 'el-icon-suitcase-1', name: 'Tools', subMenu: [
        //   {icon: 'el-icon-plus', name: 'Create Secret', route: '/backup?type=create'},
        //   {icon: 'el-icon-document', name: 'Recover Secret', route: '/srecovery'},
        //   {icon: 'el-icon-s-custom', name: 'Co-Workers', route: '/addfriends'},
        // ]},
        // {icon: 'el-icon-guide', name: 'Bridge', route: '/bridge'},
        // {
        //   icon: 'el-icon-collection', 
        //   name: 'NC-Wallet', 
        //   route: '/ncWalletList', 
        //   subMenu: [{
        //     icon: 'el-icon-bank-card', 
        //     name: 'My NC-Wallet', 
        //     route: '/ncWalletList',
        //   },{
        //     icon: 'el-icon-document-add', 
        //     name: 'Create NC-Wallet', 
        //     route: '/ncWalletCreate',
        //   },{
        //     icon: 'el-icon-sell', 
        //     name: 'Recover NC-Wallet', 
        //     route: '/ncWalletRecover',
        //   }]
        // },
      ],
      multiMenuData: [
        {icon: 'el-icon-suitcase-1', name: 'Tools', subMenu: [
          // {icon: 'el-icon-plus', name: 'Create Secret', route: '/backup?type=create'},
          {icon: 'el-icon-document', name: 'Recover Account', route: '/srecovery'},
          {icon: 'el-icon-s-custom', name: 'Co-workers', route: '/addfriends'},
        ]},
        {icon: 'el-icon-suitcase-1', name: 'Activity', subMenu: [
          // {icon: 'el-icon-plus', name: 'Create Secret', route: '/backup?type=create'},
          {icon: 'el-icon-document', name: 'History', route: '/history'},
          {icon: 'el-icon-s-custom', name: 'Approval', route: '/approval'},
        ]},
        {
          icon: 'el-icon-collection', 
          name: 'Security', 
          // route: '/ncWalletList',
          subMenu: [{
            icon: 'el-icon-bank-card', 
            name: 'Signers', 
            route: '/NcWalletSigner',
          },{
            icon: 'el-icon-document-add', 
            name: 'Security Setting', 
            route: '/ncWalletSetting',
          },{
            icon: 'el-icon-sell', 
            name: 'Recover Wallet', 
            route: '/ncWalletRecover',
          }]
        },
      ],
      screenWidth: null,

      defaultIcon: null,
      netWorkList: [],

      activeNames: ['Activity', 'Security'],
      currentAccountType: 1, //1-account address ,2-wallet address
    }
  },
  components: {
    "v-formSelect": formSelect,
    "v-leftHeader": leftHeader,
  },
  mounted() {
    this.defaultNetWork = this.getDefaultNetWork()
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    this.netWorkList.map(item => {
      if (item.id == this.defaultNetWork) {
        this.defaultIcon = item.icon
      }
    })
    this.getCurrentAccountType()

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
        console.log(val)
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
    $route(to, from) {
      this.$route.name === 'overview' && (this.activeKey = 0)
    }
  },
  methods: {
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    showPopup() {
      this.menuVisible = true;
    },
    changeMenu(index, route, activeType, parentIndex) {//if index=childindex,parentIndex is need
      this[activeType] = index
      if (activeType == 'activeChildKey') {this.activeKey = parentIndex}
      this.$router.push({ path: route})
    },
    _changeMenu(index, route, activeType, parentIndex) {
      this[activeType] = `${index}-${route}`
      if (activeType == 'activeChildKey') {this.activeKey = parentIndex}
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
    handleAccountChange(addressInfo) {
      this.getCurrentAccountType()
    },
    getCurrentAccountType() {
      const userId = getFromStorage('gUID')
      if (userId) {
        const userMap = getInfoFromStorageByKey('userMap');
        const userData = userMap && userMap[userId]
        if (userData['walletAddress']) {
          this.currentAccountType = 2
        } else {
          this.currentAccountType = 1
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
