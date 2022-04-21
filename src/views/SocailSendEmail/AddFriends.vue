<template>
  <div class="add-friends-page">
    <v-navTitle title="Co-workers" helpUrl="docs/usage/Tools"></v-navTitle >
    <h4 style="display: none">
      <span>Friends</span>
      <!-- <a class="button button-with-radius button-update" @click="refresh">
        <i :class="['icon','ico-ipdate', {'spin': refreshLoading}]"></i>
        Refresh
      </a> -->
    </h4>
    <span class="tip">We will split the account key and send it through your Google Friends' Email</span>
    <span class="tip">Attention: The email of your friend must logined in Secret. You can click<i @click="copyUrl">https://secret.ieigen.com</i>to copy this link address for your friend</span>
    <div class="friend-list-wrapper">
      <!-- search -->
      <van-search
        style="display:none"
        v-model="searchKey"
        placeholder="search friend"
        class="serach-friend-input"
        show-action
        :clearable="false"
        @search="onSearchFriend"
        @cancel="onCancelSearch"
        @clear="onCancelSearch"
        @input="handleWatchInput" >
        <template #action>
          <div @click="onCancelSearch"></div>
        </template>
      </van-search>
      <!-- add friend by google email -->
      <div class="add-friend-by-email-wrap">
        <div class="gmail-input-wrapper">
          <van-field
            v-model="prefixGmail"
            label=""
            placeholder="enter friend's email"
          />
          <span>@gmail.com</span>
          <van-button 
            style="border:0px"
            :disabled="!prefixGmail||addIsLoading"
            class="add-friend-box"
            @click="addFriend">
            <img src="~@/assets/friendIcon.png" class="friend-icon">
          </van-button>
        </div>
        <!-- <van-button
          icon="plus"
          plain
          color="#495ABE"
          size="small"
          class="add-button"
          :disabled="!prefixGmail||addIsLoading"
          @click="addFriend"></van-button> -->
        
        <img src="~@/assets/refresh.png" :class="['refesh-icon', {'spin': refreshLoading}]"  @click="refresh">
      </div>
      <!-- friends list -->
      <van-list
        v-if="friendsList.length"
        class="friend-list"
        v-model="loading"
        :finished="finished"
        finished-text="no more"
        loading-text="loading..."
        @load="onLoad" >
        <div v-for="(item, index) in friendsList" :key="index" class="friend-item van-hairline--bottom">
          <div class="account-info">
            <span class="portraitImg"></span>
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <span class="address">{{ item.email }}</span>
            </div>
          </div>
          <div class="status">
            <!-- 1:mutual  2:waiting 3:confirming -->
            <van-icon name="checked" size="25" color="#61D375" v-if="item.status===1" />
            <van-icon name="clock" size="25" color="#61D375" v-else-if="item.status===2" />
            <van-icon name="clear" size="25" color="#61D375" v-else-if="item.status===3" @click="OpenConfirmDialog(item)"/>
            <!-- <van-button
              v-else
              icon="plus"
              plain
              color="#495ABE"
              size="small"
              class="add-button"
              @click="addFriend">Add</van-button> -->
          </div>
        </div>
      </van-list>
      <!-- no-friends -->
      <div class="no-friends" v-else><v-none /></div>
    </div>
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
    <van-dialog
      v-model="showConfirmDialog"
      title="Tip"
      show-cancel-button
      confirm-button-text="Confirm"
      cancel-button-text="Reject"
      close-on-click-overlay
      @confirm="dealRequet('confirm')"
      @cancel="dealRequet('reject')" >
      <div class="flex flex-center" style="margin: 10px 0 20px">Friend’s Information</div>
    </van-dialog>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup, Button, List, Cell, Icon, Search, Field, Dialog} from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import ThirdLoginTip from '@/components/ThirdLoginTip';
import navTitle from '@/components/NavTitle/index'
import None from '@/components/None/index'
import { copyTxt } from '@/utils/index';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Button)
Vue.use(List)
Vue.use(Icon)
Vue.use(Cell)
Vue.use(Search)
Vue.use(Field)
Vue.use(Dialog)

export default {
  name: "AddFriends",
  data() {
    return {
      searchKey: '',
      refreshLoading: false,
      friendsList: [], // {id,name,email,status}
      loading: false,
      finished: false,
      total: 0,
      prefixGmail: '',
      addIsLoading: false,
      showThirdLoginTip: false,
      showConfirmDialog: false,
      currentFriendData: null,
      pageOrigin: this.$route.query.type,//mn-sendemail
    }
  },
  components: {
    'v-thirdlogintip': ThirdLoginTip,
    "v-navTitle": navTitle,
    'v-none': None,
  },
  computed: {
    thirdUserId() {
     return getFromStorage('gUID')
    },
  },
  filters: {
    showAddress(str) {
      if (!str) { return ''}
      return `${str.slice(0,6)}...${str.slice(-4)}`
    }
  },
  methods: {
    copyUrl() {
      copyTxt('https://secret.ieigen.com');
      Toast('Copied')
    },
    async refresh() {
      if (!this.thirdUserId) { return }
      this.refreshLoading = true;
      // this.loading = true
      // this.finished = false
      this.friendsList = [];
      await this.getAllMyFriendsList()
      this.refreshLoading = false;
      // this.loading = false
      // this.finished = false
    },
    toPage(routeNme) {
      this.$router.push({ name: routeNme })
    },
    onSearchFriend(val) {
      console.log(val)
    },
    onCancelSearch() {
      this.searchKey = undefined
    },
    handleWatchInput(){},
    onLoad() {
      setTimeout(() => {
        // 加载状态结束
        this.loading = false;
        if (this.friendsList.length >= this.total) {
          this.finished = true;
        }
      }, 1000);
    },
    onLoad1() {
      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1);
        }

        // 加载状态结束
        this.loading = false;

        // 数据全部加载完成
        if (this.list.length >= 40) {
          this.finished = true;
        }
      }, 1000);
    },
    generateFriendsList(list) {
      return list.map(item=>{
        return {
          id: item['user_id'],
          name: item['name'],
          email: item['email'],
          status: item['status'],
        }
      })
    },
    async getAllMyFriendsList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetMyFriendsList', {userId});
      if (!hasError) {
        this.friendsList = this.generateFriendsList(list)
        this.total = list.length // TODO
        if (list.length >= 2 && this.pageOrigin) {
          this.getHasFriendsList();
        }
      }
    },
    async getHasFriendsList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetMyFriendsList', {userId,status: 1});
      if (!hasError) {
        this.total = list.length
        if (list.length >= 2) {
          Dialog.confirm({
            title: 'return to continue create secret?',
            confirmButtonText: 'confirm',
            cancelButtonText: 'cancel',
          })
            .then(() => {
              this.$router.push({ name: 'ssendemail', query: {type: this.pageOrigin} })
            })
            .catch(() => {
              // on cancel
            });
        }
      }
    },
    async addFriend() {
      if (!this.thirdUserId) {
        this.showThirdLoginTip = true
        console.log('Please Login')
        return
      }
      this.addIsLoading = true;
      const userId = getFromStorage('gUID')
      if (!userId||!this.prefixGmail) {
        console.log('can detect userID after third login')
        Toast('error')
        return
      }
      const data = {
        fromUserID: userId,
        toUserEmail: `${this.prefixGmail.trim()}@gmail.com`
      }
      const { hasError, list, error } = await this.$store.dispatch('AddFrined', data);
      this.addIsLoading = false;
      if (!hasError) {
        this.prefixGmail = ''
        this.friendsList = [];
        this.getAllMyFriendsList()
      } else {
        Toast(error)
      }
    },
    OpenConfirmDialog(record) {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        Toast('error')
        return
      }
      this.currentFriendData = _.cloneDeep(record)
      this.showConfirmDialog = true
    },
    async dealRequet(type) {
      // <van-icon name="close" />
      // <van-icon name="passed" />
      this.showConfirmDialog = false
      const data = {
        fromUserID: getFromStorage('gUID'),
        toUserID: this.currentFriendData.id,
      }
      let requestName
      type === 'confirm' && ( requestName = 'ConfirmForAddFrined')
      type === 'reject' && ( requestName = 'RejectForAddFrined')

      const { hasError, list, error } = await this.$store.dispatch(`${requestName}`, data);
      if (!hasError) {
        this.friendsList = [];
        this.getAllMyFriendsList()
      } else {
        Toast(error)
      }
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    }
  },
  mounted() {
    this.friendsList = [];
    this.getAllMyFriendsList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>