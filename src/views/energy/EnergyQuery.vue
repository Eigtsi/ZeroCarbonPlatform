<template>
  <div class="energy-query">
    

    <!-- 实时能耗面板 -->
    <div class="kpi-grid mb-lg">
      <KpiCard v-for="item in realtimeKpi" :key="item.key" :label="item.label" :value="item.today" :unit="item.unit" :status="item.status" :trend="item.trend" trend-label="同比昨日" />
    </div>

    <!-- 筛选条件 -->
    <div class="filter-bar">
      <TimeRangePicker v-model="queryDate" dimension="month" @change="handleQuery" />
      <el-select v-model="queryDevice" placeholder="选择设备" size="small" clearable>
        <el-option v-for="d in deviceList" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <el-select v-model="querySection" placeholder="选择工段" size="small" clearable>
        <el-option v-for="s in sectionList" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">查询</el-button>
    </div>

    <!-- 能耗趋势图 -->
    <TrendChart
      title="能耗趋势"
      :height="320"
      :tabs="[{ key: 'day', label: '日' }, { key: 'month', label: '月' }]"
      :option="trendOption"
      class="mb-lg"
      @tab-change="handleTrendTabChange"
    />

    <!-- 同比环比分析 -->
    <div class="compare-row mb-lg">
      <CompareCard v-for="item in compareData" :key="item.label" :label="item.label" :current="item.current" :compare="item.compare" :unit="item.unit" :compare-label="item.compareLabel" />
    </div>

    <!-- 历史数据表格 -->
    <DataTable title="历史能耗数据" :data="historyData" :total="100" :exportable="true" @page-change="handlePageChange" @export="handleExport">
      <el-table-column prop="date" label="日期" min-width="120" align="center" sortable />
      <el-table-column prop="section" label="工段" min-width="100" align="center" />
      <el-table-column prop="device" label="设备" min-width="120" align="center" />
      <el-table-column prop="coal" label="煤炭(t)" min-width="100" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.coal }}</span></template>
      </el-table-column>
      <el-table-column prop="gas" label="天然气(m³)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.gas }}</span></template>
      </el-table-column>
      <el-table-column prop="electricity" label="电(kWh)" min-width="110" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.electricity }}</span></template>
      </el-table-column>
      <el-table-column prop="steam" label="蒸汽(t)" min-width="100" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.steam }}</span></template>
      </el-table-column>
      <el-table-column prop="totalTce" label="折标煤(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.totalTce }}</span></template>
      </el-table-column>
    </DataTable>

    <!-- 异常告警列表 -->
    <DataTable title="异常告警" :data="alarmData" :pagination="false" class="mt-lg">
      <el-table-column prop="time" label="时间" min-width="160" align="center" />
      <el-table-column prop="source" label="来源" min-width="120" align="center" />
      <el-table-column prop="content" label="告警内容" min-width="160" align="center" />
      <el-table-column prop="level" label="等级" width="80" align="center">
        <template slot-scope="{ row }"><AlarmTag :level="row.level" :text="row.levelText" /></template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="handleAlarmDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </DataTable>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import CompareCard from '@/components/CompareCard.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'
import TimeRangePicker from '@/components/TimeRangePicker.vue'

export default {
  name: 'EnergyQuery',
  components: { KpiCard, TrendChart, CompareCard, DataTable, AlarmTag, TimeRangePicker },
  data() {
    return {
      queryDate: '',
      queryDevice: '',
      querySection: '',
      deviceList: [
        { label: '1号锅炉', value: 'boiler_1' },
        { label: '2号锅炉', value: 'boiler_2' },
        { label: '空气压缩机', value: 'compressor' },
        { label: '循环水泵', value: 'pump' }
      ],
      sectionList: [
        { label: '锅炉工段', value: 'section_a' },
        { label: '压缩工段', value: 'section_b' },
        { label: '生产车间一', value: 'workshop_1' },
        { label: '生产车间二', value: 'workshop_2' }
      ],
      realtimeKpi: [
        { key: 'coal', label: '煤炭消耗', today: 45.60, unit: 't', status: 'default', trend: { value: 2.3, type: 'up' } },
        { key: 'gas', label: '天然气消耗', today: 3200, unit: 'm³', status: 'success', trend: { value: 1.5, type: 'down' } },
        { key: 'electricity', label: '电力消耗', today: 12580, unit: 'kWh', status: 'default', trend: { value: 3.1, type: 'up' } },
        { key: 'steam', label: '蒸汽消耗', today: 18.50, unit: 't', status: 'warning', trend: { value: 0.8, type: 'down' } }
      ],
      compareData: [
        { label: '煤炭消耗同比', current: 45.60, compare: 42.80, unit: 't', compareLabel: '去年同期' },
        { label: '天然气消耗同比', current: 3200, compare: 3500, unit: 'm³', compareLabel: '去年同期' },
        { label: '电力消耗同比', current: 12580, compare: 11800, unit: 'kWh', compareLabel: '去年同期' },
        { label: '综合能耗环比', current: 156.82, compare: 162.30, unit: 'tce', compareLabel: '上月同期' }
      ],
      historyData: [
        { date: '2026-05-13', section: '锅炉工段', device: '1号锅炉', coal: 12.50, gas: 800, electricity: 3200, steam: 5.20, totalTce: 18.60 },
        { date: '2026-05-13', section: '压缩工段', device: '空气压缩机', coal: 0, gas: 0, electricity: 4500, steam: 0, totalTce: 0.55 },
        { date: '2026-05-13', section: '生产车间一', device: '生产线A', coal: 8.20, gas: 1200, electricity: 2800, steam: 6.80, totalTce: 20.50 },
        { date: '2026-05-12', section: '锅炉工段', device: '1号锅炉', coal: 13.10, gas: 850, electricity: 3100, steam: 5.60, totalTce: 19.20 },
        { date: '2026-05-12', section: '压缩工段', device: '空气压缩机', coal: 0, gas: 0, electricity: 4200, steam: 0, totalTce: 0.52 }
      ],
      alarmData: [
        { time: '2026-05-13 08:30', source: '锅炉房A', content: '煤炭消耗量突增30%', level: 'red', levelText: '预警' },
        { time: '2026-05-13 07:15', source: '压缩机房', content: '设备空载运行超过2小时', level: 'yellow', levelText: '提醒' }
      ]
    }
  },
  computed: {
    trendOption() {
      const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['煤炭', '天然气', '电力', '蒸汽'], bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value', name: 'tce', nameTextStyle: { fontSize: 12 }, axisLabel: { fontSize: 11 } },
        series: [
          { name: '煤炭', type: 'line', smooth: true, data: Array.from({ length: 30 }, () => (Math.random() * 5 + 10).toFixed(1)), itemStyle: { color: '#8B572A' } },
          { name: '电力', type: 'line', smooth: true, data: Array.from({ length: 30 }, () => (Math.random() * 2 + 3).toFixed(1)), itemStyle: { color: '#1890FF' } }
        ]
      }
    }
  },
  methods: {
    handleQuery() {},
    handleTrendTabChange() {},
    handlePageChange() {},
    handleExport() {},
    handleAlarmDetail(row) {
      this.$message.info(`查看告警详情：${row.content}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $background-white;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
}

.compare-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
}
</style>
