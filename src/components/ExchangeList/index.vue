<template>
  <div class="common-exchange-list-wrapper">
    <div class="common-exchange-list">
      <h3 class="exchange-list-title">交易记录</h3>
      <div class="exchange-list" v-if="detailList.length>0 && !walletIsLock">
        <div @click="getExchangeDetail">
          <mt-cell is-link class="exchange-list-item" >
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-transfer"></i>转账ZKS</span>
            <!-- <span class="exchange-status">确认中</span> -->
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        </div>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-withdraw"></i>提现ZKS</span>
            <span class="exchange-status">确认中</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-wrong"></i>交易失败</span>
            <!-- <span class="exchange-status">确认中</span> -->
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount textTransparent">交易失败</span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-recharge"></i>充值 ETH</span>
            <span class="textTransparent">充值</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
      </div>
      <div class="flex flex-center flex-column none-data" v-else>
        <img :src="DEFAULTIMG.NONE_TATA" class="img-QR"/>
        <span>暂无交易记录</span>
      </div>
    </div>
    <mt-popup
      :visible.sync="popupVisible"
      v-model="popupVisible"
      position="bottom"
      popup-transition="popup-fade"
      class="common-bottom-popup exchange-detail-popup">
      <div class="common-exchange-detail-wrap">
        <div class="header">
          <h3>交易详情</h3>
        </div>
        <ul v-for="(item,index) in detailList" :key="`exchange-${index}`">
          <li class="flex flex-content-between common-exchange-detail-item">
            <span>{{ item.title }}</span>
            <span>{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Popup } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';

Vue.component(Popup.name, Popup)

export default {
  name: 'Home',
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      detailList: [1],
      /* detailList: [
        {
          title: '时间',
          value: '13/07/2021 12:54:35'
        },
        {
          title: '操作',
          value: '充值 54.6958 ZKS'
        },
      ] */

    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
  },
  methods: {
    getExchangeDetail() {
      this.popupVisible = true;
    },
  },

};
</script>
<style lang="scss" >
  @import 'index';
</style>
