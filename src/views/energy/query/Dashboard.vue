<template>
  <div class="dashboard-panel">
    <!-- 顶部工具栏 -->
    <div class="dash-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <div class="toolbar-actions">
        <el-button size="small" icon="el-icon-refresh" @click="refreshDashboard">刷新</el-button>
        <el-button size="small" icon="el-icon-full-screen" @click="toggleFullscreen">全屏</el-button>
      </div>
    </div>

    <!-- KPI 卡片行 -->
    <div class="kpi-grid mb-lg">
      <KpiCard
        v-for="item in dashboardKpiList"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :unit="item.unit"
        :status="item.status"
        :trend="item.trend"
        :trend-label="item.trendLabel"
        @click.native="handleKpiClick(item)"
      />
    </div>

    <!-- 图表行 1：趋势 + 饼图 -->
    <div class="chart-row mb-lg">
      <div class="chart-col chart-col--2">
        <TrendChart
          title="能耗趋势总览"
          :height="320"
          :tabs="[{ key: 'month', label: '月' }, { key: 'quarter', label: '季' }, { key: 'year', label: '年' }]"
          :option="trendChartOption"
          @tab-change="handleTrendTabChange"
        />
      </div>
      <div class="chart-col chart-col--1">
        <div class="pie-wrapper">
          <div class="pie-header">
            <span class="pie-title">能源消费结构</span>
            <el-radio-group v-model="period" size="mini" @change="handlePeriodChange">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">本年</el-radio-button>
            </el-radio-group>
          </div>
          <TrendChart :height="280" :option="pieChartOption" />
        </div>
      </div>
    </div>

    <!-- 图表行 2：24h负荷 + Top5排名 -->
    <div class="chart-row mb-lg">
      <div class="chart-col chart-col--2">
        <RealtimePower :data="loadCurveData" :height="260" />
      </div>
      <div class="chart-col chart-col--1">
        <TopConsumers :data="topConsumers" :period="period" />
      </div>
    </div>

    <!-- 最近告警 -->
    <DataTable title="最近告警" :data="recentAlarms" :pagination="false">
      <el-table-column prop="time" label="时间" min-width="160" />
      <el-table-column prop="source" label="来源" min-width="120" />
      <el-table-column prop="content" label="告警内容" min-width="180" />
      <el-table-column prop="level" label="等级" width="80">
        <template slot-scope="{ row }">
          <AlarmTag :level="row.level" :text="row.levelText" />
        </template>
      </el-table-column>
      <el-table-column prop="statusLabel" label="状态" width="80" />
    </DataTable>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'
import OrgCascader from './components/OrgCascader.vue'
import RealtimePower from './components/RealtimePower.vue'
import TopConsumers from './components/TopConsumers.vue'

export default {
  name: 'DashboardView',
  components: { KpiCard, TrendChart, DataTable, AlarmTag, OrgCascader, RealtimePower, TopConsumers },
  data() {
    return {
      selectedOrg: [],
      refreshTimer: null,
      trendTab: 'month',
      period: 'month'
    }
  },
  computed: {
    ...mapState('energy', ['dashboard', 'alarms']),
    ...mapGetters('energy', ['dashboardKpiList']),
    loadCurveData() { return this.dashboard.loadCurve },
    topConsumers() { return this.dashboard.topConsumers },
    recentAlarms() { return this.alarms.list.slice(0, 5) },
    trendChartOption() {
      const d = this.dashboard.energyTrend
      if (!d) return this.getDefaultTrendOption()
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: d.legend, bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'category', data: d.xAxis, boundaryGap: false },
        yAxis: { type: 'value', name: 'tce', nameLocation: 'middle', nameGap: 35, nameTextStyle: { fontSize: 14, color: '#595959', fontWeight: 'normal' }, axisLabel: { fontSize: 12, color: '#595959', formatter: '{value}' }, splitLine: { lineStyle: { type: 'dashed', color: '#E8E8E8' } } },
        series: d.series
      }
    },
    pieChartOption() {
      const data = this.dashboard.energyPie
      if (!data?.length) return this.getDefaultPieOption()
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} tce ({d}%)' },
        legend: { orient: 'vertical', right: 20, top: 'center' },
        series: [{
          type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 12, color: '#595959' },
          data
        }]
      }
    }
  },
  mounted() {
    this.fetchDashboardAll()
    this.startRefresh()
  },
  beforeDestroy() {
    this.stopRefresh()
  },
  methods: {
    ...mapActions('energy', ['fetchDashboardAll', 'fetchAlarms', 'fetchEnergyTrend']),
    refreshDashboard() {
      this.fetchDashboardAll()
      this.fetchAlarms({ page: 1, size: 10 })
    },
    startRefresh() {
      this.stopRefresh()
      this.refreshTimer = setInterval(() => {
        this.fetchDashboardAll()
      }, 30000)
    },
    stopRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    handlePeriodChange(period) {
      this.period = period
      this.refreshDashboard()
    },
    handleTrendTabChange(key) {
      this.trendTab = key
      this.fetchEnergyTrend(key)
    },
    toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    },
    handleKpiClick(item) {
      this.$emit('drill-down', item)
    },
    getDefaultTrendOption() {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      const cats = [
        { name:'固体燃料', color:'#4A4A4A', data:[320,302,301,334,390,330,320,280,260,310,340,350] },
        { name:'液体燃料', color:'#CD853F', data:[120,132,101,134,90,130,110,120,140,130,110,120] },
        { name:'气体燃料', color:'#2FC25B', data:[180,170,160,190,200,185,175,165,170,180,175,190] },
        { name:'电力', color:'#1890FF', data:[220,182,191,234,290,230,220,200,180,220,240,250] },
        { name:'热力', color:'#FACC14', data:[80,92,71,94,60,90,80,75,85,80,70,85] },
        { name:'其他燃料', color:'#722ED1', data:[25,22,20,28,30,25,22,18,20,24,26,28] }
      ]
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: cats.map(c => c.name), bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', name: 'tce', nameLocation: 'middle', nameGap: 35, nameTextStyle: { fontSize: 14, color: '#595959', fontWeight: 'normal' }, axisLabel: { fontSize: 12, color: '#595959', formatter: '{value}' }, splitLine: { lineStyle: { type: 'dashed', color: '#E8E8E8' } } },
        series: cats.map(c => ({ name: c.name, type: 'line', smooth: true, symbol: 'none', data: c.data, itemStyle: { color: c.color } }))
      }
    },
    getDefaultPieOption() {
      const cats = [
        { value: 3240, name: '固体燃料', color: '#4A4A4A' },
        { value: 1200, name: '液体燃料', color: '#CD853F' },
        { value: 1860, name: '气体燃料', color: '#2FC25B' },
        { value: 2560, name: '电力', color: '#1890FF' },
        { value: 880, name: '热力', color: '#FACC14' },
        { value: 260, name: '其他燃料', color: '#722ED1' }
      ]
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} tce ({d}%)' },
        legend: { orient: 'vertical', right: 20, top: 'center' },
        series: [{
          type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 12, color: '#595959' },
          data: cats.map(c => ({ value: c.value, name: c.name, itemStyle: { color: c.color } }))
        }]
      }
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.dash-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  padding: 10px $spacing-md;
  background: $background-white;
  border-radius: $card-radius;
  box-shadow: $card-shadow;

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.chart-row {
  display: flex;
  gap: $gutter;
}

.chart-col {
  &--2 { flex: 2; }
  &--1 { flex: 1; }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $gutter;
}

.pie-wrapper {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.pie-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pie-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}
</style>
