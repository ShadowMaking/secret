<template>
  <div class="datalist-wrapper" v-if="walletListAsSigner.length">
    <el-table
      :data="walletListAsSigner"
      style="width: 100%"
      empty-text="no data"
      :header-cell-style="{background:'#eff1f8'}" >
        <el-table-column
          fixed
          prop="createdAt"
          label="Add Time">
        </el-table-column>
        <el-table-column
          prop="name"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="wallet_address"
          label="Wallet Address">
          <template slot-scope="scope">
              <span @click="copyAddress(scope.row.wallet_address)">{{scope.row.wallet_address}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner_address"
          label="Owner Address ">
          <template slot-scope="scope">
              <span @click="copyAddress(scope.row.owner_address)">{{scope.row.owner_address}}</span>
          </template>
        </el-table-column>
        <el-table-column
            prop="status"
            label="State"
            >
            <template slot-scope="scope">
              <div v-if="scope.row.wallet_status == walletStatus['Creating']">
                <el-tag>Creating</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Active']">
                <el-tag v-if="scope.row.isInRecovery">Recovering</el-tag>
                <el-tag type="info" v-else-if="scope.row.isLocked">Frozen</el-tag>
                <el-tag type="success" v-else>Active</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Fail']">
                <el-tag type="danger">Fail</el-tag>
              </div>
              <!-- old data -->
              <div v-else-if="scope.row.wallet_status == walletStatus['Freezing']">
                <el-tag>Freezing</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Frozen']">
                <el-tag type="info">Frozen</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Recovering']">
                <el-tag>Recovering</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Unlocking']">
                <el-tag>Unlocking</el-tag>
              </div>

            </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="Operate">
            <template slot-scope="scope">
              <div v-if="scope.row.wallet_status == walletStatus['Creating']">
                <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Active']">
                <div v-if="scope.row.isLocked">
                  <el-button @click="handleClick(scope.row, 'Unlock')" type="text" size="small" class="sign-operate agree-btn">Unlock</el-button>
                </div>
                <div v-else>
                  <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
                </div>
                <div v-if="!scope.row.isInRecovery">
                  <div v-if="scope.row.status == signerStatus['startRecover']">
                    <el-button @click="handleClick(scope.row, 'Recover')" type="text" size="small" class="sign-operate agree-btn">Confirm Recover</el-button>
                    <el-button @click="handleClick(scope.row, 'Ignore')" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
                  </div>
                  <div v-if="scope.row.status == signerStatus['agreeRecover']">
                    <el-button @click="handleClick(scope.row, 'triggerRecover')" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
                  </div>
                </div>
              </div>
                <!-- old data -->
              <div v-else-if="scope.row.wallet_status == walletStatus['Fail']">
                <el-tag type="danger">Fail</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Freezing']">
                <el-tag>Freezing</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Frozen']">
                <el-tag type="info">Frozen</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Recovering']">
                <el-tag>Recovering</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Unlocking']">
                <el-tag>Unlocking</el-tag>
              </div>

              

              <!-- <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-button @click="handleClick(scope.row, 'Agree')" type="text" size="small" class="sign-operate agree-btn">Agree</el-button>
                <el-button @click="handleClick(scope.row, 'Reject')" type="text" size="small" class="sign-operate ignore-btn">Reject</el-button>
              </div>
              <div v-if="scope.row.status == signerStatus['freeze']">
                <el-button @click="handleClick(scope.row, 'Unlock')" type="text" size="small" class="sign-operate agree-btn">Unlock</el-button>
              </div> -->
            </template>
        </el-table-column>
    </el-table>
    <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <van-loading type="spinner" />
      </div>
    </van-popup> -->
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-statusPop
          :status="popStatus"
          :title="statusPopTitle"
          timeTxt=""
          tip=""
          :show="showStatusPop"
          @childEvent="changeVisible" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="Recover Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelCreate"
      @confirm="confirmCreate" />
    <v-signMessageModal
      :show="showSignMessageModal"
      :metadata="signMessageMetadata"
      @close="showSignMessageModal=false"
      @reject="cancelSignMessage"
      @confirm="confirmSignMessage" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { ethers } from 'ethers'
import { Toast, Loading, Popup, Dialog } from 'vant'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { getContractAt, getConnectedAddress, getContractWallet, getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, addTransHistory } from '@/utils/dashBoardTools'
import WalletJson from "@/assets/contractJSON/Wallet.json";
import { signerStatus, securityModuleRouter, walletStatus } from '@/utils/global';
import StatusPop from '@/components/StatusPop';
import ConfirmModal from '@/components/ConfirmModal';
import SignMessageModal from '@/components/SignMessageModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'
import { copyTxt, formatErrorContarct } from '@/utils/index';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

Vue.use(Toast);
Vue.use(Loading);
Vue.use(Popup);
Vue.use(Dialog);

export default {
  name: 'signWalletList',
  props: ['dataList'],
  data() {
    return {
      userId: getFromStorage('gUID'),
      showLoading: false,

      securityModuleRouter,
      securityModuleContract: null,
      
      signerStatus,
      walletStatus,
      signAmount: 0,
      signRow: null,
      signMsg: '',

      popStatus: "success",
      statusPopTitle: 'Submited Successfully!',
      showStatusPop: false,

      showTradeConfirm: false,
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
      overrides: {
        gasLimit: 8000000,
        gasPrice: 80000000000,
      },

      showSignMessageModal: false,
      signMessageMetadata: null,
      signMsgHash: '',

      walletListAsSigner: [],

      currentOptType:'', // singerSignMessage||triggerRecover
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
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-signMessageModal': SignMessageModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    handleClick(row, type) {
      this.signRow = row;
      switch(type) {
        case 'Agree':
          this.openDialog('Are you sure to agree?', this.signerStatus['active'])
          break;
        case 'Reject':
          this.openDialog('Are you sure to reject?', this.signerStatus['rejected'])
          break;
        case 'Freeze':
          this.openDialog('Are you sure to freeze?', this.signerStatus['freeze'], true)
          break;
        case 'Recover':
          this.openDialog('Are you sure to Recover?', this.signerStatus['agreeRecover'], true)
          break;
        case 'Ignore':
          this.openDialog('Are you sure to Ignore Recover?', this.signerStatus['ignoreRecover'])
          break;
        case 'triggerRecover':
          this.openDialog('Are you sure to Trigger Recover?', this.signerStatus['triggerRecover'], true)
          break;
        case 'Unlock':
          this.openDialog('Are you sure to Unlock?', 'Unlock', true)
          break;
        default:
          break;
      }
    },
    openDialog(title, status, isContaract) {
      Dialog.confirm({
        message: title,
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.showLoading = true;
        this.dialogConfirm(status, isContaract)
      })
      .catch((error) => {
        this.showLoading = false;
        console.log(error)
      });
    },
    async dialogConfirm(status, isContaract) {
      if (isContaract) {
        if (status == this.signerStatus['agreeRecover']) {
          this.singerSignMessage(status)
        } else if (status == this.signerStatus['triggerRecover']) {
          this.getSignMessage()
        } else if (status == this.signerStatus['freeze']) {
          this.freezeWallet()
        } else if(status == 'Unlock') {
          this.unlockWallet()
        }
      } else {
        this.updateSignerStatus(status, true)
      }
      
    },
    async updateSignerStatus(status, isToast) {
      let data = {
        userId: this.userId,
        walletId: this.signRow.wallet_id,
        signerAddress: this.signRow.address,
        status: status,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      this.showLoading = false;
      if (hasError) {
        isToast && Toast.fail('Update Failed')
      } else {
        if (isToast) {
          Toast('Update success')
          this.$emit('signChild');
        }
      }
    },
    freezeWallet() {
      this.securityModuleContract.lock(
          this.signRow.wallet_address,
          this.overrides
        ).then(async tx=> {
          this.changeWalletSuccess(tx, 'Freezing', 'Freeze')
          tx.wait().then(async res => {
            console.log('Freeze:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
    },
    unlockWallet() {
      this.securityModuleContract.unlock(
          this.signRow.wallet_address,
          this.overrides
        ).then(async tx=> {
          this.changeWalletSuccess(tx, 'Unlocking', 'Unlock')
          tx.wait().then(async res => {
            console.log('Unlock:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
    },
    changeWalletSuccess(res, status, operateType, isToast) {
      this.showLoading = false
      console.log(isToast)
      !isToast && Toast(`${operateType} Submit Success`)
      // this.updateWalletStatusSubmit(this.walletStatus[status], res.hash)
      addTransHistory(res, operateType, this)
    },
    async updateWalletStatusSubmit(status, txhash) {
      console.log(status)
      let data = {
        userId: this.userId,
        walletId: this.signRow.wallet_id,
        status: status,
        txid: txhash,
      }
      const { hasError } = await this.$store.dispatch('updateWalletStatus', {...data});
      console.log(hasError)
    },
    cancelSignMessage() {
      this.showSignMessageModal = false
      Toast('Cancel Sign Message')
    },
    async confirmSignMessage() {
      this.showLoading = true
      const currentSignerWallet = await getContractWallet(this)
      let sig = await currentSignerWallet.signMessage(ethers.utils.arrayify(this.signMsgHash));
      this.signMessageSubmit(sig)
      console.log(sig)
    },
    async dealDataBeforeSingerSignMessage() {
      let currentWalletAddress = this.signRow.wallet_address
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      let replaceOwnerData = this.getNewOwnerInfo()
      const input = `0x${[
        "0x19",
        "0x00",
        this.securityModuleRouter,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(this.signAmount), 32),
        replaceOwnerData,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(sequenceId), 32),
      ].map((hex) => hex.slice(2)).join("")}`;
      let hash = ethers.utils.keccak256(input)
      this.signMsgHash = hash
      this.signMessageMetadata = {
        userAddress: getConnectedAddress(),
        signMessage: hash,
        netInfo: this.currentChainInfo,
      }
      this.showSignMessageModal = true
      this.showLoading = false
    },
    async singerSignMessage(status) {
      this.currentOptType = 'singerSignMessage'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeSingerSignMessage()
    },
    async signMessageSubmit(msg) {
      let data = {
        userId: this.userId,
        walletId: this.signRow.wallet_id,
        signerAddress: this.signRow.address,//0x4339ec4c9b7f68a5ffaa9628c6625a02cea26cd0
        signMessage: msg,//0x53457c545dce7a83aa9f5e10cba31f31b51227a40f45d88f91186266efc9593c3eba3f11220e21f9ac11e8e955ecd9d3e40b73a444b82cf394c2e5a080cb96121b
        status: this.signerStatus['agreeRecover']
      }
      const { hasError, totalSignMessage } = await this.$store.dispatch('uploadSignmessage', {...data});
      console.log(totalSignMessage)
      this.showLoading = false;
      if (hasError) {
        Toast.fail('Recover Failed')
      } else {
        this.$emit('signChild')
        if (totalSignMessage) {
          Dialog.confirm({
            message: 'Half of the signers have signed,Trigger recovery now?',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#4375f1',
            cancelButtonText: 'Cancel'
          })
          .then(() => {
            this.signMsg = totalSignMessage
            this.showRecocerModal()
          })
          .catch((error) => {
            console.log(error)
          });
        } else {
          Toast('Recover success')
        }
      }
    },
    async getSignMessage() {
      let dataParams = {
        userId: this.userId,
        walletId: this.signRow.wallet_id,
        signerAddress: this.signRow.address,
      }
      const { hasError, data } = await this.$store.dispatch('getSignMessage', {...dataParams});
      this.showLoading = false
      if (data) {
        this.signMsg = data
        this.showRecocerModal()
      } else {
        Toast(`Any transaction requires the confirmation of half signers`)
      }
    },
    getNewOwnerInfo() {
      let currentWalletAddress = this.signRow.wallet_address
      let newOwnAddress = this.signRow.owner_address
      const SMABI = [
          "function executeRecovery(address)",
          "function cancelRecovery(address)",
          "function triggerRecovery(address, address)"
      ]
      let iface = new ethers.utils.Interface(SMABI)
      let replaceOwnerData = iface.encodeFunctionData("triggerRecovery", [currentWalletAddress, newOwnAddress])
      return replaceOwnerData
    },
    showRecocerModal() {
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
    },
    cancelCreate() {
      this.showTradeConfirm = false
      Toast('Cancel create')
    },
    confirmCreate() {
      this.showLoading = true
      this.triggerRecover()
    },
    async dealDataBeforeTriggerRecover() {
      let currentWalletAddress = this.signRow.wallet_address
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      let replaceOwnerData = this.getNewOwnerInfo()

      let expireTime = Math.floor((new Date().getTime()) / 1000) + 600;
      let signatures = this.signMsg;
      
      this.securityModuleContract.multicall(
          this.signRow.wallet_address,
          [this.securityModuleRouter, this.signAmount, replaceOwnerData, sequenceId, expireTime],
          signatures,
          this.overrides
        ).then(async tx=> {
          console.log(tx)
          this.showStatusPop = true
          this.changeWalletSuccess(tx, 'Recovering', 'Trigger Recover', true)
        
          tx.wait().then(async res => {
            console.log('Trigger Recover:', res)
          })
      }).catch(error => {
        this.showLoading = false
        console.log(error)
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
    },
    async triggerRecover() {
      this.currentOptType = 'triggerRecover'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeTriggerRecover()
    },
    changeVisible() {
      this.showStatusPop = false;
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      console.log(info)
      return info && info['id'] || 1
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
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

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

      if (this.currentOptType === 'singerSignMessage') {
        await this.dealDataBeforeSingerSignMessage()
      }
      if (this.currentOptType === 'triggerRecover') {
        await this.dealDataBeforeTriggerRecover()
      }
      
    },
    async dealDataList() {
      let dataSource = this.dataList
      for(var i=0; i<dataSource.length; i++) {
        console.log(dataSource[i])
        let isLocked = await this.securityModuleContract.isLocked(dataSource[i].wallet_address)
        dataSource[i].isLocked = isLocked ? isLocked : false
        let isInRecovery = await this.securityModuleContract.isInRecovery(dataSource[i].wallet_address)
        dataSource[i].isInRecovery = isInRecovery ? isInRecovery : false
      }
      this.walletListAsSigner = dataSource
      console.log(dataSource)
    }
  },

  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    this.walletListAsSigner = this.dataList
    console.log(this.defaultNetWork)
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

    this.dealDataList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-button+.el-button {
    margin-left: 5px
  }
  .el-button{
    margin-left: 5px;
    margin-right: 5px;
  }
  .el-tag {
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 10px;
  }
</style>
