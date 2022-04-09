<template>
  <div class="result-modal-wraper">
  <el-dialog
    title=""
    :visible.sync="showDialog"
    custom-class="confirm-modal-wraper"
    center
    :before-close="cancleDialog"
    :close-on-click-modal="showCloseIcon"
    :show-close="showCloseIcon">
    <div class="result-modal-icon">
      <img src="@/assets/resultSuccess.png" v-if="resultStatus == 'success'">
      <img src="@/assets/resultWaiting.png" v-if="resultStatus == 'waiting'">
    </div>
    <div class="confirm-modal-content"><div v-html="content"></div></div>
    <div class="confirm-modal-detail blueColor" v-if="detailUrl" @click="goDetail">Details</div>
    <div slot="footer" class="dialog-footer" v-if="needColse || needConfirm">
      <el-button @click="cancleDialog" v-show="needColse" class="result-btn">Cancel</el-button>
      <el-button type="primary" @click="confirmDialog" v-show="needConfirm" class="result-btn">{{confirmText}}</el-button>
    </div>
    <div class=""></div>
  </el-dialog>
  </div>
</template>
<script>
import Vue from 'vue';

export default {
  name: 'ResultModal',
  props: {
    'show': { type: Boolean, },
    'content': { type: String, },
    'needColse': {
      type: Boolean,
      default: true
    },
    'needConfirm': {
      type: Boolean,
      default: true
    },
    'confirmText': {
      type: String,
      default: 'Confirm'
    },
    'showCloseIcon': {
      type: Boolean,
      default: true
    },
    'resultStatus': {
      type: String,
      default: 'noresult'
    },
    'detailUrl': {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      showDialog: false,
    }
  },
  watch: {
    show() {
      this.showDialog = this.show
    },
  },
  methods: {
    confirmDialog() {
      this.showDialog = false;
      this.$emit('confirm',{show: false});
    },
    cancleDialog() {
      this.showDialog = false;
      this.$emit('close',{show: false});
    },
    goDetail() {
      window.open(this.detailUrl, '_blank')
    },
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
