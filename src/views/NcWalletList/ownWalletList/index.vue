<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      style="width: 100%"
      empty-text="no data"
      :header-cell-style="{background:'#eff1f8'}">
        <el-table-column
          fixed
          prop="createdAt"
          label="Create Time"
          :formatter="formatterTime">
        </el-table-column>
        <el-table-column
          prop="name"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="balance"
          label="Balance">
        </el-table-column>
        <el-table-column
          prop="wallet_address"
          label="Address">
          <template slot-scope="scope">
              <span @click="copyAddress(scope.row.wallet_address)">{{scope.row.wallet_address}}</span>
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
                <el-tag type="success">Active</el-tag>
              </div>
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
            </template>
        </el-table-column>
        <el-table-column
          label="Signer">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">Details</el-button>
            </template>
        </el-table-column>

        <el-table-column
          label="Operation">
            <template slot-scope="scope">
              <el-button @click="openSetting(scope.row)" type="text" size="small" class="sign-operate setting-btn">Setting</el-button>
            </template>
        </el-table-column>
    </el-table>
    <van-popup v-model="showSettingPopup" class="setting-modal-popUp flex flex-center flex-column" closeable>
      <div class="setting-wallet-popup">
        <div class="setting-wallet-list">
          <div class="setting-wallet-item">
            <div class="setting-title">Payment Limit</div>
            <div class="setting-item-contet">
              <div class="setting-item-left">
                <div class="setting-left-row" style="color: #c0c4cc">
                  <p>Max per day</p>
                  <p><input type="number" v-model="maxPerDay" disabled="true" style="cursor: not-allowed"><label>ETH</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Max per transaction</p>
                  <p><input type="number" v-model="maxPerTransaction"><label>ETH</label></p>
                </div>
              </div>
              <div class="setting-item-right">
                <el-button @click="settingSumbmit('paymentLimit')" size="small" class="limit-btn">Go</el-button>
              </div>
            </div>
          </div>
          <div class="setting-wallet-item">
            <div class="setting-title">Security Setting</div>
            <div class="setting-item-contet">
              <div class="setting-item-left">
                <div class="setting-left-row">
                  <p>Lock expiry</p>
                  <p><input type="number" v-model="lockExpiry"><label>H</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Recovery expiry</p>
                  <p><input type="number" v-model="recoveryExpiry"><label>H</label></p>
                </div>
              </div>
              <div class="setting-item-right">
                <el-button @click="settingSumbmit('securitySet')" size="small" class="limit-btn">Go</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup } from 'vant';
import { saveToStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { copyTxt, formatErrorContarct } from '@/utils/index';
import { walletStatus, securityModuleRouter, walletTransactionRouter } from '@/utils/global';
import { timeSericeFormat } from '@/utils/str';
import web3 from 'web3'
import LoadingPopup from '@/components/LoadingPopup';
import { BigNumber } from "bignumber.js";
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import TransactionModule from "@/assets/contractJSON/TransactionModule.json";
import { getContractAt, addTransHistory, getDecryptPrivateKeyFromStore, getConnectedAddress, getEncryptKeyByAddressFromStore, getSupportNet } from '@/utils/dashBoardTools'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import InputPswModal from '@/components/InputPswModal'



Vue.use(Toast)
Vue.use(Popup)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      walletStatus,
      securityModuleRouter,
      walletTransactionRouter,

      showSettingPopup: false,
      showLoading: false,

      maxPerDay: '15',
      maxPerTransaction: '10',

      lockExpiry: '48',
      recoveryExpiry: '48',

      settingWallet: '',
      settingType: 'paymentLimit',

      oldmaxPerDay: '15',
      oldmaxPerTransaction:'10',
      oldlockExpiry: '48',
      oldrecoveryExpiry: '48',
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
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
  },
  methods: {
    formatterTime(row) {
      return timeSericeFormat(row.createdAt)
    },
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    handleClick(row) {
      if (!getSupportNet()) {
        return
      }
      saveToStorage({ 'currentWallet': row.wallet_address });
      this.$router.push({
        path: `/signManage/${row.wallet_id}`,
      })
    },
    async openSetting(row) {
      if (!getSupportNet()) {
        return
      }
      this.settingWallet = row.wallet_address
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!securityModuleContract) {
        this.showSettingPopup = true
        return
      }
      securityModuleContract.getLockedSecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.lockExpiry = web3.utils.hexToNumber(res)/3600
        this.oldlockExpiry = this.lockExpiry
      }).catch(error => {
        console.log(error)
        Toast('Invalid wallet')
      })
      
      securityModuleContract.getLockedSecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.recoveryExpiry = web3.utils.hexToNumber(res)/3600
        this.oldrecoveryExpiry = this.recoveryExpiry
      }).catch(error => {
        console.log(error)
      })

      let transactionModuleContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: TransactionModule.abi }, this)
      if (!transactionModuleContract) {
        this.showSettingPopup = true
        return
      }
      transactionModuleContract.getDailyUpbound(this.settingWallet).then(res => {
        let dailyWei = web3.utils.toBN(res).toString()
        this.maxPerDay = web3.utils.fromWei(dailyWei, 'ether')
        this.oldmaxPerDay = this.maxPerDay
      }).catch(error => {
        console.log(error)
        Toast('Invalid wallet')
      })
      
      transactionModuleContract.getLargeAmountPayment(this.settingWallet).then(res => {
        let perTransWei =  web3.utils.toBN(res).toString()
        this.maxPerTransaction = web3.utils.fromWei(perTransWei, 'ether')
        this.oldmaxPerTransaction = this.maxPerTransaction
        this.showSettingPopup = true
      }).catch(error => {
        console.log(error)
      })
      
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
      if (this.settingType == 'paymentLimit') {
        await this.paymentLimitSubmit()
      } else if (this.settingType == 'securitySet') {
        await this.securitySetSubmit()
      }
    },
    async settingSumbmit(type) {
      this.settingType = type
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      if (this.settingType == 'paymentLimit') {
        await this.paymentLimitSubmit()
      } else if (this.settingType == 'securitySet') {
        await this.securitySetSubmit()
      }
    },
    async paymentLimitSubmit() {
      if (!this.maxPerDay || !this.maxPerTransaction) {
        Toast('Invalid Value')
        return
      }
      if (this.maxPerDay == this.oldmaxPerDay && this.maxPerTransaction == this.oldmaxPerTransaction) {
        Toast('must change at least one parametar')
        return
      }
      this.showLoading = true
      let transactionModuleContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: TransactionModule.abi }, this)
      console.log(transactionModuleContract)
      console.log(this.maxPerDay)
      let dailyWei = web3.utils.toWei(this.maxPerDay, 'ether')
      console.log(dailyWei)
      console.log(web3.utils.toHex(dailyWei))
      let perTransWei = web3.utils.toWei(this.maxPerTransaction, 'ether')
      console.log(perTransWei)
      transactionModuleContract.setTMParametar(this.settingWallet, web3.utils.toHex(dailyWei), web3.utils.toHex(perTransWei)).then(tx => {
        this.showLoading = false
        Toast('Submitted Success')
        console.log(tx)
        addTransHistory(tx, 'Payment Limit', this)
        tx.wait().then(async res=>{
          console.log(res)
        }).catch(error => {
          console.log(error)
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast(errorValue)
      })
    },
    async securitySetSubmit() {
      if (!this.lockExpiry || !this.recoveryExpiry) {
        Toast('Invalid Value')
        return
      }
      if (this.lockExpiry == this.oldlockExpiry && this.recoveryExpiry == this.oldrecoveryExpiry) {
        Toast('must change at least one parametar')
        return
      }
      this.showLoading = true
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      console.log(web3.utils.toHex(this.lockExpiry))
      securityModuleContract.setSecurityPeriod(this.settingWallet, web3.utils.toHex(this.lockExpiry * 3600), web3.utils.toHex(this.recoveryExpiry * 3600)).then(tx => {
        this.showLoading = false
        Toast('Submitted Success')
        console.log(tx)
        addTransHistory(tx, 'Security Setting', this)
        tx.wait().then(async res=>{
          console.log(res)
        }).catch(error => {
          console.log(error)
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        if(!errorValue) {errorValue = 'failed'}
        Toast(errorValue)
      })
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-table tr { background: #eff1f8;}
  ::v-deep .van-popup__close-icon--top-right {
    top: 6px;
  }
</style>
