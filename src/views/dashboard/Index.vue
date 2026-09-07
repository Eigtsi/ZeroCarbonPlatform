<template>
  <div class="dashboard">
    

    <!-- 核心 KPI 指标卡片 -->
    <div class="kpi-grid mb-lg">
      <KpiCard label="当日总能耗" :value="kpiData.todayEnergy" unit="tce" status="default" :trend="kpiData.todayTrend" trend-label="同比昨日" />
      <KpiCard label="当月累计能耗" :value="kpiData.monthEnergy" unit="tce" status="success" :trend="kpiData.monthTrend" trend-label="同比上月" />
      <KpiCard label="当年累计能耗" :value="kpiData.yearEnergy" unit="tce" status="default" :trend="kpiData.yearTrend" trend-label="同比去年" />
      <KpiCard label="碳排放总量" :value="kpiData.totalCarbon" unit="tCO₂e" status="warning" :trend="kpiData.carbonTrend" />
      <KpiCard label="碳配额余量" :value="kpiData.quotaRemain" unit="tCEA" status="danger" tip="剩余可用碳配额" />
      <KpiCard label="能耗强度" :value="kpiData.intensity" unit="tce/万元" status="default" :trend="kpiData.intensityTrend" />
      <KpiCard label="清洁能源占比" :value="kpiData.cleanRatio" unit="%" status="success" />
      <KpiCard label="活跃告警" :value="kpiData.alarmCount" unit="条" status="danger" />
    </div>

    <!-- 图表区域 -->
    <div class="chart-row mb-lg">
      <div class="chart-col chart-col--2">
        <TrendChart
          title="能耗趋势总览"
          :height="320"
          :tabs="[{ key: 'month', label: '月' }, { key: 'quarter', label: '季' }, { key: 'year', label: '年' }]"
          :option="energyTrendOption"
        />
      </div>
      <div class="chart-col chart-col--1">
        <TrendChart title="碳排放构成" :height="320" :option="carbonPieOption" />
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="bottom-row">
      <div class="bottom-col bottom-col--2">
        <DataTable title="最近告警" :data="alarmList" :pagination="false">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="source" label="来源" width="120" />
          <el-table-column prop="content" label="告警内容" />
          <el-table-column prop="level" label="等级" width="80">
            <template slot-scope="{ row }">
              <AlarmTag :level="row.level" :text="row.levelText" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="{ row }">
              <span :class="['status-dot', row.status === '处理中' ? 'processing' : 'pending']"></span>
              {{ row.status }}
            </template>
          </el-table-column>
        </DataTable>
      </div>
      <div class="bottom-col bottom-col--1">
        <div class="budget-overview">
          <h3 class="section-title">预算执行进度</h3>
          <div v-for="item in budgetProgress" :key="item.name" class="budget-item">
            <div class="budget-header">
              <span class="budget-name">{{ item.name }}</span>
              <span class="budget-percent font-d-din">{{ item.percent }}%</span>
            </div>
            <el-progress :percentage="item.percent" :color="item.color" :stroke-width="8" :show-text="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'

export default {
  name: 'DashboardIndex',
  components: { KpiCard, TrendChart, DataTable, AlarmTag },
  data() {
    return {
      kpiData: {
        todayEnergy: 156.82,
        todayTrend: { value: 3.2, type: 'up' },
        monthEnergy: 3856.45,
        monthTrend: { value: 2.1, type: 'down' },
        yearEnergy: 42568.30,
        yearTrend: { value: 5.6, type: 'down' },
        totalCarbon: 12856.50,
        carbonTrend: { value: 4.3, type: 'down' },
        quotaRemain: 2340.00,
        intensity: 0.38,
        intensityTrend: { value: 6.2, type: 'down' },
        cleanRatio: 35.8,
        alarmCount: 7
      },
      alarmList: [
        { time: '2026-05-13 08:30', source: '锅炉房A', content: '煤炭消耗量突增30%，超出日阈值', level: 'red', levelText: '预警', status: '处理中' },
        { time: '2026-05-13 07:15', source: '压缩机房', content: '设备空载运行超过2小时', level: 'yellow', levelText: '提醒', status: '待处理' },
        { time: '2026-05-12 22:40', source: '配电室B', content: '用电量较昨日同期下降15%', level: 'blue', levelText: '稳定', status: '处理中' },
        { time: '2026-05-12 18:20', source: '车间三', content: '蒸汽管网压力异常', level: 'red', levelText: '预警', status: '待处理' },
        { time: '2026-05-12 14:05', source: '水泵房', content: '水泵效率低于基准值8%', level: 'yellow', levelText: '提醒', status: '处理中' }
      ],
      budgetProgress: [
        { name: '用能预算', percent: 68, color: '#1890FF' },
        { name: '碳排放预算', percent: 72, color: '#52C41A' },
        { name: '煤炭配额', percent: 85, color: '#FAAD14' },
        { name: '电力预算', percent: 54, color: '#1890FF' }
      ]
    }
  },
  computed: {
    energyTrendOption() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['煤炭', '天然气', '电力', '蒸汽'], bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', name: 'tce', nameTextStyle: { fontSize: 12 }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: '煤炭', type: 'line', smooth: true, data: [320, 302, 301, 334, 390, 330, 320, 280, 260, 310, 340, 350], itemStyle: { color: '#8B572A' } },
          { name: '天然气', type: 'line', smooth: true, data: [120, 132, 101, 134, 90, 130, 110, 120, 140, 130, 110, 120], itemStyle: { color: '#2FC25B' } },
          { name: '电力', type: 'line', smooth: true, data: [220, 182, 191, 234, 290, 230, 220, 200, 180, 220, 240, 250], itemStyle: { color: '#1890FF' } },
          { name: '蒸汽', type: 'line', smooth: true, data: [80, 92, 71, 94, 60, 90, 80, 75, 85, 80, 70, 85], itemStyle: { color: '#FACC14' } }
        ]
      }
    },
    carbonPieOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂e ({d}%)' },
        legend: { orient: 'vertical', right: 20, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14 } },
          data: [
            { value: 5240, name: '范围1-直接排放', itemStyle: { color: '#FF6B6B' } },
            { value: 4860, name: '范围2-电力热力', itemStyle: { color: '#FACC14' } },
            { value: 2756, name: '范围3-上下游', itemStyle: { color: '#1890FF' } }
          ]
        }]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-row {
  display: flex;
  gap: $gutter;
}

.chart-col {
  &--2 { flex: 2; }
  &--1 { flex: 1; }
}

.bottom-row {
  display: flex;
  gap: $gutter;
}

.bottom-col {
  &--2 { flex: 2; }
  &--1 { flex: 1; }
}

.budget-overview {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.section-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
  margin-bottom: 16px;
}

.budget-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.budget-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.budget-name {
  font-size: $font-size-14;
  color: $text-regular;
}

.budget-percent {
  font-family: $font-d-din;
  font-size: $font-size-14;
  color: $text-primary;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;

  &.processing { background: $primary-color; }
  &.pending { background: $warning-color; }
}
</style>
