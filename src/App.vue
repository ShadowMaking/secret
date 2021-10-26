<template>
  <div id="app" class="theme-light">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> -->
      <v-header v-if="headerIsShow"></v-header>
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
  import { checkMetamask, removeTokens } from "@/utils/auth";

  export default {
    name: 'APP',
    data() {
      return {
        showNetTip: false,
        expectNetType: '',
        headerIsShow: true,
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
      hanleClick(ev) {
        ev = ev || window.event;
        // ev.preventDefault()
        const target = ev.target || ev.srcElement
        // console.log('click event')
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
          removeTokens()
        });
        ethereum.on('chainChanged', async (chainId) => {
          const netId = this.web3.utils.hexToNumberString(chainId)
          console.log('chainChanged', netId)
          this.checkNet(netId);
          await this.$store.dispatch("WalletAccountsAddress", {accounts:[]})
          await this.$store.dispatch('WalletLockStatus', {isLock: true});
          this.$eventBus.$emit('chainChanged', {netId, showTip: this.showNetTip });
          removeTokens()
        });
        ethereum.on('accountsChanged', async (accounts) => {
          console.log('accountsChanged', accounts)
          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          await this.$store.dispatch('WalletLockStatus', {isLock: true});
          this.$eventBus.$emit('accountsChanged', { accounts });
          if (accounts.length === 0) { // disconnect 
            console.log('disconnect')
          }
          removeTokens()
        });
      }
      if (/tlogin/.test(window.location.pathname) || /tlogin/.test(window.location.hash)) {
        this.headerIsShow = false
      }
      this.$router.beforeEach((to, from, next) => {
        if (to.meta.title) {
          document.title = to.meta.title;
        }
        this.setExpectNetType(to.name);
        this.headerIsShow = true;
        to.meta.hideHeader && (this.headerIsShow = false);
        next();
      })

      /* document.onclick = _.throttle(this.hanleClick);
      document.ontouchend = _.throttle(this.hanleClick); */
      
      // document.ontouchstart = _.throttle(this.hanleClick);
      // document.onscroll = _.throttle(this.hanleClick);
    }
  }
</script>

<style lang="scss">
@import "app";
</style>
