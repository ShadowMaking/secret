<template>
  <div class="socket-page">
  </div>
</template>
<script>
  import { io } from "socket.io-client";
  import { getAuthToken } from '@/utils/auth'
  import { WEBSITE_BASEURL } from '../../global'
  import { getInfoFromStorageByKey } from '@/utils/storage';
  import { getConnectedAddress, initRPCProvider, getConnectedNet } from '@/utils/dashBoardTools';

  export default {
    name: 'socketModal',
    data() {
      return {
        modalVisible: false,
        currentToken: getAuthToken('gtoken'),
        defaultNetWork: '',
        currentAccount: getConnectedAddress(),
        socket: io(WEBSITE_BASEURL),

        confirmingList: [],
        confirmedList: [],
      };
    },
    methods: {
      connetSocket() {
        console.log(this.socket)
        this.socket.on("connect", () => {
            console.log(`connect ${this.socket.id}`);
        });
        this.socket.on("start", (msg) => {
          console.log(this.socket.id)
          this.socketEvent('[]')
        });
        this.socket.on("confirming", async(msg) => {
          console.log(this.socket.id)
          console.log(msg)
          if (msg.unconfirmed_txlist.length == 0) return
          this.confirmingList = msg.unconfirmed_txlist
          const confrimData = await this.getTransactionStatus()
          this.socketEvent(confrimData)
        });
        this.socket.on("connect_failed", () => { console.log('connect_failed')} );
        this.socket.on("error", () => { console.log('error')} );
        this.socket.on("disconnect", () => { console.log('disconnect')} );
      },
      socketEvent(list) {
        this.socket.emit('confirmed', { 
          network_id: this.defaultNetWork, 
          from: this.currentAccount, 
          token: this.currentToken, 
          confirmed_txlist: list
        });
      },
      async getTransactionStatus() {
        this.confirmedList = []
        const network = getConnectedNet()
        const rpcUrl = network['rpcUrls'][0]
        const provider = initRPCProvider(rpcUrl)
        for( var i=0; i<this.confirmingList.length; i++) {
          let confirmingItemHash = this.confirmingList[i]
          const txReceipt = await provider.getTransactionReceipt(confirmingItemHash);
          if (txReceipt && txReceipt.blockNumber) {
            //0-success 1-send 2-confirming -1-failed
            let transHistoryStatus = 0;
            let dealItemHash = confirmingItemHash.substring(0,8) + '...'
            console.log(dealItemHash)
            if (txReceipt.status == 1) {//success
              this.$notify({
                title: '',
                message: `<span><a style="margin-right: 30px;">${dealItemHash}</a>confirmed</span>`,
                position: 'bottom-right',
                type: 'success',
                dangerouslyUseHTMLString: true,
                onClick: this.goHistory
              });
              transHistoryStatus = 0
            } else {
              this.$notify.error({
                title: '',
                message: `<span><a style="margin-right: 30px;">${dealItemHash}</a>failed</span>`,
                position: 'bottom-right',
                type: 'success',
                dangerouslyUseHTMLString: true,
                onClick: this.goHistory
              });
              transHistoryStatus = -1
            }
            this.confirmedList.push({
              txid: this.confirmingList[i],
              block_num: txReceipt.blockNumber,
              status: transHistoryStatus,
            })
          }

        }
        return this.confirmedList
      },
      getDefaultNetWork() {
        const info = getInfoFromStorageByKey('netInfo')
        return info && info['id'] || 1
      },
      _handleNetworkChange({ chainInfo, from }) {
        if (from === 'exchange') { return }
        this.defaultNetWork = chainInfo.id
        console.log('network')
      },
      handleAccountChange() {
        this.currentAccount = getConnectedAddress()
        console.log('account')
      },
      goHistory() {
        this.$router.push({
          path: `/overview`,
          query: {tabActive: 1},
        })
      },
      transactionChange() {
        console.log('transchange')
        this.socketEvent('[]')
      },
    },
    async created () {
      this.defaultNetWork = this.getDefaultNetWork()
      console.log('create')
      this.connetSocket()
    },
    async mounted() {
      console.log('mounted')
      this.$eventBus.$on('networkChange', this._handleNetworkChange)
      this.$eventBus.$on('changeAccout', this.handleAccountChange)
      this.$eventBus.$on('addTransactionHistory', this.transactionChange)
    },
    beforeDestroy() {
      console.log('beforeDestroy')
      this.socket.disconnect()
    }
  }
</script>
<style lang="scss" scoped>
  
</style>
