<template>
  <div class="confirm-friends-component">
    <h4>Choose Friends</h4>
    <span class="tip">We will send the account share to your friend's email. Please choose your trusted friends.</span>
    <div class="friend-list-wrapper">
      <div v-if="selectedFriendsList.length" class="friend-list" >
        <div v-for="(item, index) in selectedFriendsList" :key="index" class="friend-item van-hairline--bottom">
          <div class="account-info">
            <span class="portraitImg"></span>
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <!-- <span class="address">{{ item.address | showAddress }}</span> -->
              <span class="address">{{ item.email }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="no-friends" v-else>
        <van-icon name="closed-eye" color="#eee" size="40"/>
        <span>no friends</span>
      </div>
    </div>
    <div class="reviewer-nmmbers">
      <van-field name="stepper" class="flex flex-center">
        <template slot="label">Threshold</template>
        <template #input>
          <van-stepper v-model="number" :min="minNum" :max="maxNum" />
        </template>
      </van-field>
      <span class="tip">Tips: Reviewer number indicates the amount of account shares sent to your friends to recover account.</span>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirm">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { Toast, Popup, Button, Stepper, Field } from 'vant';
import { installWeb3WalletMetamask } from '@/utils/web3'
import { SecLevelEnum, generate_mnemonic, generate_key, split, combine } from '@/utils/secretshare'
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Button)
Vue.use(Field)
Vue.use(Stepper)

export default {
  name: "ConfirmFriends",
  props: ['source'],
  data() {
    return {
      self: this,
      number: 2,
      minNum: 2,
      maxNum: 2,
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
    selectedFriendsList() {
      return _.cloneDeep(this.source)
    },
  },
  watch: {
    source: {
      async handler(newV, oldV) {
        if (newV) {
          this.maxNum = newV.length
        }
      },
      deep: true,
    },
  },
  methods: {
    confirm() {
      this.$emit('childEvent', this.number);
    },
  },
  mounted() {
    this.maxNum = this.selectedFriendsList.length;
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>