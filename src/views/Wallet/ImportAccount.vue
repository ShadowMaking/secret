<template>
  <div class="import-account-page">
    <div class="import-tip-info">导入的账户将不会与最初创建的钱包账户助记词相关联</div>
    <van-field v-model="importTypeTxt" label="选择类型" readonly class="importType-select" @click="choseImportType"/>
    <!-- 私钥形式 -->
    <div v-show="importType==='privateKey'" class="content-for-private">
      <span class="fieldName">请粘贴您的私钥</span>
      <van-field
        v-model="privateKeyValue"
        name="privateKeyValue"
        class="field-item-input" />
    </div>
    <!-- JSON形式 -->
    <div v-show="importType==='json'"  class="content-for-json">
      <div class="upload-wrapper">
        <van-uploader>
          <van-button type="info" color="#495ABE" size="small" @click="importJson">选择文件</van-button>
        </van-uploader>
      </div>
      <van-field
        v-model="inputPsw"
        name="inputPsw"
        placeholder="输入密码"
        class="field-item-input" />
    </div>
    <div class="opt-wrapper">
      <van-button plain type="info" @click="toPageMywallet">取消</van-button>
      <van-button type="info" color="#495ABE" @click="submitImport">导入</van-button>
    </div>
    <van-popup v-model="showImportType" round position="bottom">
      <van-picker
        show-toolbar
        :columns="typeList"
        @cancel="showImportType = false"
        @confirm="onConfirm" />
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Field, Popup, Picker, Uploader } from 'vant';
Vue.use(Field);
Vue.use(Popup);
Vue.use(Picker);
Vue.use(Uploader);

export default {
  name: 'ImportAccount',
  data() {
    return {
      importType: 'json', // privateKey | json
      typeList: [{ key: 'privateKey', text: '私钥'}, { key: 'json', text: 'JSON' }],
      showImportType: false,
      privateKeyValue: '',
      inputPsw: '',
    }
  },
  computed: {
    importTypeTxt() {
      const target = _.find(this.typeList, {key: this.importType})
      return target && target['text'];
    },
  },
  methods: {
    choseImportType() {
      this.showImportType =  true
    },
    onConfirm(value) {
      console.log(value)
      this.importType = value['key'];
      this.showImportType = false;
    },
    toPageMywallet() {
      this.$router.push({ name: 'MyWallet' })
    },
    submitImport() {
      const importType = this.importType
      const privateKeyValue = this.privateKeyValue;
      console.log(`导入形式-${importType},私钥-${privateKeyValue}`)
    },
    importJson() {
      
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>