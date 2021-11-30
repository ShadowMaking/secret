<template>
  <div class="from-box exchange-item">
    <div class="exchange-item-left">
      <p class="exchange-des">{{ type }}</p>
      <div class="exchange-select-list" @click="showOptionList">
        <img src="https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png" class="select-img">
        <span class="select-txt">{{ selectLable }}</span>
        <img src="@/assets/form/solidDown.png" class="select-down-img">
        <span class="max" v-if="isMax">MAX</span>
      </div>
      <van-popup v-model="OptionListVisile" round :style="{ maxWidth: '400px', width: '90%' }" closeable>
        <div class="exchange-popup-box">
          <div style="margin-top: 25px;">
          	<van-search v-model="searchTxt"  autofocus=true @input="searchHandle(searchTxt)"/>
          </div>
          <div class="token-list-wrapper">
            <v-selectItem
              v-bind:rightVal="item.rightVal"
              labelShow=true
              v-bind:leftTitle="item.tokenName"
              v-bind:leftDes="item.leftDes"
              v-bind:icon="item.icon"
              @childevent="selectChagne(item)"
              v-for="(item, index) in sourceData" :key="index" />
          </div>
        </div>
      </van-popup>
    </div>
    <div class="exchange-item-right">
      <p class="exchange-des">Balance: 0.015</p>
      <h3 class="exchange-value">
        <input type="text" name="formVal" placeholder="0" v-model.trim="exchangVal" @input="inputChange">
      </h3>
      <p class="exchange-des">=<label>$0.0</label></p>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';
import { Popup, Search } from 'vant';
import selectItem from '@/components/SelectItem/index';

Vue.use(Popup);
Vue.use(Search);


export default {
  name: 'ExchangItem',
  props: ['isMax', 'type', 'sourceData'],
  data() {
    return {
      exchangVal: '',
      OptionListVisile: false,
      levelIdNew: [],
      levelIds: [],
      searchTxt: '',
      selectLable: '',
    }
  },
  components: {
    "v-selectItem": selectItem,
  },
  watch: {
    sourceData: {
      async handler(newV, oldV) {
        this.selectLable = newV.length && newV[0].tokenName
      },
      deep: true,
    },
  },
  methods: {
    inputChange() {
      this.$emit('exchangeEvent', this.exchangVal);
    },
    showOptionList() {
      this.OptionListVisile = true
    },
    searchHandle(val) {
    	var levelIds = JSON.parse(JSON.stringify(this.levelIds));
        this.levelIdNew = levelIds.filter((item, index) => {
        	var content = typeof item == 'object' ? item.name : item
            return content.indexOf(val) > -1
        });
    },
    selectChagne(item) {
    	this.OptionListVisile = false
    	this.selectLable = item.tokenName
      this.$emit('exchangeEvent', item);
    },
  },
  async mounted() {
  	// var dataSource = [{id: 1,name: 'test',icon: 'https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png'},{id: 2,name: 'test2',icon: 'https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png'}];
    const dataSource = this.sourceData
    this.levelIds = this.levelIdNew = dataSource
  }
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
