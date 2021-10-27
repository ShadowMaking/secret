<template>
  <div class="choose-friends-component">
    <h4>Choose Friends</h4>
    <span class="tip">We will split the secret key and send it through your Google Friends' Email</span>
    <div class="friend-list-wrapper">
      <div v-if="friendsList.length" class="friend-list" >
        <div v-for="(item, index) in friendsList" :key="index" class="friend-item van-hairline--bottom">
          <div class="account-info">
            <span class="portraitImg"></span>
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <!-- <span class="address">{{ item.address | showAddress }}</span> -->
              <span class="address">{{ item.email }}</span>
            </div>
          </div>
          <div class="status">
            <van-switch :key="item.id" :value="friendsIdsMap[`${[item.id]}-checked`]" @input="(val)=>{changeFriendSelect(val, item)}" />
          </div>
        </div>
      </div>
      <div class="no-friends" v-else>
        <van-icon name="closed-eye" color="#eee" size="40"/>
        <span>no friends</span>
      </div>
    </div>
    <div class="opt-wrapper" v-if="friendsList.length===0">
      <van-button block color="#495ABE" @click="toPage('addfrinds')">Add Frineds</van-button>
    </div>
    <div class="opt-wrapper" v-if="friendsList.length">
      <van-button block color="#495ABE" :disabled="selectedFriends.length===0 || selectedFriends.length===1" @click="confirm">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { Toast, Popup, Button, Switch } from 'vant';
import { installWeb3WalletMetamask } from '@/utils/web3'
import { SecLevelEnum, generate_mnemonic, generate_key, split, combine } from '@/utils/secretshare'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Button)
Vue.use(Switch)

export default {
  name: "ChooseFriends",
  data() {
    return {
      self: this,
      checked: false,
      /* friendsList: [{
        id: 1,
        name: 'skyeGao',
        address: '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',
        email: 'skyeGao666@gmail.com'
      },{
        id: 2,
        name: 'skyeGao',
        address: '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',
        email: 'skyeGao666@gmail.com'
      }], */
      friendsList: [],
      friendsIdsMap: null, // { '1-checked': false, '2-checked': false, ...}
      selectedFriends: []
    }
  },
  filters: {
    showAddress(str) {
      if (!str) { return ''}
      return `${str.slice(0,6)}...${str.slice(-4)}`
    },
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
  },
  methods: {
    changeFriendSelect(checked, record) {
      const selectedIds = _.cloneDeep(this.selectedFriends)
      if (checked) {
        selectedIds.push(record.id)
      } else {
        const target = _.find(selectedIds, {id: record.id})
        target && (_.dropWhile(selectedIds, i=>i.id===record.id))
      }
      this.selectedFriends = selectedIds;
      this.checked = checked;
      this.friendsIdsMap[`${record.id}-checked`] = checked
    },
    toPage(routeNme) {
      this.$router.push({ name: routeNme })
    },
    generateFriendsList(list) {
      return list.map(item=>{
        return {
          id: item['user_id'],
          name: item['name'],
          email: item['email']
        }
      })
    },
    generateFriendsIdsMap(list) {
      const objMap = {}
      list.map(i=>{
        objMap[`${i.id}-checked`] = false
      })
      return objMap
    },
    async getMyFriendsList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetMyFriendsList', {userId, status: 1});
      if (!hasError) {
        this.friendsList = this.generateFriendsList(list)
        this.friendsIdsMap = this.generateFriendsIdsMap(list)
      }
    },
    confirm() {
      const friendsIds = Object.keys(this.friendsIdsMap).filter(i=>this.friendsIdsMap[i]).map(i => i.split('-')[0]) || []
      if (!friendsIds.length) {
        Toast('Please select friend')
        return
      }
      const friendsInfoList = friendsIds.map(fid => {
        const friend = _.find(this.friendsList, {id: ~~fid})
        if (friend) {
          return { ...friend }
        }
      })
      this.$emit('childEvent', friendsInfoList);
    },
  },
  mounted() {
    this.friendsList = [];
    this.getMyFriendsList()
    
    // test
    /* const splis = split('0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9', 'WEAK')
    const combineWords =combine(splis)
    console.log(splis)
    console.log(combineWords) */
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>