<template>
  <div class="signManage-page">
    <v-navTitle title="Signer" :backIcon="true" :backEvent="backEvent"></v-navTitle >
    <div class="sign-manage-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <div class="signlist-wrapper" v-if="signList.length">
      <el-table
        :data="signList"
        border
        style="width: 100%"
        empty-text="no data">
          <el-table-column
            fixed
            prop="createdAt"
            label="Add Time">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name">
          </el-table-column>
          <el-table-column
            prop="address"
            label="Signer Address/ENS">
            <template slot-scope="scope">
              <span @click="copyAddress(scope.row.address)">{{scope.row.address}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="State"
            v-if="!isRecover">
            <template slot-scope="scope">
              <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-tag>To be confirmed</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['rejected']">
                <el-tag type="danger">Rejected</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['freeze']">
                <el-tag type="info">Freeze</el-tag>
              </div>
              <div v-else>
                <el-tag type="success">Active</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Operate"
            v-if="!isRecover">
              <template slot-scope="scope">
                <el-button @click="deleteSigner(scope.row)" type="text" size="small">Delete</el-button>
              </template>
          </el-table-column>
      </el-table>
      <div class="add-signer-box" v-if="!isRecover">
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" 
          v-if="!isHasFreeze"/>
      </div>
      <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
      <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup> -->
      <v-loadingPopup :show="showLoading" :showSpinner="false" />
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Loading, Dialog } from 'vant'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import LoadingPopup from '@/components/LoadingPopup';
import {  isLogin, getContractAt, getConnectedAddress, getEncryptKeyByAddressFromStore, addTransHistory } from '@/utils/dashBoardTools'
import { getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { signerStatus, securityModuleRouter } from '@/utils/global';
import { copyTxt } from '@/utils/index';
import InputPswModal from '@/components/InputPswModal'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import _ from 'lodash'

Vue.use(Toast);
Vue.use(Loading);
Vue.use(Dialog);

export default {
  name: 'signManage',
  props: ['id'],
  data() {
    return {
      signList: [],
      searchSignerList: [],
      signerStatus,

      signerPercent: 0,
      signerTotal: 0,
      
      userId: getFromStorage('gUID'),
      walletAddress: getFromStorage('currentWallet'),
      isHasFreeze: false,
      showLoading: false,
      isRecover: false,

      securityModuleRouter,
      securityModuleContract: null,

      currentOptType:'', // deleteSigner||addSigner
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
    "v-searchSignerModal": searchSignerModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
  },
  
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    backEvent() {
      removeFromStorage(['currentWallet'])
      this.$router.go(-1)
    },
    deleteSigner(row) {
      Dialog.confirm({
        message: 'Are you sure to delete this address?',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.confirmDeleteSigner(row)
      })
      .catch(() => {
        console.log('cancel')
      });
    },
    async dealDataDeleteSigner() {
      const row = this.currentRecord
      console.log(row)
      this.showLoading = true
      
      this.securityModuleContract.removeSigner(
        this.walletAddress, row.address).then(async tx=> {
         this.deleteSignerSubmit(row);
         addTransHistory(tx, 'Delete Signer', this)
         
         tx.wait().then(async res => {
          console.log('Delete Signer:', res)
          this.showLoading = false
        })
      }).catch(error => {
        this.submitFailed('Delete')
      })
      
    },
    async confirmDeleteSigner(row) {
      this.currentOptType = 'deleteSigner'
      this.currentRecord = _.cloneDeep(row)

      // check privateKey whether is existed
      if (!this.securityModuleContract) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataDeleteSigner()
    },
    async deleteSignerSubmit(row) {
      let deleteData = {
        userId: this.userId,
        walletId: this.$route.params.id,
        signerAddress: row.address,
      }
      const { hasError, list } = await this.$store.dispatch('deleteSigner', {...deleteData});
      if (hasError) {
        this.submitFailed('Delete')
      } else {
        this.submitSuccess('Delete')
      }
    },
    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async dealDataAddSigner() {
      const address = this.currentRecord
      this.showLoading = true
      this.securityModuleContract.addSigner(
        this.walletAddress, address).then(async tx=> {
         this.addSignerSubmit(address);
         addTransHistory(tx, 'Add Signer', this)
         
         tx.wait().then(async res => {
          console.log('Add Signer:', res)
          this.showLoading = false
        })
      }).catch(error => {
        console.log(error)
        this.submitFailed('Add')
      })
    },
    async confirmAddSigner(address) {
      this.currentOptType = 'addSigner'
      this.currentRecord = _.cloneDeep(address)
     if (!address) {
        Toast('Need Choose Signer')
        return
      }

      // check privateKey whether is existed
      if (!this.securityModuleContract) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataAddSigner()
    }, 
    async addSignerSubmit(address) {
      let addData = {
        userId: this.userId,
        walletId: this.$route.params.id,
        address: address.toLocaleLowerCase(),
        name: 'signer'
      }
      const { hasError, list } = await this.$store.dispatch('addSigner', {...addData});
      if (hasError) {
        this.submitFailed('Add')
      } else {
        this.submitSuccess('Add')
      }
    },
    submitFailed(type) {
      Toast.fail(`${type} Failed`)
      this.showLoading = false
    },
    submitSuccess(type) {
      this.showLoading = false
      Toast(`${type} success`)
      this.getSignerListByid()
    },
    async getSignerListByid() {
      let data = {
        userId: this.userId,
        walletId: this.$route.params.id
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      this.signList = list
      this.signerTotal = list.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
      // this.getIsFreeze(list)
    },
    async getIsFreeze(list) {//todo判断是否isHasFreeze
      
      for(let i=0; i<list.length;i+=1) {
        if (list[i].status == 1) {
          // let walletAddress = await this.securityModuleContract.isSigner('0x5EDF4660113d32bbB94D8ac1a5B815f4BfeB2863',list[i].address)
          // console.log(walletAddress)
        }
      }
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

      this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!this.securityModuleContract) {
        Toast('Failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false

      if (this.currentOptType === 'addSigner') {
        await this.dealDataAddSigner()
      }
      if (this.currentOptType === 'deleteSigner') {
        await this.dealDataDeleteSigner()
      }
      
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.isRecover = this.$route.query.isRecover
    this.getSignerListByid()

    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
