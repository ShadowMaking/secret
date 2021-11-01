<template>
  <div class="recovery-backup-list">
    <h4>Secret Backed Up</h4>
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
          <div class="opt"><a @click="confirmRecoveryData(item)">recovery</a></div>
        </div>
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
import _ from 'lodash'

Vue.use(Icon);
Vue.use(Button);

export default {
  name: "BackupList",
  components: {
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
        this.backupList = (_.cloneDeep(list)||[]).filter(i=>i.name)
      }
    },
    async confirmRecoveryData(record) {
      const backupId = record.id
      await this.$store.dispatch('UpdateSelectedBackupForStorage', {backupId, type: 'store'});
      this.$emit('childEvent', {backupId});
    },
  },
  mounted() {
    this.getBackupList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>