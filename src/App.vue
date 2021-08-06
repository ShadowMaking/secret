<template>
  <div id="app" class="theme-light">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> -->
      <v-header></v-header>
    </div>
    <router-view :key="$route.path" />
  </div>
</template>

<script>
  import _ from 'lodash';
  import header from '@/components/Header/index';
  import {
    checkMetamask, connectMetamask,
    setCookie, getCookie, getAccount } from "@/utils/auth";

  export default {
    name: 'APP',
    data() {
      return { };
    },
    components: {
      'v-header': header,
    },
    methods: {
      async resetWalletStatus() {
        await this.$store.dispatch("WalletAccountsAddress", {accounts:[]});
        await this.$store.dispatch('WalletLockStatus', {isLock: true});
      },
    },
    created () {
      //在页面加载时读取sessionStorage里的状态信息
      /* if (sessionStorage.getItem("store") ) {
        const d = JSON.parse(sessionStorage.getItem("store"));
        this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(sessionStorage.getItem("store"))))
        console.log('d', this.$store.state);
      }

      //在页面刷新时将vuex里的信息保存到sessionStorage里
      window.addEventListener("beforeunload",()=>{
        sessionStorage.setItem("store", JSON.stringify(this.$store.state))
      })

      //ios废弃了beforeunload，使用pagehide代替
      window.addEventListener("pagehide",()=>{
        const d = _.cloneDeep(this.$store.state);
        sessionStorage.setItem("store", JSON.stringify(this.$store.state))
      }) */
    },
    async mounted() {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", async () => {
        // check metamask install status
        const info = await checkMetamask();
        const { installStatus } = info;
        await this.$store.dispatch('MetamaskInstall', { metamaskInstall: installStatus });
        if (!installStatus) {
          await this.resetWalletStatus();
        }
      })
      if (window.ethereum) {
        ethereum.on('connect', async (connectInfo) => {
          if(window.ethereum.isConnected()){
            console.log('isConnected')
          }
        });
        ethereum.on('disconnect', async (error) => {
          console.log('disconnect')
        });
        ethereum.on('chainChanged', async (chainId) => {
          console.log(4, chainId)
          // 需要重置钱包相关状态
          await this.$store.dispatch("WalletAccountsAddress", {accounts:[]})
          await this.$store.dispatch('WalletLockStatus', {isLock: true});
          this.$eventBus.$emit('updateAvailableBanlance', {balance: 0});
        });
        ethereum.on('accountsChanged', async (accounts) => {
          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          if (accounts.length === 0) { // 断开了链接
            await this.$store.dispatch('WalletLockStatus', {isLock: true});
          }
        });
      }
    },
  }
</script>

<style lang="scss">
@import "app";
</style>
