<template>
  <div class="budget-manage">
    

    <!-- 预算概览 KPI -->
    <div class="kpi-grid mb-lg">
      <KpiCard label="年度能耗预算" value="24500" unit="tce" status="default" :trend="{ value: 2.1, type: 'down' }" tip="基于上年度实际能耗下调3%制定" />
      <KpiCard label="已消耗量" value="10280" unit="tce" status="warning" :trend="{ value: 5.3, type: 'up' }" tip="截至当前累计消耗" />
      <KpiCard label="预算执行率" value="41.9" unit="%" status="default" :trend="{ value: 1.2, type: 'up' }" />
      <KpiCard label="碳排放预算" value="58200" unit="tCO₂e" status="default" :trend="{ value: 3.5, type: 'down' }" tip="年度碳排放总量控制目标" />
      <KpiCard label="碳排放已排量" value="24360" unit="tCO₂e" status="warning" :trend="{ value: 4.8, type: 'up' }" />
      <AlarmTag level="yellow" text="能耗预算消耗偏快" />
    </div>

    <!-- 筛选条件 -->
    <div class="filter-bar mb-lg">
      <TimeRangePicker v-model="budgetYear" dimension="year" @change="handleYearChange" />
      <el-select v-model="budgetScope" placeholder="预算范围" size="small" clearable>
        <el-option label="全园区" value="all" />
        <el-option label="生产车间" value="production" />
        <el-option label="辅助车间" value="auxiliary" />
        <el-option label="办公区域" value="office" />
      </el-select>
      <el-select v-model="budgetType" placeholder="预算类型" size="small" clearable>
        <el-option label="能耗预算" value="energy" />
        <el-option label="碳排放预算" value="carbon" />
        <el-option label="综合预算" value="combined" />
      </el-select>
    </div>

    <!-- 预算制定表单 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">预算制定</h3>
      <el-form ref="budgetForm" :model="budgetForm" :rules="budgetRules" label-width="130px" size="small" class="budget-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="预算年度" prop="year">
              <el-date-picker v-model="budgetForm.year" type="year" placeholder="选择年度" value-format="yyyy" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预算范围" prop="scope">
              <el-select v-model="budgetForm.scope" placeholder="请选择" style="width:100%">
                <el-option label="全园区" value="all" />
                <el-option label="生产车间" value="production" />
                <el-option label="辅助车间" value="auxiliary" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="参考基准年" prop="baseYear">
              <el-date-picker v-model="budgetForm.baseYear" type="year" placeholder="选择基准年" value-format="yyyy" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="能耗预算(tce)" prop="energyBudget">
              <el-input-number v-model="budgetForm.energyBudget" :min="0" :precision="0" :step="100" placeholder="能耗预算" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="碳排放预算(tCO₂e)" prop="carbonBudget">
              <el-input-number v-model="budgetForm.carbonBudget" :min="0" :precision="0" :step="100" placeholder="碳排放预算" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下调比例(%)">
              <el-input-number v-model="budgetForm.reductionRate" :min="-10" :max="50" :precision="1" :step="0.5" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="预算说明">
              <el-input v-model="budgetForm.remark" type="textarea" :rows="2" placeholder="请输入预算制定说明" />
            </el-form-item>
          </el-col>
          <el-col :span="8" class="form-actions">
            <el-button type="primary" icon="el-icon-check" @click="handleSubmitBudget">提交预算</el-button>
            <el-button icon="el-icon-refresh" @click="handleAutoCalc">智能测算</el-button>
          </el-col>
        </el-row>
      </el-form>
      <!-- 历史参考数据 -->
      <div class="history-ref">
        <span class="ref-label">参考历史数据：</span>
        <span v-for="item in historyRef" :key="item.year" class="ref-item">
          {{ item.year }}年 实际 <span class="font-d-din">{{ item.actual }}</span> tce / 预算 <span class="font-d-din">{{ item.budget }}</span> tce
        </span>
      </div>
    </div>

    <!-- 预算执行仪表盘 -->
    <div class="gauge-row mb-lg">
      <div class="section-card gauge-card">
        <h3 class="section-title">能耗预算执行</h3>
        <div ref="energyGauge" class="gauge-chart"></div>
        <div class="gauge-detail">
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">预算额度</span>
            <span class="gauge-detail__value font-d-din">24,500 <small>tce</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">已消耗</span>
            <span class="gauge-detail__value font-d-din">10,280 <small>tce</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">剩余</span>
            <span class="gauge-detail__value font-d-din">14,220 <small>tce</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">月均消耗</span>
            <span class="gauge-detail__value font-d-din">1,713 <small>tce</small></span>
          </div>
        </div>
      </div>
      <div class="section-card gauge-card">
        <h3 class="section-title">碳排放预算执行</h3>
        <div ref="carbonGauge" class="gauge-chart"></div>
        <div class="gauge-detail">
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">预算额度</span>
            <span class="gauge-detail__value font-d-din">58,200 <small>tCO₂e</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">已排放</span>
            <span class="gauge-detail__value font-d-din">24,360 <small>tCO₂e</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">剩余</span>
            <span class="gauge-detail__value font-d-din">33,840 <small>tCO₂e</small></span>
          </div>
          <div class="gauge-detail__item">
            <span class="gauge-detail__label">月均排放</span>
            <span class="gauge-detail__value font-d-din">4,060 <small>tCO₂e</small></span>
          </div>
        </div>
      </div>
      <div class="section-card gauge-card">
        <h3 class="section-title">各部门执行进度</h3>
        <div class="progress-list">
          <div v-for="dept in deptProgress" :key="dept.name" class="progress-item">
            <div class="progress-item__header">
              <span class="progress-item__name">{{ dept.name }}</span>
              <span class="progress-item__pct font-d-din">{{ dept.percent }}%</span>
            </div>
            <el-progress :percentage="dept.percent" :color="dept.color" :stroke-width="8" :show-text="false" />
            <div class="progress-item__sub">
              <span>{{ dept.used }} / {{ dept.total }} {{ dept.unit }}</span>
              <AlarmTag v-if="dept.alarm" :level="dept.alarm" :text="dept.alarmText" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预测预警图表 -->
    <TrendChart
      title="预算执行预测与预警"
      :height="360"
      :tabs="[{ key: 'energy', label: '能耗' }, { key: 'carbon', label: '碳排放' }]"
      :option="forecastOption"
      class="mb-lg"
      @tab-change="handleForecastTabChange"
    />

    <!-- 预算执行明细 -->
    <DataTable title="预算执行明细" :data="budgetDetailData" :total="50" :exportable="true" @page-change="handlePageChange" @export="handleExport">
      <el-table-column prop="department" label="部门" min-width="120" align="center" />
      <el-table-column prop="energyBudget" label="能耗预算(tce)" min-width="130" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.energyBudget }}</span></template>
      </el-table-column>
      <el-table-column prop="energyUsed" label="已消耗(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.energyUsed }}</span></template>
      </el-table-column>
      <el-table-column prop="energyPct" label="执行率" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span :class="['pct-tag', row.energyPct > 80 ? 'pct-tag--warn' : '']">{{ row.energyPct }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="carbonBudget" label="碳预算(tCO₂e)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.carbonBudget }}</span></template>
      </el-table-column>
      <el-table-column prop="carbonUsed" label="已排放(tCO₂e)" min-width="130" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.carbonUsed }}</span></template>
      </el-table-column>
      <el-table-column prop="carbonPct" label="执行率" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span :class="['pct-tag', row.carbonPct > 80 ? 'pct-tag--warn' : '']">{{ row.carbonPct }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template slot-scope="{ row }"><AlarmTag :level="row.statusLevel" :text="row.status" /></template>
      </el-table-column>
    </DataTable>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'
import TimeRangePicker from '@/components/TimeRangePicker.vue'

export default {
  name: 'BudgetManage',
  components: { KpiCard, TrendChart, DataTable, AlarmTag, TimeRangePicker },
  data() {
    return {
      budgetYear: '',
      budgetScope: '',
      budgetType: '',
      budgetForm: {
        year: '2026',
        scope: 'all',
        baseYear: '2025',
        energyBudget: 24500,
        carbonBudget: 58200,
        reductionRate: 3.0,
        remark: ''
      },
      budgetRules: {
        year: [{ required: true, message: '请选择预算年度', trigger: 'change' }],
        scope: [{ required: true, message: '请选择预算范围', trigger: 'change' }],
        energyBudget: [{ required: true, message: '请输入能耗预算', trigger: 'blur' }],
        carbonBudget: [{ required: true, message: '请输入碳排放预算', trigger: 'blur' }]
      },
      historyRef: [
        { year: 2023, actual: '26,180', budget: '26,500' },
        { year: 2024, actual: '25,320', budget: '26,000' },
        { year: 2025, actual: '25,258', budget: '25,500' }
      ],
      deptProgress: [
        { name: '生产车间一', percent: 42, color: '#1890FF', used: '3,360', total: '8,000', unit: 'tce', alarm: null, alarmText: '' },
        { name: '生产车间二', percent: 48, color: '#1890FF', used: '3,360', total: '7,000', unit: 'tce', alarm: null, alarmText: '' },
        { name: '锅炉工段', percent: 55, color: '#FAAD14', used: '2,200', total: '4,000', unit: 'tce', alarm: 'yellow', alarmText: '偏快' },
        { name: '辅助车间', percent: 38, color: '#52C41A', used: '760', total: '2,000', unit: 'tce', alarm: null, alarmText: '' },
        { name: '办公区域', percent: 35, color: '#52C41A', used: '560', total: '1,600', unit: 'tce', alarm: null, alarmText: '' },
        { name: '压缩工段', percent: 62, color: '#FF4D4F', used: '1,100', total: '1,900', unit: 'tce', alarm: 'red', alarmText: '超预算预警' }
      ],
      budgetDetailData: [
        { department: '生产车间一', energyBudget: '8,000', energyUsed: '3,360', energyPct: 42, carbonBudget: '19,000', carbonUsed: '7,980', carbonPct: 42, status: '正常', statusLevel: 'blue' },
        { department: '生产车间二', energyBudget: '7,000', energyUsed: '3,360', energyPct: 48, carbonBudget: '16,600', carbonUsed: '7,968', carbonPct: 48, status: '正常', statusLevel: 'blue' },
        { department: '锅炉工段', energyBudget: '4,000', energyUsed: '2,200', energyPct: 55, carbonBudget: '9,500', carbonUsed: '5,225', carbonPct: 55, status: '关注', statusLevel: 'yellow' },
        { department: '压缩工段', energyBudget: '1,900', energyUsed: '1,178', energyPct: 62, carbonBudget: '4,500', carbonUsed: '2,790', carbonPct: 62, status: '预警', statusLevel: 'red' },
        { department: '辅助车间', energyBudget: '2,000', energyUsed: '760', energyPct: 38, carbonBudget: '4,750', carbonUsed: '1,805', carbonPct: 38, status: '正常', statusLevel: 'blue' },
        { department: '办公区域', energyBudget: '1,600', energyUsed: '560', energyPct: 35, carbonBudget: '3,850', carbonUsed: '1,347', carbonPct: 35, status: '正常', statusLevel: 'blue' }
      ],
      forecastType: 'energy',
      energyGaugeChart: null,
      carbonGaugeChart: null
    }
  },
  computed: {
    forecastOption() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const actualData = [2050, 1980, 2120, 2010, 2120, null, null, null, null, null, null, null]
      const forecastData = [null, null, null, null, null, 2080, 2150, 2200, 2100, 2050, 1980, 1930]
      const budgetLine = Array(12).fill(2042)
      const warningLine = Array(12).fill(2450)
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际消耗', '预测趋势', '月均预算线', '预警线'], bottom: 0 },
        grid: { top: 30, right: 30, bottom: 50, left: 80 },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', name: this.forecastType === 'energy' ? 'tce' : 'tCO₂e', nameTextStyle: { fontSize: 12 }, axisLabel: { fontSize: 11 } },
        series: [
          {
            name: '实际消耗',
            type: 'line',
            smooth: true,
            data: actualData,
            itemStyle: { color: '#1890FF' },
            areaStyle: { color: 'rgba(24,144,255,0.08)' }
          },
          {
            name: '预测趋势',
            type: 'line',
            smooth: true,
            data: forecastData,
            lineStyle: { type: 'dashed' },
            itemStyle: { color: '#1890FF' }
          },
          {
            name: '月均预算线',
            type: 'line',
            data: budgetLine,
            lineStyle: { type: 'dotted', color: '#52C41A', width: 2 },
            itemStyle: { color: '#52C41A' },
            symbol: 'none'
          },
          {
            name: '预警线',
            type: 'line',
            data: warningLine,
            lineStyle: { type: 'dashed', color: '#FF4D4F', width: 2 },
            itemStyle: { color: '#FF4D4F' },
            symbol: 'none',
            markArea: {
              silent: true,
              data: [[
                { yAxis: 2450, itemStyle: { color: 'rgba(255,77,79,0.05)' } },
                { yAxis: 3000 }
              ]]
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.initGaugeCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.energyGaugeChart) this.energyGaugeChart.dispose()
    if (this.carbonGaugeChart) this.carbonGaugeChart.dispose()
  },
  methods: {
    initGaugeCharts() {
      this.energyGaugeChart = echarts.init(this.$refs.energyGauge)
      this.carbonGaugeChart = echarts.init(this.$refs.carbonGauge)
      this.renderGauge(this.energyGaugeChart, 41.9, '能耗预算执行率', '#1890FF')
      this.renderGauge(this.carbonGaugeChart, 41.8, '碳排放预算执行率', '#52C41A')
    },
    renderGauge(chart, value, title, color) {
      chart.setOption({
        series: [{
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          radius: '90%',
          center: ['50%', '55%'],
          min: 0,
          max: 100,
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 16,
              color: [
                [0.6, '#52C41A'],
                [0.8, '#FAAD14'],
                [1, '#FF4D4F']
              ]
            }
          },
          pointer: {
            width: 4,
            length: '60%',
            itemStyle: { color: color }
          },
          axisTick: { distance: -16, length: 6, lineStyle: { color: '#fff', width: 1 } },
          splitLine: { distance: -16, length: 12, lineStyle: { color: '#fff', width: 2 } },
          axisLabel: { distance: 24, color: '#999', fontSize: 11 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 20,
            fontFamily: 'D-DIN',
            offsetCenter: [0, '70%'],
            color: color
          },
          title: { offsetCenter: [0, '92%'], fontSize: 12, color: '#999' },
          data: [{ value: value, name: title }]
        }]
      })
    },
    handleResize() {
      if (this.energyGaugeChart) this.energyGaugeChart.resize()
      if (this.carbonGaugeChart) this.carbonGaugeChart.resize()
    },
    handleYearChange() {},
    handleForecastTabChange(key) {
      this.forecastType = key
    },
    handleSubmitBudget() {
      this.$refs.budgetForm.validate(valid => {
        if (valid) {
          this.$message.success('预算方案已提交审核')
        }
      })
    },
    handleAutoCalc() {
      const base = 25258
      const rate = this.budgetForm.reductionRate || 0
      this.budgetForm.energyBudget = Math.round(base * (1 - rate / 100))
      this.budgetForm.carbonBudget = Math.round(this.budgetForm.energyBudget * 2.376)
      this.$message.success('已根据历史数据智能测算预算额度')
    },
    handlePageChange() {},
    handleExport() {}
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

.section-card {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.section-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.budget-form {
  max-width: 100%;
}

.form-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-bottom: 4px;
  gap: 8px;
}

.history-ref {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: $spacing-md;
  border-top: 1px solid $divider-color;
  margin-top: $spacing-md;

  .ref-label {
    font-size: $font-size-12;
    color: $text-secondary;
    white-space: nowrap;
  }

  .ref-item {
    font-size: $font-size-12;
    color: $text-placeholder;

    .font-d-din {
      color: $text-regular;
    }
  }
}

.gauge-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $gutter;
}

.gauge-card {
  .gauge-chart {
    height: 220px;
  }
}

.gauge-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid $divider-color;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: $font-size-12;
    color: $text-placeholder;
  }

  &__value {
    font-size: $font-size-16;
    color: $text-primary;

    small {
      font-size: $font-size-12;
      color: $text-secondary;
      font-family: $font-body;
    }
  }
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__name {
    font-size: $font-size-14;
    color: $text-regular;
  }

  &__pct {
    font-size: $font-size-14;
    color: $text-primary;
  }

  &__sub {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    font-size: $font-size-12;
    color: $text-placeholder;
  }
}

.pct-tag {
  font-family: $font-d-din;
  font-size: $font-size-14;
  color: $text-primary;

  &--warn {
    color: $warning-color;
    font-weight: 600;
  }
}
</style>
