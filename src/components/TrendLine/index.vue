<template>
  <div>
    <div class="trend-line-container">
      <div id="chartContent"></div>
      <div class="dimension">
        <ul>
          <li
            v-for="(item, index) in dimensionList"
            :key="index"
            :class="['button small',{ 'active': item === dimension}]"
            @click="changeDimension(item)">
            {{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { getDefaultAddress } from '@/utils/auth'
//DCCX2QFIHVFTGZKZXRN1X2ZZJWQ49P1QNX
export default {
  name: 'TrendLine',
  props: ['sourceData'],
  data() {
    return {
      myChart: null,
      dimensionList: ['1H', '1D', '1W', '1M', '1Y'],
      dimension: '1H',
      chartSourceData: [],
      datesource: [],
      chartOption: {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            var result = `${params[0].data[0]} <br/>`
            params.map(item => {
              result += `${item.seriesName} : ${isNaN(item.value[1]) ? '-' : item.value[1]}</br>`
            })
            return result
          }
        },
        grid: {
          left: '35',
          right: '22',
          bottom: '30',
          top: '34'
        },
        yAxis: {
          type: 'value'
        },
        xAxis: [{
          type: 'time',   // x轴为 时间轴
          splitLine: { show: false },
          axisLine: {
            lineStyle: { width: 0 }
          },
          axisLabel: {
            color: '#5A6872',
            fontSize: 11
          },
          axisTick: { show: false },
          boundaryGap: false,
        }],
        series: [
          {
            name: 'assets',
            type: 'line',
            symbol: 'none',
            
            lineStyle: { normal: { color: '#5AAAFA', width: 1 } },
            areaStyle: { normal: { color: '#5AAAFA', opacity: 0.5 } },
          }
        ]
      },
      address: getDefaultAddress(this.$store),
    }
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) {
      this.address = res.length&&res[0] || ''
    },
  },
  methods: {
    changeDimension(record) {
      this.dimension = record;
      this.drawChart(record)
    },
    generateOption() {
      const sourceData = this.chartSourceData
      const chartOption = _.cloneDeep(this.chartOption)
      const xAxisData = []
      const seriesData = this.chartSourceData
      sourceData.forEach(item => {
        xAxisData.push(item[0])
      })
      chartOption['xAxis'][0]['data'] = xAxisData
      chartOption['series'][0]['data'] = seriesData
      return chartOption
    },
    drawChart() {
      this.getDataSource()
      // this.getBlockList()
      this.chartOption = this.generateOption()
      this.myChart.setOption(this.chartOption);
    },
    getXday(type) {
      switch(type) {
        case '1H':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-28 04:00:00'},
          {time: '2021-11-28 08:00:00'},
          {time: '2021-11-28 12:00:00'},
          {time: '2021-11-28 16:00:00'},
          {time: '2021-11-28 20:00:00'},
          {time: '2021-11-28 24:00:00'},
          ]
          break;
        case '1D':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-28 04:00:00'},
          {time: '2021-11-28 08:00:00'},
          {time: '2021-11-28 12:00:00'},
          {time: '2021-11-28 16:00:00'},
          {time: '2021-11-28 20:00:00'},
          {time: '2021-11-28 24:00:00'},
          ]
          break;
        case '1W':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-27 00:00:00'},
          {time: '2021-11-26 00:00:00'},
          {time: '2021-11-25 00:00:00'},
          {time: '2021-11-24 00:00:00'},
          {time: '2021-11-23 00:00:00'},
          {time: '2021-11-22 00:00:00'},
          ]
          break;
        case '1M':
          this.datesource = [
          {time: '2021-11-01 00:00:00'},
          {time: '2021-11-05 00:00:00'},
          {time: '2021-11-10 00:00:00'},
          {time: '2021-11-15 00:00:00'},
          {time: '2021-11-20 00:00:00'},
          {time: '2021-11-25 00:00:00'},
          {time: '2021-11-30 00:00:00'},
          ]
          break;
        case '1Y':
          this.datesource = [
          {time: '2021-01-01 00:00:00'},
          {time: '2021-02-01 00:00:00'},
          {time: '2021-04-01 00:00:00'},
          {time: '2021-06-01 00:00:00'},
          {time: '2021-08-01 00:00:00'},
          {time: '2021-10-01 00:00:00'},
          {time: '2021-12-01 00:00:00'},
          ]
          break;
        default:
          break;
      }
    },
    async getBlockList() {
      const { hasError, data } = await this.$store.dispatch('GetBlocksByEtherscan',{address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'});
      if (data) { this.blockList = data; console.log(data)}
    },
    async getDataSource() {
      this.getXday(this.dimension)
      this.chartSourceData = []

      this.datesource.map(async item => {
        let xtime = item.time
        let xtimestamp = new Date().getTime()/1000
        let res = await this.$store.dispatch('GetBlockTimestampByEtherscan', {timestamp: parseInt(xtimestamp)});
        if (!res.hasError) {
          let blockNum = res.data
          let yvalue = this.getBalance(blockNum)
        }
        let yvalue = Math.random()
        let itemArr = [xtime, yvalue]
        this.chartSourceData.push(itemArr)
      })
    },
    async getBalance(blockNum) {
      console.log(blockNum)
      const { hasError, data } = await this.$store.dispatch('GetBalanceBytagByEtherscan',{address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', tag: blockNum});
      console.log(data)
      console.log(hasError)
      if (data) { console.log(data)}
    },
  },
  mounted() {
    this.myChart = this.$echarts.init(document.getElementById("chartContent"));
    this.drawChart();
  }
}
</script>
<style lang="scss" scoped>
  @import "index";
</style>
