<template>
  <div class="datalist-outer">
    <div class="datalist-container">
      <div class="datalist-wrapper" v-if="dataList.length">
        <el-table
          :data="dataList"
          border
          style="width: 100%">

          <el-table-column
           fixed
           v-for="(headerItem,headerindex) in headerList"
           :prop="headerItem.mode"
           :label="headerItem.name"
           width="150"
            :key="headerindex">
            
          </el-table-column>
        </el-table>
      </div>
      <v-none v-if="!showLoading && dataList.length==0" />
    </div>
    <v-loading v-show="showLoading" />
    <div v-show="_showNoMore" class="no-more">no more</div>
  </div>
</template>
<script>
import Vue from 'vue';
import None from '@/components/None/index';
import Loading from '@/components/Loading';

export default {
  name: 'dataList',
  props: {
    headerList: {
      type: Array,
      default: () => []
    },
    dataList: {
      type: Array,
      default: () => []
    },
    showLoading: {
      type: Boolean,
      default: true,
    },
    showNoMore: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
  },
  computed: {
    _showNoMore() {
      return this.showNoMore && this.dataList.length > 0
    },
  },
}
</script>
<style lang="scss" scoped>
  .no-more {
    color: #ccc;
    font-size: 1rem;
    text-align: center;
    margin: 10px 0 0;
  }
  @import 'index.scss';
  @import '@/assets/style/media.scss';
</style>
