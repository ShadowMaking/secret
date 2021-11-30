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
import * as ethers from 'ethers';
import { getDefaultETHAssets } from '@/utils/dashBoardTools';
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
      address: window.ethereum.selectedAddress,//window.ethereum.selectedAddress,0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a
      balanceNowString: 0,
    }
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) {
      this.address = res.length&&res[0] || ''
      this.drawChart()
    },
  },
  methods: {
    changeDimension(record) {
      this.dimension = record;
      this.drawChart()
    },
    async getNowBalance() {
      const ETHAssets = await getDefaultETHAssets();
      this.balanceNowString = ETHAssets.balanceNumberString;
    },
    generateOption() {
      const chartOption = _.cloneDeep(this.chartOption)
      const xAxisData = []
      const seriesData = this.chartSourceData
      seriesData.forEach(item => {
        xAxisData.push(item[0])
      })
      chartOption['xAxis'][0]['data'] = xAxisData
      chartOption['series'][0]['data'] = seriesData
      console.log(xAxisData)
      console.log(seriesData)
      return chartOption
    },
    drawChart() {
      this.getNowBalance()
      this.getDataSource()
    },
    getXday(type) {
      switch(type) {
        case '1H':
          this.datesource = [
          {time: '2019-03-28 00:00:00'},
          {time: '2020-11-28 04:00:00'},
          {time: '2021-11-28 08:00:00'},
          {time: '2021-11-28 12:00:00'},
          {time: '2021-11-28 16:00:00'},
          ]
          break;
        case '1D':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-28 04:00:00'},
          {time: '2021-11-28 08:00:00'},
          {time: '2021-11-28 12:00:00'},
          {time: '2021-11-28 16:00:00'},
          ]
          break;
        case '1W':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-27 00:00:00'},
          {time: '2021-11-26 00:00:00'},
          {time: '2021-11-25 00:00:00'},
          {time: '2021-11-24 00:00:00'},
          ]
          break;
        case '1M':
          this.datesource = [
          {time: '2021-11-01 00:00:00'},
          {time: '2021-11-05 00:00:00'},
          {time: '2021-11-10 00:00:00'},
          {time: '2021-11-15 00:00:00'},
          {time: '2021-11-20 00:00:00'},
          ]
          break;
        case '1Y':
          this.datesource = [
          {time: '2021-01-01 00:00:00'},
          {time: '2021-02-01 00:00:00'},
          {time: '2021-04-01 00:00:00'},
          {time: '2021-06-01 00:00:00'},
          {time: '2021-08-01 00:00:00'},
          ]
          break;
        default:
          break;
      }
    },
    async getDataSource() {
      this.getXday(this.dimension)
      this.getYValue()
      // this.chartSourceData = []

      // this.datesource.map(async item => {
      //   let xtime = item.time
      //   let xtimestamp = new Date().getTime()/1000
      //   let yvalue = Math.random()
      //   // let yvalue = Math.random()
      //   let itemArr = [xtime, yvalue]
      //   this.chartSourceData.push(itemArr)
      // })
    },
    async getYValue() {
      let _this = this
      let lastDate = new Date(this.datesource[0].time).getTime()/1000
      const { hasError, data } = await this.$store.dispatch('GetNormalTransByEtherscan',{address: this.address});
      this.chartSourceData = []
      this.datesource.map(item => {
         let xtime = item.time
         let itemArr = [xtime, this.balanceNowString]
         this.chartSourceData.push(itemArr)
      })
      if (data && data.length > 0) { 
        data.reverse().map(item => {
          let timsd = new Date(item.timeStamp*1000)
          if (item.timeStamp >= lastDate) {
            this.dealNewData(item)
          }
        })
      }
      this.chartOption = this.generateOption()
      this.myChart.setOption(this.chartOption);
    },
    async dealNewData(trasItem) {
      
      
      for (var i=0; i< this.chartSourceData.length; i++) {
        let xtimestamp = new Date(this.chartSourceData[i][0]).getTime()
        if (trasItem.timeStamp <= xtimestamp) {
          let balanceString = this.chartSourceData[i][1]
          let changeValue = ethers.utils.formatEther(trasItem.value)
          if (trasItem.from == this.address) {//out
            balanceString = Number(balanceString) + Number(changeValue)
          } else {
            balanceString = Number(balanceString) - Number(changeValue)
          }
          this.chartSourceData[i][1] = balanceString
          return
        }
      }
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
