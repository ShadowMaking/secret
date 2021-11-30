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
        title: {},
        tooltip: {
          trigger: 'axis'
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          // type: 'time',
          boundaryGap: false,
          splitLine: {show: false},
          // min: new Date(1638079945434),
          // min: new Date(1538079945434),
          // interval: 24*3600*1000*30*2,
          // splitNumber: 13,
          axisLabel: {
            // formatter: function(value, index) {
              
            // },
          },
        },
        yAxis: {
          type: 'value'
        },
        series: [] // [{data:[150, 230, 224, 218, 135, 147, 260],type: 'line'}]
      }
    }
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
      const seriesData = [{data:[],type: 'line'}]
      sourceData.forEach(item => {
        xAxisData.push(item.time)
        seriesData[0]['data'].push(item.value); // Test
      })
      chartOption['xAxis']['data'] = xAxisData
      chartOption['series'] = seriesData
      return chartOption
    },
    drawChart() {
      // this.getDataSource()
      // this.getBlockList()
      // this.chartOption = this.generateOption()
      const datas = [
        ['2019-11-1 08:00:20' , 123],
        ['2019-11-1 09:00:20' , 55],
        ['2019-11-1 11:00:20' , 23],
        ['2019-11-2 08:00:20' , 125],
        ['2019-11-2 12:00:20' , 552],
        ['2019-11-2 15:00:20' , 22],
      ]
      
      let options= {
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
          data: datas.map(function (item) {
            return item[0]
          })
        }],
        series: [
          {
            name: '',
            type: 'line',
            symbol: 'none',
            markPoint: {
              label: {
                normal: {
                  show: true,
                  backgroundColor: '#fff',
                  position: 'top',
                  color: '#5AAAFA',
                  borderColor: 'rgba(90,170,250,0.3)',
                  borderWidth: 1,
                  padding: 8,
                }
              },
              symbol: 'circle',
              itemStyle: {
                normal: {
                  borderColor: 'rgba(90,170,250,0.3)',
                  borderWidth: 15
                }
              },
              symbolSize: 7,
              data: [
                { type: 'max', name: 'Max' }
              ]
            },
            lineStyle: { normal: { color: '#5AAAFA', width: 1 } },
            areaStyle: { normal: { color: '#5AAAFA', opacity: 0.5 } },
            connectNulls: true,
            data: datas
          }
        ]
      }
      console.log(options)
      this.myChart.setOption(options);
    },
    getXday(type) {
      switch(type) {
        case '1H':
          this.datesource = [
          {time: '2021-11-28 00:00:00'},
          {time: '2021-11-28 00:10:00'},
          {time: '2021-11-28 00:20:00'},
          {time: '2021-11-28 00:30:00'},
          {time: '2021-11-28 00:40:00'},
          {time: '2021-11-28 00:50:00'},
          {time: '2021-11-28 01:00:00'},
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
    getDataSource() {
      this.getXday(this.dimension)
      console.log(this.datesource)
      this.datesource.map(item => {
        let xtime = item.time
        let yvalue = '4'
        this.chartSourceData.push({
          time: xtime,
          value: yvalue
        })
      })
    },
  },
  mounted() {
    this.myChart = this.$echarts.init(document.getElementById("chartContent"));
    this.drawChart();
  }
}
</script>
<style lang="scss" scoped>
.trend-line-container {
  border: 1px solid #ebedf0;
  box-shadow: 10px 10px 10px #ebedf0;
  border-radius: 5px;
  padding: 0 0 20px;
  #chartContent {
    width: 100%;
    height: 250px;
    padding: 0 20px;
  }
  .dimension {
    ul {
      display: flex;
      .button{
        font-family: Avenir Next,Arial,sans-serif;
        font-size: 16px;
        font-weight: 500;
        border: none;
        border-radius: 8px;
        outline: none;
        height: auto;
        line-height: normal;
        padding: 9px 12px;
        -webkit-transition: .3s;
        -moz-transition: .3s;
        transition: .3s;
        cursor: pointer;
        white-space: nowrap;
        position: relative;
        display: -moz-box;
        display: flex;
        -moz-box-align: center;
        align-items: center;
        -moz-box-pack: center;
        justify-content: center;
      }
      .button.small {
        font-size: 14px;
        height: auto;
        line-height: normal;
        padding: 4px 12px;
        color: #657795;
        background: #f0f5f9;
      }
      li{ margin: 5px;}
      li.button.small.active{ background: #784ffe; color: #fff; }
      li.button.small.active:hover{ box-shadow: 0 0 0 4px rgb(120 79 254 / 50%); }
      li:hover{ box-shadow: 0 0 0 2px #dfe8f9; }
    }
  }
}

</style>
