<template>
  <div class="left-menu-box" id="leftmenu">
    <img src="~@/assets/menu.png" class="menu-icon" @click="showPopup" v-show="iconVisible">
    <van-popup v-model="menuVisible" position="left" class="popup-box" overlay-class="popup-overlay" :overlay="iconVisible">
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
</template>

<script>
import Vue from 'vue';
import web3 from 'web3'
import 'vant/lib/index.css'
import { Icon, Popup, Collapse, CollapseItem } from 'vant';
import formSelect from '@/components/Select/index';
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
        {icon: 'el-icon-view', name: 'Overview', route: '/overView'},
        {icon: 'el-icon-position', name: 'Send', route: '/sendMenu'},
        {icon: 'el-icon-sell', name: 'Exchange', route: '/exchange'},
        {icon: 'el-icon-suitcase-1', name: 'Tools', subMenu: [
          {icon: 'el-icon-plus', name: 'Create Secret', route: '/backup?type=create'},
          {icon: 'el-icon-document', name: 'Recover Secret', route: '/srecovery'},
          {icon: 'el-icon-s-custom', name: 'Co-Workers', route: '/addfriends'},
        ]},
        // {icon: 'el-icon-guide', name: 'Bridge', route: '/bridge'},
        {
          icon: 'el-icon-collection', 
          name: 'NC-Wallet', 
          route: '/ncWalletList', 
          subMenu: [{
            icon: 'el-icon-bank-card', 
            name: 'My NC-Wallet', 
            route: '/ncWalletList',
          },{
            icon: 'el-icon-document-add', 
            name: 'Create NC-Wallet', 
            route: '/ncWalletCreate',
          },{
            icon: 'el-icon-sell', 
            name: 'Recover NC-Wallet', 
            route: '/ncWalletRecover',
          }]
        },
      ],
      screenWidth: null,

      defaultIcon: null,
      netWorkList: [],

      activeNames: ['1'],
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
    changeMenu(index, route, activeType, parentIndex) {//if index=childindex,parentIndex is need
      this[activeType] = index
      if (activeType == 'activeChildKey') {this.activeKey = parentIndex}
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
