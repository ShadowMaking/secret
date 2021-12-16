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
import { getDefaultETHAssets, getConnectedAddress, getConnectedNet } from '@/utils/dashBoardTools';
import { timeFormat } from '@/utils/str';
import { CHAINMAP } from '@/utils/netWorkForToken'
import web3 from 'web3'
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
          // type: 'time',
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
      userAddress: '',//window.ethereum.selectedAddress,0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a
      balanceNowString: 0,
    }
  },
  // watch: {
  //   '$store.state.metamask.accountsArr': function (res) {
  //     this.address = res.length&&res[0] || ''
  //     this.drawChart()
  //   },
  // },
  methods: {
    changeDimension(record) {
      this.dimension = record;
      this.drawChart()
    },
    generateOption() {
      console.log(this.chartSourceData)
      const chartOption = _.cloneDeep(this.chartOption)
      const xAxisData = []
      const seriesData = this.chartSourceData
      seriesData.forEach(item => {
        xAxisData.push(item[0])
      })
      chartOption['xAxis'][0]['data'] = xAxisData
      chartOption['series'][0]['data'] = seriesData
      return chartOption
    },
    drawChart() {
      if(!this.connectedWallet()) { return }
      this.getDataSource()
    },
    getXList(change) {
      var nowDate = new Date()
      var xList = []
      for (var i=0; i<7 ; i++) {
        var thatTime = new Date(nowDate - i*change)
        var thatDate = timeFormat(thatTime, 'yyyy-MM-dd hh:mm:ss')
        xList.push({time: thatDate})
      }
      return xList.reverse()
    },
    getXday() {
      switch(this.dimension) {
        case '1H':
          let hourChange = 10*60*1000 //10min
          this.datesource = this.getXList(hourChange)
          // this.datesource = [
          // {time: '2021-12-06 12:00:00'},
          // ]
          break;
        case '1D':
          let dateChange = 4*60*60*1000 //4hour
          this.datesource = this.getXList(dateChange)
          break;
        case '1W':
          let weekChange = 24*60*60*1000 //1day
          this.datesource = this.getXList(weekChange)
          break;
        case '1M':
          let mouthChange = 5*24*60*60*1000 //5day
          this.datesource = this.getXList(mouthChange)
          break;
        case '1Y':
          let yearChange = 2*30*24*60*60*1000 //2mouth
          this.datesource = this.getXList(yearChange)
          break;
        default:
          break;
      }
    },
    getDataSource() {
      this.getXday()
      this.getYValue()
    },
    async getYValue() {
      const connectedNetInfo = getConnectedNet()
      const currentChainId = connectedNetInfo && connectedNetInfo['id']
      const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
      const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
      const ETHAssets = await getDefaultETHAssets(this, rpcUrl);
      console.log(ETHAssets)
      this.balanceNowString = ETHAssets.balanceNumberString;
      let lastDate = new Date(this.datesource[0].time).getTime()/1000
      const { hasError, data } = await this.$store.dispatch('GetNormalTransByEtherscan',{address: this.userAddress});
      this.chartSourceData = []
      this.datesource.map(item => {
         let xtime = item.time
         let itemArr = [xtime, this.balanceNowString]
         this.chartSourceData.push(itemArr)
         console.log(item.time)
      })
      if (data && data.length > 0) { 
        data.reverse().map(item => {
          // let timsd = new Date(item.timeStamp*1000)
          if (item.timeStamp >= lastDate) {
            this.dealNewData(item)
          }
        })
      }
      this.chartOption = this.generateOption()
      this.myChart.setOption(this.chartOption);
    },
    async dealNewData(trasItem) {
      console.log("time" +new Date(trasItem.timeStamp*1000) + '-' + ethers.utils.formatEther(trasItem.value) + '-' + trasItem.from )
      for (var i=0; i< this.chartSourceData.length; i++) {
        let xtimestamp1 = new Date(this.chartSourceData[i][0]).getTime()/1000
        let xtimestamp2
        if (i !== this.chartSourceData.length-1){
          xtimestamp2 = new Date(this.chartSourceData[i+1][0]).getTime()/1000
        } else {
          xtimestamp2 = new Date(this.chartSourceData[i][0]).getTime()/1000
        }
        if (trasItem.timeStamp > xtimestamp1 && trasItem.timeStamp <= xtimestamp2) {
          let balanceString = this.chartSourceData[i][1]
          let changeValue = ethers.utils.formatEther(trasItem.value)
          if (trasItem.from == this.userAddress) {//out
            balanceString = Number(balanceString) + Number(changeValue)
          } else {
            balanceString = Number(balanceString) - Number(changeValue)
          }
          this.chartSourceData[i][1] = balanceString
          return
        }
      }
    },
    connectedWallet() {
      const userAddress = getConnectedAddress()
      const connectedNetInfo = getConnectedNet()
      const chainId = connectedNetInfo && web3.utils.numberToHex(connectedNetInfo.id)
      if (!chainId || !userAddress) {
        Toast('Need Login')
        return false
      }
      return true
    },
  },
  mounted() {
    this.myChart = this.$echarts.init(document.getElementById("chartContent"));
    this.userAddress = getConnectedAddress()
    this.drawChart();
  }
}
</script>
<style lang="scss" scoped>
  @import "index";
</style>
