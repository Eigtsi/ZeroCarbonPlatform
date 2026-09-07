<template>
  <div class="trend-chart">
    <div v-if="title" class="chart-header">
      <span class="chart-title">{{ title }}</span>
      <div v-if="tabs.length" class="chart-tabs">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="handleTabChange(tab.key)"
        >{{ tab.label }}</span>
      </div>
    </div>
    <div ref="chart" :style="{ height: height + 'px' }" class="chart-body"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'TrendChart',
  props: {
    title: { type: String, default: '' },
    height: { type: Number, default: 300 },
    tabs: { type: Array, default: () => [] },
    option: { type: Object, required: true }
  },
  data() {
    return {
      chart: null,
      activeTab: this.tabs.length ? this.tabs[0].key : ''
    }
  },
  watch: {
    option: {
      deep: true,
      handler() {
        this.renderChart()
      }
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      this.renderChart()
    },
    renderChart() {
      if (!this.chart) return
      this.chart.setOption(this.option, true)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    },
    handleTabChange(key) {
      this.activeTab = key
      this.$emit('tab-change', key)
    }
  }
}
</script>

<style lang="scss" scoped>
.trend-chart {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}

.chart-tabs {
  display: flex;
  gap: 4px;

  .tab-item {
    padding: 4px 12px;
    font-size: $font-size-12;
    color: $text-secondary;
    cursor: pointer;
    border-radius: 4px;
    transition: all $transition-duration;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }
}

.chart-body {
  width: 100%;
}
</style>
