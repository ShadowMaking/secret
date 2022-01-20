<template>
  <div class="recovery-backup-list">
    <!-- <h4>Recover Secret</h4> -->
    <span class="tip">Click the secret that has been backed up to recover</span>
    <div class="backup-list-wrapper">
      <!-- table-header -->
      <div class="header">
        <ul class="table-header">
          <li
            v-for="(item, index) in tableHeader"
            :key="index"
            :class="item.className">
            {{ item.lable }}
          </li>
        </ul>
      </div>
      <!-- table body -->
      <div class="body">
        <div class="list-item" v-for="(item, index) in backupList" :key="index">
          <div class="ID">{{ item.id }}</div>
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ item.desc }}</div>
          <div class="opt">
            <a @click="confirmRecoveryData(item)" v-if="item.sended">recovery</a>
            <a @click="sendEmail(item)" v-else style="color: #f44336">backup</a>
          </div>
        </div>
      </div>
      <div class="no-data-container" v-if="!backupList || backupList && backupList.length==0">
        <v-none />
      </div>
    </div>
    <!-- <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirmRecoveryData">Confirm</van-button>
    </div> -->
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Button } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import None from '@/components/None/index'
import _ from 'lodash'

Vue.use(Icon);
Vue.use(Button);

export default {
  name: "BackupList",
  components: {
    'v-none': None,
  },
  data() {
    return {
      tableHeader: [
        // {id: 0, lable: '', className: 'radio',},
        {id: 1, lable: 'ID', className: 'ID',},
        {d: 2, lable: 'Name', className: 'name',},
        {id: 3, lable: 'Description', className: 'desc',},
        {id: 4, lable: 'Operate', className: 'opt',},
        ],
      backupList: []
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
  },
  methods: {
    async getBackupList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetRecoveryData', {userId});
      if (!hasError) {
        const datalist = (_.cloneDeep(list)||[]).filter(i=>i.name)
        const curretSeetingData = await this.$store.dispatch('UpdateBackupSettingDataForStorage', { updateType: 'get' });
        let backupIDForNotSendEmail
        curretSeetingData && (backupIDForNotSendEmail = curretSeetingData.id)
        datalist.forEach((item, index, arr) => {
          item['sended'] = true
          if (item.id === backupIDForNotSendEmail) {
            item['sended'] = false
          }
        })
        this.backupList = datalist
      }
    },
    async confirmRecoveryData(record) {
      const backupId = record.id
      await this.$store.dispatch('UpdateSelectedBackupForStorage', {backupId, type: 'store'});
      this.$emit('childEvent', {backupId});
    },
    sendEmail(record) {
      const mnemonic = getFromStorage('mnemonic')
      const privateKey = getFromStorage('privateKey')
      let type
      mnemonic && !privateKey && (type = 'mn')
      privateKey && !mnemonic && (type = 'pk')
      if (type) {
        this.$router.push({ name: 'ssendemail', query: {type} })
      } else {
        this.$router.push({ name: 'ssendemail'})
      }
    }
  },
  mounted() {
    this.getBackupList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>