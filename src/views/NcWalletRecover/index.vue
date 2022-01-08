<template>
  <div class="ncWalletRecover-page">
    <v-navTitle title="Recover Multisig Wallet"></v-navTitle>
    <div class="recover-wallet-container">
      <p class="recover-des">Recover your wallet by multisig transaction first, and more than N/2 signers’ signature is needed, then the new owner executes the owner transfer.</p>
      <div class="recover-wallet-box">
        <div class="recover-steps">
          <van-steps :active="activeStep">
            <van-step>Choose</van-step>
            <van-step>Signer Confirm</van-step>
            <van-step>Complete</van-step>
          </van-steps>
        </div>
        <div class="recover-content-box">
          <v-walletList v-show="walletShow" @recoverChild="recoverChild"></v-walletList>
          <div class="choose-wallet-container" v-show="!walletShow">
            <div class="choose-wallet" v-show="activeStep==0"><!-- setp0 -->
              <div v-show="signerTotal !== 0">
                <p class="choose-wallet-des">The private key corresponding to the following address will be recovered</p>
                <div class="choose-wallt-info">
                  <div class="choose-wallet-item">
                    <p class="choose-wallet-item-name">Name</p>
                    <p><span class="choose-wallet-item-con">{{currentWalletName}}</span></p>
                  </div>
                  <div class="choose-wallet-item">
                    <p class="choose-wallet-item-name">Address</p>
                    <span class="choose-wallet-item-con">{{currentWalletAddress}}</span>
                  </div>
                </div>
              </div>
              <div class="wallet-no-signer" v-show="signerTotal == 0">no active signer</div>
            </div>
            <div class="sign-complete-box">
              <div class="signer-confirm" v-show="activeStep==1"><!-- setp1 -->
                <p class="choose-wallet-des">Please ask at other {{signerTotal}} signers below to confirm:</p>
                <div class="choose-wallet-table">
                  <div class="choose-refresh"><el-button type="success" @click="getSignerListByid">Refresh</el-button></div>
                  <el-table
                    :data="signerList"
                    empty-text="no data"
                    header-align="center">
                    <el-table-column
                      prop="name"
                      label="Name"
                      align="center"
                     >
                    </el-table-column>
                    <el-table-column
                      prop="address"
                      label="Signer Address/ENS"
                      align="center"
                      >
                    </el-table-column>
                    <el-table-column
                      prop="status"
                      label="confirmed"
                      align="center">
                      <template slot-scope="scope">
                        <div v-if="scope.row.status == signerStatus['active']" class="confirm-icon">
                          <i class="el-icon-question"></i>
                        </div>
                        <div v-if="scope.row.status == signerStatus['startRecover']" class="confirm-icon">
                          <i class="el-icon-question"></i>
                        </div>
                        <div v-if="scope.row.status == signerStatus['ignoreRecover']" class="confirm-icon">
                          <i class="el-icon-error"></i>
                        </div>
                        <div v-if="scope.row.status == signerStatus['agreeRecover']" class="confirm-icon">
                          <i class="el-icon-success"></i>
                        </div>
                        <div v-if="scope.row.status == signerStatus['freezeRecover']" class="confirm-icon">
                          <i class="el-icon-error"></i>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
                </div>
              </div>
              <div class="complete-box" v-show="activeStep==2"><!-- setp2 -->
                 <p class="choose-wallet-des">Congratulations, the private key has been successfully recovered!</p>
                 <div class="complete-success-icon">
                  <el-row>
                    <el-col>
                      <el-result icon="success" title="success">
                      </el-result>
                    </el-col>
                  </el-row>
                 </div>
              </div>
              <div class="choose-btn">
                <el-button type="info" @click="backStep" v-show="activeStep !==2">Back</el-button>
                <el-button type="primary" @click="nextStep">{{confirmTxt}}</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-confirmModal
      :show="showTradeConfirm"
      type="Create Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelRecover"
      @confirm="confirmRecover" />
    <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <van-loading type="spinner" />
      </div>
    </van-popup> -->
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
  </div>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import { Toast, Step, Steps, Loading, Popup, Dialog } from 'vant'
import navTitle from '@/components/NavTitle/index'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import { isLogin, getContractAt, getConnectedAddress } from '@/utils/dashBoardTools';
import walletList from './walletList/index'
import { getFromStorage } from '@/utils/storage'
import { signerStatus, securityModuleRouter } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'

Vue.use(Toast);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Loading);
Vue.use(Popup);
Vue.use(Dialog);

export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      signerStatus,
      activeStep: 0,//0-choose 1-signer confirm 2-complete
      walletShow: true,
      signerList: [],
      signerTotal: 0,
      signerPercent: 0,

      currentWalletAddress: '',
      currentWalletName: '',
      currentWalletId: '',
      userId: getFromStorage('gUID'),
      agreeRecoverNum: 0,
      isStartRecover: false,

      confirmTxt: 'Confirm',
      securityModuleRouter,

      showLoading: false,
      showTradeConfirm: false,
      overrides: {
        gasLimit: 8000000,
        gasPrice: 5000000000,
      },
      currentChainInfo: null,
      sendMetadata: null,
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-walletList": walletList,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
  },
  methods: {
    nextStep() {
      this.confirmTxt = 'Confirm'
      if (this.activeStep == 0) {
        if (this.signerList.length == 0) { 
          this.walletShow = true 
          return
        }
        Dialog.confirm({
          message: 'Are you sure to recover this wallet?',
          confirmButtonText: 'Confirm',
          confirmButtonColor: '#4375f1',
          cancelButtonText: 'Cancel'
        })
        .then(() => {
          this.startRecover() //trigger need multicall
        })
        .catch(() => {
          console.log('cancel')
        });
      } else if (this.activeStep == 1) {
        if (this.agreeRecoverNum >= this.signerPercent) {
          this.sendMetadata = {
            from: getConnectedAddress(),
            to: this.securityModuleRouter,
            gas: this.overrides.gasLimit,
            gasPrice: this.overrides.gasPrice,
            value: 0,
            symbolName: 'ETH',
            netInfo: this.currentChainInfo,
            DATA: '',
            estimatedGasFee: '0' // todo
          }
          this.showTradeConfirm = true
        } else {
          Toast(`Any transaction requires the confirmation of: ${this.signerPercent} signers`)
        }
        
        // this.executeRecover() //need not multicall
      } else if (this.activeStep == 2) {
        this.activeStep = 0
        this.walletShow = true
      }
    },
    backStep() {
      this.walletShow = true
      this.activeStep == 0
      // this.confirmTxt = 'Confirm'
      // if (this.activeStep == 0) {
      //   this.walletShow = true
      //   return
      // }
      // this.activeStep = this.activeStep - 1
    },
    startRecover() {
      this.signerList.map(async item => {//waiting for signer agree
        console.log(item)
        let data = {
          userId: this.userId,
          walletId: this.currentWalletId,
          signerAddress: item.address,
          status: signerStatus['startRecover'],
        }
        const { hasError } = await this.$store.dispatch('updateSigner', {...data});
        if (hasError) {
          Toast('Update Signer Failed')
        } else {
          console.log('Update Signer success')
        }
      })
      this.updateOwner()
    },
    async updateOwner() {
      let data = {
        userId: this.userId,
        walletId: this.currentWalletId,
        ownerAddress: getConnectedAddress(),
      }
      const { hasError } = await this.$store.dispatch('updateOwnerAddress', {...data});
      if (hasError) {
        Toast('Update Owner Failed')
      } else {
        console.log('Update Owner success')
        this.activeStep = this.activeStep + 1
        this.confirmTxt = 'Execute'
      }
    },
    cancelRecover() {
      this.showTradeConfirm = false
      Toast('Cancel create')
    },
    confirmRecover() {
      this.showLoading = true;
      this.executeRecover()
    },
    async executeRecover() {
      console.log('start excute')
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      let amount = 0
      const SMABI = [
          "function executeRecovery(address)",
          "function cancelRecovery(address)",
          "function triggerRecovery(address, address)"
      ]
      // let newOwnAddress = getConnectedAddress()
      // let newOwnAddress = '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9'
      // let iface = new ethers.utils.Interface(SMABI)
      // let replaceOwnerData = iface.encodeFunctionData("triggerRecovery", [this.currentWalletAddress, newOwnAddress])

      // console.log(replaceOwnerData)
      console.log(securityModuleContract)
      let isInRecovery = await securityModuleContract.isInRecovery(this.currentWalletAddress)
      console.log(isInRecovery)
      let tx = await securityModuleContract.executeRecovery(this.currentWalletAddress, this.overrides)
      console.log(tx)
      let txwait = await tx.wait()
      console.log(txwait)
      this.showLoading = false;
      this.activeStep = this.activeStep + 1
    },
    async recoverChild(value) {
      this.walletShow = false
      this.currentWalletAddress = value.wallet_address
      this.currentWalletName = value.name
      this.currentWalletId = value.wallet_id
      this.getSignerListByid()

      const walletContract = await getContractAt({ tokenAddress: this.currentWalletAddress, abi: WalletJson.abi }, this)
      let res1 = await walletContract.owner();
      console.log("newowner:" + res1)
    },
    async getSignerListByid() {
      let data = {
        userId: this.userId,
        walletId: this.currentWalletId
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      for (var i=0; i<list.length; i++) {
        if (list[i].status >= 5) {
          this.isStartRecover = true
          this.activeStep = 1
        }
      }
      console.log(this.isStartRecover)
      let newList = list.filter((item, index)=>{
        if (!this.isStartRecover) {
          return item.status == this.signerStatus['active']
        } else {
          item.status == this.signerStatus['agreeRecover'] && (this.agreeRecoverNum = this.agreeRecoverNum + 1)
          return (item.status == this.signerStatus['startRecover'] || item.status == this.signerStatus['agreeRecover'] || item.status == this.signerStatus['ignoreRecover'] || item.status == this.signerStatus['freezeRecover'])
        }
      });
      // let newList = list
      this.signerList = newList
      this.signerTotal = newList.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .el-button {
    padding: 0.6rem 1.2rem;
  }
  ::v-deep .el-result__icon svg {
    width: 60px;
    height: 60px;
  }
</style>