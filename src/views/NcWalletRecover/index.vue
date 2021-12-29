<template>
  <div class="ncWalletRecover-page">
    <v-navTitle title="Recover NC-Wallet"></v-navTitle>
    <div class="recover-wallet-container">
      <p class="recover-des">You can restore the owner private key corresponding to the backed up wallet by signer confirmation</p>
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
                        <div v-if="scope.row.status == 1" class="confirm-icon">
                          <i class="el-icon-question"></i>
                        </div>
                        <div v-if="scope.row.status == 2" class="confirm-icon">
                          <i class="el-icon-error"></i>
                        </div>
                        <div v-if="scope.row.status == 3" class="confirm-icon">
                          <i class="el-icon-success"></i>
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
                <el-button type="primary" @click="nextStep">Confirm</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Step, Steps } from 'vant'
import navTitle from '@/components/NavTitle/index'
import { isLogin } from '@/utils/dashBoardTools';
import walletList from './walletList/index'
import { getFromStorage } from '@/utils/storage'

Vue.use(Toast);
Vue.use(Step);
Vue.use(Steps);


export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      activeStep: 0,//0-choose 1-signer confirm 2-complete
      walletShow: true,
      signerList: [
       {name: 'wallet1', address: 'oxdfdf', confirmed: 1},
       {name: 'wallet1', address: 'oxdfdf', confirmed: 2},
       {name: 'wallet1', address: 'oxdfdf', confirmed: 3}
      ],
      signerTotal: 0,
      signerPercent: 0,

      currentWalletAddress: '',
      currentWalletName: '',
      currentWalletId: '',
      userId: getFromStorage('gUID'),
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-walletList": walletList,
  },
  methods: {
    nextStep() {
      if (this.activeStep !== 2) {
        this.activeStep = this.activeStep + 1
      } else {
        this.activeStep = 0
        this.walletShow = true
      }
    },
    backStep() {
      if (this.activeStep == 0) {
        this.walletShow = true
        return
      }
      this.activeStep = this.activeStep - 1
    },
    recoverChild(value) {
      this.walletShow = false
      this.currentWalletAddress = value.wallet_address
      this.currentWalletName = value.name
      this.currentWalletId = value.wallet_id
      this.getSignerListByid()
    },
    async getSignerListByid() {
      let data = {
        userId: this.userId,
        walletId: this.currentWalletId
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      this.signerList = list
      this.signerTotal = list.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
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