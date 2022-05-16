<template>
  <div class="add-proposal-page content-box">
    <v-navTitle title="New proposal" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="add-proposal-content content-page">
      <p class="proposal-des">You need to have a minimum of 1 governance token in order to submit a proposal.</p>
      <div class="proposal-title">Please select the module proposal to be upgraded:</div>
      <div class="module-list">
        <el-select v-model="selectModal" placeholder="Please choose" class="module-select">
          <el-option
            v-for="item in moduleList"
            :key="item.id"
            :label="item.title"
            :value="item.title">
          </el-option>
        </el-select>
      </div>
      <div class="proposal-title">Please enter new contract address:</div>
      <el-input v-model="proposalName"></el-input>
      <div class="proposal-title">Proposal Voting Period <span style="font-weight: bold">7</span> days</div>
      <div class="proposal-title">Description:</div>
      <el-input type="textarea" v-model="proposalDes"></el-input>
      <div class="add-proposal-btn">
        <a class="common-form-btn" :loading="addBtnLoading" @click="addSubmit">Submit</a>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'addProposal',
  data() {
    return {
      moduleList: [
       {title: 'TransactionModule', id: 1,},
       {title: 'SecurityModule', id: 2}
      ],
      selectModal: '',
      proposalName: '',
      proposalDes: '',
      addBtnLoading: false,
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    addSubmit() {},
  },
  created() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-select-dropdown__item {
    padding: 0 20px !important;
  }
</style>
