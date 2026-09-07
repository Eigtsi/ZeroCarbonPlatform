<template>
  <div class="sankey-chart">
    <div v-if="title" class="chart-header">
      <span class="chart-title">{{ title }}</span>
    </div>
    <div ref="chart" :style="{ height: height + 'px' }" class="chart-body"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SankeyChart',
  props: {
    title: { type: String, default: '' },
    height: { type: Number, default: 400 },
    data: { type: Object, required: true }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.renderChart()
      }
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
      if (!this.chart || !this.data.nodes) return
      // 各节点输出/输入总量，用于连线占比计算
      const sourceTotal = {}
      const targetTotal = {}
      this.data.links.forEach(l => {
        sourceTotal[l.source] = (sourceTotal[l.source] || 0) + l.value
        targetTotal[l.target] = (targetTotal[l.target] || 0) + l.value
      })
      // 颜色数据驱动：优先取节点自身的 color 字段
      const nodes = this.data.nodes.map(n => ({
        name: n.name,
        itemStyle: { color: n.color || '#1890FF', borderWidth: 0 }
      }))
      const option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: params => {
            if (params.dataType === 'edge') {
              const d = params.data
              const tce = (d.value / 29.3076).toFixed(1)
              const srcPct = sourceTotal[d.source] ? (d.value / sourceTotal[d.source] * 100).toFixed(1) : '—'
              const tgtPct = targetTotal[d.target] ? (d.value / targetTotal[d.target] * 100).toFixed(1) : '—'
              return d.source + ' → ' + d.target +
                '<br/>能流量：' + Number(d.value).toLocaleString() + ' GJ（' + Number(tce).toLocaleString() + ' tce）' +
                '<br/>占源输出 ' + srcPct + '% · 占目标输入 ' + tgtPct + '%'
            }
            const tce = (params.value / 29.3076).toFixed(1)
            return params.name + '<br/>节点流量：' + Number(params.value).toLocaleString() + ' GJ（' + Number(tce).toLocaleString() + ' tce）'
          }
        },
        series: [{
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          nodeAlign: 'justify',
          nodeGap: 12,
          nodeWidth: 16,
          data: nodes,
          links: this.data.links,
          label: {
            fontFamily: 'Source Han Sans CN, PingFang SC, Microsoft YaHei, sans-serif',
            fontSize: 11,
            color: '#595959'
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.35
          },
          itemStyle: {
            borderWidth: 0
          }
        }]
      }
      this.chart.setOption(option, true)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.sankey-chart {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}

.chart-body {
  width: 100%;
}
</style>
