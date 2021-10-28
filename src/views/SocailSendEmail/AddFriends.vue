<template>
  <div class="add-friends-page">
    <h4>
      <span>Friends</span>
      <a class="button button-with-radius button-update" @click="refresh">
        <i :class="['icon','ico-ipdate', {'spin': refreshLoading}]"></i>
        Refresh
      </a>
    </h4>
    <span class="tip">We will split the secret key and send it through your Google Friends' Email</span>
    <div class="friend-list-wrapper">
      <!-- search -->
      <van-search
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
            placeholder="add friend's email"
          />
          <span>@gmail.com</span>
        </div>
        <van-button
          icon="plus"
          plain
          color="#495ABE"
          size="small"
          class="add-button"
          :disabled="!prefixGmail||addIsLoading"
          @click="addFriend">Add</van-button>
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
            <van-icon name="exchange" size="25" color="#61D375" v-if="item.status===1" />
            <van-icon name="clock-o" size="25" color="#61D375" v-else-if="item.status===2" />
            <van-icon name="question-o" size="25" color="#61D375" v-else-if="item.status===3" @click="dealRequet(item)"/>
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
      <div class="no-friends" v-else>
        <van-icon name="closed-eye" color="#eee" size="40"/>
        <span>no friends</span>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup, Button, List, Cell, Icon, Search, Field, Dialog } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

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
    }
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
      }
    },
    async addFriend() {
      if (!this.thirdUserId) {
        Toast('请进行社交登录')
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
        toUserEmail: `${this.prefixGmail}@gmail.com`
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
    async dealRequet(record) {
      // <van-icon name="close" />
      // <van-icon name="passed" />
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        Toast('error')
        return
      }
      Dialog.confirm({
        title: 'Tip',
        message: '请处理好友请求',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Reject',
        closeOnClickOverlay: true
      })
      .then(async () => {
        const cdata = {
          fromUserID: record.id,
          toUserID: userId,
        }
        const { hasError, list, error } = await this.$store.dispatch('ConfirmForAddFrined', cdata);
        if (!hasError) {
          this.friendsList = [];
          this.getAllMyFriendsList()
        } else {
          Toast(error)
        }
      })
      .catch(async () => {
        const rdata = {
          fromUserID: record.id,
          toUserID: userId,
        }
        const { hasError, list, error } = await this.$store.dispatch('RejectForAddFrined', rdata);
        if (!hasError) {
          this.friendsList = [];
          this.getAllMyFriendsList()
        } else {
          Toast(error)
        }
      });
    },
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