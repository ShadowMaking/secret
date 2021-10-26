<template>
  <div class="add-friends-page">
    <h4>
      <span>Add Friends</span>
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
      <!-- friends list -->
      <van-list
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
            <van-icon name="exchange" size="25" color="#61D375" v-if="item.status===1" />
            <van-button
              v-else
              icon="plus"
              plain
              color="#495ABE"
              size="small"
              class="add-button"
              @click="addFriend">Add</van-button>
          </div>
        </div>
      </van-list>
    </div>
    
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup, Button, List, Cell, Icon, Search } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Button)
Vue.use(List)
Vue.use(Icon)
Vue.use(Cell)
Vue.use(Search)

export default {
  name: "AddFriends",
  data() {
    return {
      searchKey: '',
      refreshLoading: false,
      friendsList: [{
        name: 'skyeGao',
        address: '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',
        status: 0, // 0-not friend 1-is friend
      },{
        name: 'skyeGao',
        address: '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',
        status: 1,
      }],
      loading: false,
      finished: false,
      total: 0
    }
  },
  computed: {
    
  },
  filters: {
    showAddress(str) {
      if (!str) { return ''}
      return `${str.slice(0,6)}...${str.slice(-4)}`
    }
  },
  methods: {
    async refresh() {
      this.refreshLoading = true;
      setTimeout(()=>{
        this.refreshLoading = false;
      },800)
    },
    toPage(routeNme) {
      this.$router.push({ name: routeNme })
    },
    addFriend() {

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
          email: item['email']
        }
      })
    },
    async getStrangerFriendsList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetStrangerFriendsList', {userId});
      if (!hasError) {
        this.friendsList = this.generateFriendsList(list)
        this.total = list.length // TODO
        // this.friendsIdsMap = this.generateFriendsIdsMap(list)
      }
    },
  },
  mounted() {
    this.friendsList = [];
    this.getStrangerFriendsList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>