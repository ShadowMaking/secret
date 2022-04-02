<template>
  <div class="ncWalletRecover-page">
    <v-navTitle title="Recover Multisig Wallet"></v-navTitle>
    <div class="recover-wallet-container">
      <p class="recover-des">Recover your wallet by multisig transaction first, and more than N/2 signers’ signature is needed, then the new owner executes the owner transfer.</p>
      <div class="recover-wallet-box">
        <div class="recover-steps">
          <van-steps :active="activeStep">
            <van-step>Choose</van-step>
            <van-step>Multi-sign</van-step>
            <van-step>Recover</van-step>
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
                  <div class="choose-refresh"><el-button type="success" @click="recoverRefresh">Refresh</el-button></div>
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
                  <div class="add-signer-tip" v-if="this.agreeRecoverNum >= this.signerPercent && !isInRecovery">{{agreeRecoverNum}} Signers have signed, please ask anyone of signers to trigger the recovery</div>
                  <div class="add-signer-tip" v-else>Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
                </div>
              </div>
              <div class="complete-box" v-show="activeStep==2"><!-- setp2 -->
                 <p class="choose-wallet-des">Congratulations, the private key has been successfully recovered!</p>
                 <div class="complete-success-icon">
                  <el-row>
                    <el-col>
                      <el-result icon="success" title="Submited Successfully">
                      </el-result>
                    </el-col>
                  </el-row>
                 </div>
              </div>
              <div class="choose-btn">
                <el-button type="info" @click="backStep" v-show="activeStep !==2">Back</el-button>
                <el-button type="primary" @click="nextStep" :disabled="!isInRecovery && activeStep == 1">{{confirmTxt}}</el-button>
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
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import { Toast, Step, Steps, Loading, Popup, Dialog } from 'vant'
import navTitle from '@/components/NavTitle/index'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import { isLogin, getContractAt, getConnectedAddress, getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, addTransHistory, getConnectedNet } from '@/utils/dashBoardTools';
import walletList from './walletList/index'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { signerStatus, securityModuleRouter, multOperation } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { CHAINMAP } from '@/utils/netWorkForToken';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { formatErrorContarct } from '@/utils/index'

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
      isInRecovery: false,

      confirmTxt: 'Confirm',
      securityModuleRouter,

      multOperation,

      showLoading: false,
      showTradeConfirm: false,
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,
      },
      currentChainInfo: null,
      sendMetadata: null,

      currentOptType: '', // executeRecover||recoverChild
      currentRecord: null,
      // ***************** inputPsw start ***************** //
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,
      // ***************** inputPsw end ***************** //
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-walletList": walletList,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
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
          let thisGasPrice = this.overrides.gasPrice.toString()
          let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
          this.sendMetadata = {
            from: getConnectedAddress(),
            to: this.securityModuleRouter,
            gas: this.overrides.gasLimit,
            gasPrice: gasPrice,
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
        this.updateSigner(item.address, signerStatus['startRecover'])
      })
      this.updateOwner()
    },
    async updateSigner(signerAddress, status) {
      let data = {
        walletId: this.currentWalletId,
        signerAddress: signerAddress,
        status: status,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      if (hasError) {
        console.log('Update Signer Failed')
      } else {
        this.addMultTx()
        console.log('Update Signer success')
      }
    },
    async updateOwner() {
      let data = {
        walletId: this.currentWalletId,
        ownerAddress: getConnectedAddress(),
        network_id: getConnectedNet().id,
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
    async addMultTx() {
      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.currentWalletAddress,
        to: this.securityModuleRouter,
        value: 0,
        network_id: this.currentChainInfo.id,
        data: '',
        operation: multOperation['Recovery']
      }
      const res = await this.$store.dispatch('addMultTx', submitData);
      if (res.hasError) {
        console.log('addMultTx Failed')
      } else {
        console.log('addMultTx success')
      }
    },
    async recoverRefresh() {
      this.getSignerListByid()
      const SecurityContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      let res = await SecurityContract.isInRecovery(this.currentWalletAddress);
      this.isInRecovery = res
      console.log("isInRecovery:" + res)
    },
    cancelRecover() {
      this.showTradeConfirm = false
      Toast('Cancel create')
    },
    confirmRecover({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.showLoading = true;
      this.executeRecover()
    },
    async dealDataBeforeExecuteRecover() {
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
      securityModuleContract.executeRecovery(this.currentWalletAddress, this.overrides).then(async tx=> {
          addTransHistory(tx, 'Execute Recover', this)
          this.showLoading = false;
          this.activeStep = this.activeStep + 1
          this.resetSignStatus()
         tx.wait().then(async res => {
          console.log('Execute Recover:', res)
          this.showLoading = false
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
      
    },
    resetSignStatus() {
      this.signerList.map(async item => {
        console.log(item)
        this.updateSigner(item.address, signerStatus['active'])
      })
    },
    async executeRecover() { //  gyy
      this.currentRecord = null
      this.currentOptType = 'executeRecover'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeExecuteRecover()
    },
    async dealDataBeforeRecoverChild() {
      const value = this.currentRecord

      this.walletShow = false
      this.currentWalletAddress = value.wallet_address
      this.currentWalletName = value.name
      this.currentWalletId = value.wallet_id
      this.getSignerListByid()

      const SecurityContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      let res = await SecurityContract.isInRecovery(this.currentWalletAddress);
      this.isInRecovery = res
      console.log("isInRecovery:" + res)
    },
    async recoverChild(value) { // gyy
      this.currentRecord = _.cloneDeep(value)
      this.currentOptType = 'recoverChild'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeRecoverChild()
    },
    async getSignerListByid() {
      let data = {
        network_id: getConnectedNet().id,
        walletId: this.currentWalletId
      }
      this.isStartRecover = false
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
          console.log(item.status == this.signerStatus['active'])
          return item.status == this.signerStatus['active']
        } else {
          (item.status == this.signerStatus['agreeRecover']) && (this.agreeRecoverNum = this.agreeRecoverNum + 1)
          return (item.status == this.signerStatus['startRecover'] || item.status == this.signerStatus['agreeRecover'] || item.status == this.signerStatus['ignoreRecover'] || item.status == this.signerStatus['freezeRecover'])
        }
      });
      console.log(this.agreeRecoverNum)
      // let newList = list
      console.log(newList)
      this.signerList = newList
      this.signerTotal = newList.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
    },
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError) {
        Toast('Get PublickKey Failed! Retry')
        this.confirmPswBtnLoading = false
        return
      }
      this.publicKey = publicKey;
      // console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      // console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      // console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

      // to decrypt privatekey
      const userId = getInfoFromStorageByKey('gUID')
      const address = getConnectedAddress()
      const encryptKey = await getEncryptKeyByAddressFromStore(address, this)
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
      if(decryptInfo.hasError) {
        Toast('DecryptPrivateKeyByEcies failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }
      const decryptedPrivateKey = decryptInfo.data
      const privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
      privateKey && (await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey, privateKey }))

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false

      if (this.currentOptType === 'executeRecover') {
        await this.dealDataBeforeExecuteRecover()
      }
      if (this.currentOptType === 'recoverChild') {
        await this.dealDataBeforeRecoverChild()
      }
      
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
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
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
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