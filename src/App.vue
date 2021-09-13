<template>
  <div id="app" class="theme-light">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> -->
      <v-header></v-header>
    </div>
    <router-view :key="$route.path" />
    <v-netTipPopup :show="showNetTip" :showCloseIcon="true" key="netTipModal" :showType="expectNetType" />
  </div>
</template>

<script>
  import _ from 'lodash';
  import header from '@/components/Header/index';
  import NetTipModal from '@/components/NetTipModal';
  import { NETWORKS } from '@/utils/netWork'
  // import { NETWORKS } from '@/utils/netWork_arb'
  import { checkMetamask } from "@/utils/auth";

  export default {
    name: 'APP',
    data() {
      return {
        showNetTip: false,
        expectNetType: '',
      };
    },
    components: {
      'v-header': header,
      "v-netTipPopup": NetTipModal,
    },
    methods: {
      async resetWalletStatus() {
        await this.$store.dispatch("WalletAccountsAddress", {accounts:[]});
        await this.$store.dispatch('WalletLockStatus', {isLock: true});
      },
      checkNet(nID) {
        if (!NETWORKS[nID]) {
          this.showNetTip = true
        } else {
          this.showNetTip = false
        }
      },
      setExpectNetType(routeName) {
        switch(routeName) {
          case 'deposit':
            this.expectNetType = 'l1';
            break;
          case 'withdraw':
          case 'transfer':
            this.expectNetType = 'l2';
            break;
          default:
            this.expectNetType="";
            break;
        }
      },
    },
    created () {
      this.setExpectNetType(this.$route.name);
      /* if (sessionStorage.getItem("store") ) {
        const d = JSON.parse(sessionStorage.getItem("store"));
        this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(sessionStorage.getItem("store"))))
        console.log('d', this.$store.state);
      }

      window.addEventListener("beforeunload",()=>{
        sessionStorage.setItem("store", JSON.stringify(this.$store.state))
      })

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
            const netId = this.web3.utils.hexToNumberString(connectInfo.chainId)
            this.checkNet(netId);
            console.log(`metamask isConnected and connectNetID is ${netId}`)
            this.$eventBus.$emit('chainChanged', {netId, showTip: this.showNetTip });
          }
        });
        ethereum.on('disconnect', async (error) => {
          console.log('disconnect')
        });
        ethereum.on('chainChanged', async (chainId) => {
          const netId = this.web3.utils.hexToNumberString(chainId)
          console.log('chainChanged', netId)
          this.checkNet(netId);
          this.$eventBus.$emit('chainChanged', {netId, showTip: this.showNetTip });
          // if (this.showNetTip) {
            // reset wallet status
            await this.$store.dispatch("WalletAccountsAddress", {accounts:[]})
            await this.$store.dispatch('WalletLockStatus', {isLock: true});
            this.$eventBus.$emit('resetStatus');
          // }
        });
        ethereum.on('accountsChanged', async (accounts) => {
          console.log('accountsChanged', accounts)
          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          await this.$store.dispatch('WalletLockStatus', {isLock: true});
          this.$eventBus.$emit('resetStatus');
          if (accounts.length === 0) { // disconnect 
            console.log('disconnect')
          }
        });
      }
      this.$router.beforeEach((to, from, next) => {
        if (to.meta.title) {
          document.title = to.meta.title;
        }
        this.setExpectNetType(to.name);
        next();
      })
    },
  }
</script>

<style lang="scss">
@import "app";
</style>
