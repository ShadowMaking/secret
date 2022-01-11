<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%"
      empty-text="no data"
      >
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
          label="Operate">
            <template slot-scope="scope">
              <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-button @click="handleClick(scope.row, 'Agree')" type="text" size="small" class="sign-operate agree-btn">Agree</el-button>
                <el-button @click="handleClick(scope.row, 'Reject')" type="text" size="small" class="sign-operate ignore-btn">Reject</el-button>
              </div>
              <!-- <div v-if="scope.row.status == 2">
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div> -->
              <div v-if="scope.row.status == signerStatus['freeze']">
                <span style="color:red">frozen</span>
              </div>
              <div v-if="scope.row.status == signerStatus['startRecover']">
                <el-button @click="handleClick(scope.row, 'Recover')" type="text" size="small" class="sign-operate agree-btn">Confirm Recover</el-button>
                <el-button @click="handleClick(scope.row, 'Ignore')" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
                <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div>
              <div v-if="scope.row.status == signerStatus['agreeRecover']">
                <el-button @click="handleClick(scope.row, 'triggerRecover')" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
                <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div>
              <div v-if="scope.row.status == signerStatus['ignoreRecover'] || scope.row.status == signerStatus['active']" >
                <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div>
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
  </div>
</template>
<script>
import Vue from 'vue';
import { ethers } from 'ethers'
import { Toast, Loading, Popup, Dialog } from 'vant'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import {  getContractAt, getConnectedAddress, getContractWallet } from '@/utils/dashBoardTools'
import WalletJson from "@/assets/contractJSON/Wallet.json";
import { signerStatus, securityModuleRouter } from '@/utils/global';
import StatusPop from '@/components/StatusPop';
import ConfirmModal from '@/components/ConfirmModal';
import SignMessageModal from '@/components/SignMessageModal';
import LoadingPopup from '@/components/LoadingPopup';
import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'
import { copyTxt } from '@/utils/index';

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
      signAmount: 0,
      signRow: null,
      signMsg: '',

      popStatus: "success",
      statusPopTitle: 'Recover Successfully!',
      showStatusPop: false,

      showTradeConfirm: false,
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
      overrides: {
        gasLimit: 8000000,
        gasPrice: 5000000000,
      },

      showSignMessageModal: false,
      signMessageMetadata: null,
      signMsgHash: '',
    }
  },
  components: {
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-signMessageModal': SignMessageModal,
    'v-loadingPopup': LoadingPopup,
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
          this.openDialog('Are you sure to freeze?', this.signerStatus['freeze'])
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
          // let tx = await this.securityModuleContract.lock(this.signRow.wallet_address, this.overrides)
          // console.log(tx)
          // const txwait = await tx.wait()
          // console.log(txwait)
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
    async singerSignMessage(status) {
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
    async triggerRecover() {
      let currentWalletAddress = this.signRow.wallet_address
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      let replaceOwnerData = this.getNewOwnerInfo()

      let expireTime = Math.floor((new Date().getTime()) / 1000) + 600;
      let signatures = this.signMsg;
      
      let res = await this.securityModuleContract.multicall(
          this.signRow.wallet_address,
          [this.securityModuleRouter, this.signAmount, replaceOwnerData, sequenceId, expireTime],
          signatures,
          this.overrides
      );
      console.log(res)
      const triggerres = await res.wait()
      this.showLoading = false
      this.showStatusPop = true
      console.log(triggerres)
    },
    changeVisible() {
      this.showStatusPop = false;
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      console.log(info)
      return info && info['id'] || 1
    },
  },

  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    console.log(this.defaultNetWork)
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
    console.log(this.securityModuleContract)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
