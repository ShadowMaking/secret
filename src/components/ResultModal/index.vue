<template>
  <div class="result-modal-wraper">
  <el-dialog
    title=""
    :visible.sync="showDialog"
    custom-class="confirm-modal-wraper"
    center
    :before-close="cancleDialog">
    <div class="confirm-modal-content">{{content}}</div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancleDialog" v-show="needColse">Cancel</el-button>
      <el-button type="primary" @click="confirmDialog">Confirm</el-button>
    </div>
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
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
