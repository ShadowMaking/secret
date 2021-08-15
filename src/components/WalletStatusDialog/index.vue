<template>
  <div>
    <van-dialog
      v-model="showWalletTip"
      :title="title"
      confirm-button-text="导入钱包"
      confirm-button-color="rgb(73, 90, 190)"
      :show-cancel-button="true"
      cancel-button-text="重新创建"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      get-container="#app">
      <div slots="default" class="wallet-create-tip-content">
        <div class="tip-txt">您可选择通助记词导入形式恢复钱包账号</div>
        <div class="tip-txt">也可重新创建一个钱包账号。</div>
        <div class="tipinfo">重新创建，已有账户等相关信息将被清空且无法恢复</div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import { removeWallet } from '@/utils/auth'
export default {
  name: 'WalletStatusDialog',
  props: [
    'showWalletTip',
    'title'
  ],
  data() {
    return { }
  },
  methods: {
    handleConfirm() {
      this.showWalletTip = false
      this.$router.replace({ name: 'FirstIntoWallet', query: { type: 'mnemonic' }})
    },
    handleCancel() {
      removeWallet();
      this.showWalletTip = false
      this.$router.replace({ name: 'FirstIntoWallet', query: { type: 'psw' }})
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>