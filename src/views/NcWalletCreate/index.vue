<template>
  <div class="ncWalletCreate-page content-box">
    <v-navTitle title="Create NC-Wallet"></v-navTitle>
    <div class="create-wallet-container content-page">
      <p class="create-title">Non-custodial Wallet</p>
      <p class="create-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more guardians to make asset transactions more secure.</p>
      <p class="create-des" style="margin-top: 15px;">Quickly create a Non-custodial Wallet:</p>
      <div class="create-wallet-form">
        <el-form label-position="left">
          <el-form-item label="Set Wallet Name" label-width="130px">
            <el-input v-model="createWalletName"></el-input>
          </el-form-item>
          <el-form-item label="Set Signer">
            <el-table :data="createSignerList" border style="width: 100%" v-if="createSignerList.length">
                <el-table-column fixed prop="AddTime" label="Add Time"></el-table-column>
                <el-table-column fixed prop="Name" label="Name"></el-table-column>
                <el-table-column fixed prop="Name" label="Signer Address/ENS"></el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner" />
        <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
        <div class="create-btn-box">
          <a class="common-form-btn" @click="createSubmit">Create</a>
        </div>
        <v-statusPop
          :status="popStatus"
          :title="statusPopTitle"
          :timeTxt="timeTxt"
          tip=""
          :show="showStatusPop"
          @childEvent="changeVisible" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import StatusPop from '@/components/StatusPop';
import { getContractAt, getConnectedAddress } from '@/utils/dashBoardTools';
import ModuleRegistry from "./ModuleRegistry.json";
import SecurityModule from "./SecurityModule.json";
import WalletJson from "./Wallet.json";
import ProxyJson from "./Proxy.json";
import { BigNumber } from "bignumber.js";
import { getFromStorage } from '@/utils/storage';

Vue.use(Toast);

export default {
  name: 'NC-Wallet',
  data() {
    return {
      createWalletName: '',
      createSignerList: [],
      signerTotal: 0,
      signerPercent: 0,

      searchSignerList: [],

      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: 'Created Successfully!',
      timeTxt: '',
      userId: getFromStorage('gUID'),

      moduleRegistryRouter: '0x155Be32032f1603f043ef352BCBED8F3ca95643D',
      securityModuleRouter: '0x03D498afABE3a1F7649dF9a046b674f443E3fEe9',
      walletRouter: '0x32D9b4491a6742F73032DE7BBB35017176026aD3',
      proxyRouter: '0xB2EB9d96Edc2b0791a847136a8D984a5722edB88',
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
    'v-statusPop': StatusPop,
  },
  methods: {
    confirmSearchSigner() {
      console.log('confirm')
    },
    async createSubmit() {
      let lock_period = 5 //s
      let recovery_period = 120 //s
      const salts = [ethers.utils.formatBytes32String('1'), ethers.utils.formatBytes32String('2')]
      const moduleRegistryContract = await getContractAt({ tokenAddress: this.moduleRegistryRouter, abi: ModuleRegistry.abi }, this)
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const walletContract = await getContractAt({ tokenAddress: this.walletRouter, abi: WalletJson.abi }, this)
      
      let owner = getConnectedAddress()
      let user1 = '0x5b159B15D7c1Da93F42546Ac311BEe10dB2d50fA'
      let user2 = '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9'
      let signers = [user1, user2]
      signers.sort(function(a, b) { return a - b })
      user1 = signers[0]
      user2 = signers[1]
      // let priceVlaue = '0x59682f02'
      // console.log(BigNumber(priceVlaue).toString(10))
      let overrides = {
        gasLimit: 8000000,
        gasPrice: 20000000000,
      };

      const proxyContract = await getContractAt({ tokenAddress: this.proxyRouter, abi: ProxyJson.abi }, this)
      console.log(proxyContract)
      let walletAddress = await proxyContract.getAddress(salts[1]);
      console.log(walletAddress)
      

      expect(walletAddress).to.exist;
      console.log("proxy wallet", walletAddress)
      const tx = await proxyContract.create(salts[0]);
      const tswait = await tx.wait()
      console.log(tswait)

      wallet1 = Wallet__factory.connect(walletAddress, owner)
      console.log("wallet address", wallet1.address)
      let modules = [ securityModuleContract.address ]
      let encoder = ethers.utils.defaultAbiCoder
      let data = [encoder.encode(["address[]"], [[user1.address, user2.address]])]
      let initTx = await wallet1.initialize(modules, data);
      await initTx.wait()
    },
    changeVisible() {
      this.showStatusPop = false;
    },
    async getSignerList() {
      var searchData = {
        userId: this.userId,
        value: 'yanziyanzi115@gmail.com'
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      console.log(hasError)
      console.log(list)
    },
  },
  created() {
    this.getSignerList()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .el-form-item__label {
    font-weight: bold;
    font-size: 0.96rem;
  }
</style>