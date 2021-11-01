<template>
  <div class="social-recovery-enter-secretkey-page">
    <div>
      <div v-if="friendsList.length" class="friend-list" >
        <div v-for="(item, index) in friendsList" :key="index" class="friend-item van-hairline--bottom">
          <div class="account-info">
            <span class="portraitImg"></span>
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <span class="address">{{ item.email }}</span>
            </div>
          </div>
          <van-field
            rows="2"
            type="textarea"
            class="split-input"
            :value="friendsInputValsMap[`${[item.id]}-inputVal`]"
            placeholder="Please enter the secret share"
            @input="(val)=>{changeInputVal(val, item)}" />
        </div>
      </div>
      <div class="no-friends" v-else>
        <van-icon name="closed-eye" color="#eee" size="40"/>
        <span>您之前没有向好友发过邮件进行备份</span>
        <div>
          <van-button
            icon="plus"
            plain
            color="#495ABE"
            size="small"
            class="add-button"
            style="display:none"
            @click="toPage('backup')">创建secret</van-button>
          <van-button
            icon=""
            plain
            color="#495ABE"
            size="small"
            class="add-button"
            @click="toPage('ssendemail')"><van-icon name="comment-o" ></van-icon>备份secret</van-button>
        </div>
      </div>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" class="mb10" @click="confirmSecretKey" :disabled="friendsList.length===0">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Field, Toast } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
import _ from 'lodash'
import { SecLevelEnum, generate_mnemonic, generate_key, split, combine } from '@/utils/secretshare'

Vue.use(Icon);
Vue.use(Field);
Vue.use(Toast);

export default {
  name: "EnterSecretKey",
  components: {
  },
  data() {
    return {
      friendsList: [],
      friendsInputValsMap: null, // { '1-inputVal': '' '2-inputVal': '', ...}
      recoveryNumber: 1,
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
    generateFriendsList(list) {
      return list.map(item=>{
        return {
          id: item['user_id'],
          name: item['name'],
          email: item['email']
        }
      })
    },
    generateFriendsInputValsMap(list) {
      const objMap = {}
      list.map(i=>{
        objMap[`${i.user_id}-inputVal`] = ''
      })
      return objMap
    },
    async getSendEmialFriendsList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const backupId = getFromStorage('backupId')
      const { hasError, list, error, recoveryNumber } = await this.$store.dispatch('GetRecoveryData', {userId});
      if (!hasError && backupId) {
        const targetBackup = _.find(list, {id: ~~backupId})
        const guradianFriends = targetBackup && targetBackup['friends'] && window.JSON.parse(targetBackup.friends) || []

        this.friendsList = this.generateFriendsList(guradianFriends)
        this.friendsInputValsMap = this.generateFriendsInputValsMap(guradianFriends)
        this.recoveryNumber = recoveryNumber
        console.log('this.friendsInputValsMap',this.friendsInputValsMap)
      } else {
        // Toast('can not detect backupId')
        console.log('can not detect backupId')
      }
    },
    changeInputVal(val, record) {
      const inputVals = _.cloneDeep(this.friendsInputValsMap)
      if (val) {
        inputVals[`${record.id}-inputVal`] = val
      }
      this.friendsInputValsMap = inputVals;
    },
    confirmSecretKey() {
      /* const splis = split('0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9', 'WEAK')
      const combineWords =combine(splis)
      console.log(splis)
      console.log(combineWords) */
      // 8018c90b292645f6b229b3177da9ecd64962d8358cba862c8674bb308cd6beed0e63677af5f10c08e2c13793b5ed4acc22f89320de06edbbabedfa5641d9ef80e9b480c0cccca16e07523b09967de1ec129c06febf64471d1b2cfe82690c0807f44
      // 802053d7939c8bed6442b62eeaa21ccc89d5a42b0474d9e8d62962b1022d691bd1e6cb743eb205e010e26ae76e5b51399fb0f381a8edcf2693ea301c87221471ced90b218498970ddbc46242f94a1ff9ffd9d8ecb3d8828bf2683074c619d95fed8
      // 80389adcbabace1bd66b0539971bf38ac6f77f6e8c8e5ca4561dda8188cbd4f6dbd5af7ec8730df8f1035e34d8c618d5bb7863e175fb21ed3b57c96ac57bfd91234d8d814c143523dfb65a3b6c57fa05eb15dd1208fcc1f6ea14ca96ac55d6d81ac

      const splits = Object.values(this.friendsInputValsMap).filter(i=>!!i)
      if (splits.length < this.recoveryNumber) {
        Toast(`至少提供${this.recoveryNumber}个分片`)
        return
      }
      const combineStr = combine(splits)
      console.log('combineStr', combineStr)
      if (combineStr) {
        this.$emit('childEvent', combineStr);
      } else {
        Toast('Error')
      }
    },
    toPage(pathName) {
      this.$router.push({ name: pathName })
    },
  },
  mounted() {
    this.friendsList = [];
    this.getSendEmialFriendsList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>