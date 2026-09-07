<template>
  <div class="realtime-power">
    <div class="rp-header">
      <span class="rp-title">24h 负荷曲线</span>
      <span class="rp-date">今日：{{ today }}</span>
    </div>
    <div ref="chart" :style="{ height: height + 'px' }"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'RealtimePower',
  props: {
    data: { type: Object, default: null },
    height: { type: Number, default: 200 }
  },
  data() {
    return { chart: null }
  },
  computed: {
    today() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  },
  watch: {
    data: {
      deep: true,
      handler() { this.renderChart() }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    renderChart() {
      if (!this.chart) return
      const d = this.data || this.getDefaultData()
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: (d.series || []).map(s => s.name), bottom: 0, textStyle: { fontSize: 11 } },
        grid: { top: 20, right: 15, bottom: 35, left: 50 },
        xAxis: { type: 'category', data: d.xAxis || [], boundaryGap: false, axisLabel: { fontSize: 10, rotate: 30 } },
        yAxis: { type: 'value', name: 'kW', nameLocation: 'middle', nameGap: 35, nameTextStyle: { fontSize: 14, color: '#595959', fontWeight: 'normal' }, axisLabel: { fontSize: 12, color: '#595959', formatter: '{value}' }, splitLine: { lineStyle: { type: 'dashed', color: '#E8E8E8' } } },
        series: (d.series || []).map(s => ({
          ...s,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 }
        }))
      }
      this.chart.setOption(option, true)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    },
    getDefaultData() {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      return {
        xAxis: hours,
        series: [
          { name: '电网', data: Array.from({ length: 24 }, () => (1800 + Math.random() * 600).toFixed(0)), areaStyle: { color: 'rgba(24,144,255,0.1)' }, itemStyle: { color: '#1890FF' } },
          { name: '光伏', data: Array.from({ length: 24 }, (_, i) => i >= 6 && i <= 18 ? (400 + Math.random() * 300).toFixed(0) : 0), areaStyle: { color: 'rgba(250,204,20,0.1)' }, itemStyle: { color: '#FACC14' } }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.realtime-power {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rp-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}

.rp-date {
  font-size: 12px;
  color: $text-secondary;
}
</style>
