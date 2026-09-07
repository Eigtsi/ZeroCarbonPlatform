<template>
  <div class="carbon-footprint">
    

    <!-- 产品选择器 -->
    <div class="filter-bar mb-lg">
      <el-select v-model="selectedProduct" placeholder="选择核算产品" size="small" filterable style="width:240px" @change="handleProductChange">
        <el-option v-for="p in productList" :key="p.value" :label="p.label" :value="p.value" />
      </el-select>
      <TimeRangePicker v-model="footprintYear" dimension="year" @change="handleYearChange" />
      <el-select v-model="functionalUnit" placeholder="功能单位" size="small" style="width:160px">
        <el-option label="吨产品(t)" value="t" />
        <el-option label="千克产品(kg)" value="kg" />
        <el-option label="立方米(m³)" value="m3" />
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-data-analysis" @click="handleCalc">开始核算</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>

    <!-- LCA 阶段展示 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">生命周期阶段 (LCA)</h3>
      <div class="lca-flow">
        <div
          v-for="(stage, index) in lcaStages"
          :key="stage.key"
          :class="['lca-stage', { 'lca-stage--active': activeStage === stage.key }]"
          @click="activeStage = stage.key"
        >
          <div class="lca-stage__icon">
            <i :class="stage.icon"></i>
          </div>
          <div class="lca-stage__name">{{ stage.name }}</div>
          <div class="lca-stage__value font-d-din">{{ stage.value }}</div>
          <div class="lca-stage__unit">kgCO₂e/{{ functionalUnit === 't' ? 't' : 'kg' }}</div>
          <div class="lca-stage__pct">{{ stage.pct }}%</div>
          <div v-if="index < lcaStages.length - 1" class="lca-stage__arrow">
            <i class="el-icon-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 核算结果卡片 + 饼图 -->
    <div class="result-row mb-lg">
      <div class="section-card result-card">
        <h3 class="section-title">碳足迹结果</h3>
        <div class="footprint-result">
          <div class="footprint-main">
            <span class="footprint-value font-d-din">{{ footprintValue }}</span>
            <span class="footprint-unit">tCO₂e/{{ functionalUnit === 't' ? 't' : 'kg' }}</span>
          </div>
          <div class="footprint-compare">
            <CompareCard label="与上期对比" :current="footprintValue" :compare="prevFootprint" unit="tCO₂e/t" compare-label="上期" />
          </div>
          <div class="footprint-tags">
            <AlarmTag level="yellow" :text="`较行业基准高 ${benchmarkDiff}%`" />
          </div>
        </div>
        <div class="footprint-breakdown">
          <div v-for="item in scopeBreakdown" :key="item.label" class="breakdown-item">
            <span class="breakdown-label">{{ item.label }}</span>
            <el-progress :percentage="item.pct" :stroke-width="8" :color="item.color" :show-text="false" />
            <span class="breakdown-value font-d-din">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <div class="section-card chart-card">
        <h3 class="section-title">范围分解</h3>
        <div ref="scopePie" class="scope-pie-chart"></div>
      </div>
      <div class="section-card chart-card">
        <h3 class="section-title">敏感性分析</h3>
        <div ref="sensitivityBar" class="sensitivity-chart"></div>
      </div>
    </div>

    <!-- LCA 明细表 -->
    <DataTable :title="`产品碳足迹明细 - ${currentProductName}`" :data="footprintDetail" :pagination="false" :exportable="true" class="mb-lg" @export="handleExport">
      <el-table-column prop="stage" label="生命周期阶段" min-width="140" align="center" />
      <el-table-column prop="process" label="工序/活动" min-width="160" align="center" />
      <el-table-column prop="input" label="输入物料/能源" min-width="140" align="center" />
      <el-table-column prop="amount" label="活动量" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" min-width="80" align="center" />
      <el-table-column prop="factor" label="排放因子" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.factor }}</span></template>
      </el-table-column>
      <el-table-column prop="emission" label="排放量(kgCO₂e)" min-width="150" align="center">
        <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
      </el-table-column>
      <el-table-column prop="pct" label="占比" min-width="80" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.pct }}%</span></template>
      </el-table-column>
    </DataTable>

    <!-- 改进建议 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">减排改进建议</h3>
      <div class="suggestion-grid">
        <div v-for="item in suggestions" :key="item.title" class="suggestion-item">
          <div class="suggestion-item__header">
            <i :class="item.icon" :style="{ color: item.color }"></i>
            <span class="suggestion-item__title">{{ item.title }}</span>
          </div>
          <div class="suggestion-item__desc">{{ item.desc }}</div>
          <div class="suggestion-item__impact">
            <span class="impact-label">减排潜力：</span>
            <span class="impact-value font-d-din">{{ item.reduction }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 报告生成 -->
    <div class="section-card">
      <div class="report-bar">
        <div class="report-info">
          <h3 class="section-title" style="margin-bottom:0;">产品碳足迹报告</h3>
          <span class="report-desc">按照 ISO 14067 / PAS 2050 标准生成</span>
        </div>
        <div class="report-actions">
          <el-select v-model="reportFormat" size="small" style="width:120px">
            <el-option label="PDF" value="pdf" />
            <el-option label="Word" value="docx" />
            <el-option label="Excel" value="xlsx" />
          </el-select>
          <el-button type="primary" icon="el-icon-document" size="small" @click="handleGenReport">生成报告</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import DataTable from '@/components/DataTable.vue'
import CompareCard from '@/components/CompareCard.vue'
import AlarmTag from '@/components/AlarmTag.vue'
import TimeRangePicker from '@/components/TimeRangePicker.vue'

export default {
  name: 'CarbonFootprint',
  components: { DataTable, CompareCard, AlarmTag, TimeRangePicker },
  data() {
    return {
      selectedProduct: 'cement_42.5',
      footprintYear: '',
      functionalUnit: 't',
      activeStage: 'raw',
      reportFormat: 'pdf',
      productList: [
        { label: 'P·O42.5 水泥', value: 'cement_42.5' },
        { label: 'P·O32.5 水泥', value: 'cement_32.5' },
        { label: '特种水泥', value: 'cement_special' },
        { label: '商品混凝土 C30', value: 'concrete_c30' },
        { label: '商品混凝土 C40', value: 'concrete_c40' }
      ],
      lcaStages: [
        { key: 'raw', name: '原材料获取', icon: 'el-icon-box', value: '85.2', pct: 21.5 },
        { key: 'production', name: '生产制造', icon: 'el-icon-s-tools', value: '246.8', pct: 62.3 },
        { key: 'transport', name: '运输配送', icon: 'el-icon-truck', value: '32.5', pct: 8.2 },
        { key: 'usage', name: '使用阶段', icon: 'el-icon-s-flag', value: '18.6', pct: 4.7 },
        { key: 'disposal', name: '废弃处理', icon: 'el-icon-delete', value: '12.9', pct: 3.3 }
      ],
      scopeBreakdown: [
        { label: 'Scope 1 直接排放', value: '186.5', pct: 47.1, color: '#FF6B6B' },
        { label: 'Scope 2 能源间接', value: '128.3', pct: 32.4, color: '#4ECDC4' },
        { label: 'Scope 3 其他间接', value: '81.2', pct: 20.5, color: '#45B7D1' }
      ],
      footprintDetail: [
        { stage: '原材料获取', process: '石灰石开采', input: '石灰石', amount: '1,050', unit: 'kg', factor: '0.0215', emission: '22.58', pct: 5.7 },
        { stage: '原材料获取', process: '黏土开采', input: '黏土', amount: '180', unit: 'kg', factor: '0.0082', emission: '1.48', pct: 0.4 },
        { stage: '原材料获取', process: '石膏采购', input: '石膏', amount: '45', unit: 'kg', factor: '0.0250', emission: '1.13', pct: 0.3 },
        { stage: '原材料获取', process: '原料运输', input: '柴油', amount: '580', unit: 't·km', factor: '0.1035', emission: '60.01', pct: 15.2 },
        { stage: '生产制造', process: '生料粉磨', input: '电力', amount: '28.5', unit: 'kWh', factor: '0.5810', emission: '16.56', pct: 4.2 },
        { stage: '生产制造', process: '熟料煅烧', input: '煤炭', amount: '115', unit: 'kg', factor: '2.4932', emission: '286.72', pct: 28.6 },
        { stage: '生产制造', process: '熟料煅烧(工艺)', input: '石灰石', amount: '520', unit: 'kg', factor: '0.4400', emission: '228.80', pct: 22.9 },
        { stage: '生产制造', process: '水泥粉磨', input: '电力', amount: '35.2', unit: 'kWh', factor: '0.5810', emission: '20.45', pct: 5.2 },
        { stage: '运输配送', process: '产品运输', input: '柴油', amount: '320', unit: 't·km', factor: '0.1035', emission: '32.50', pct: 8.2 },
        { stage: '使用阶段', process: '建筑施工', input: '电力', amount: '8.5', unit: 'kWh', factor: '0.5810', emission: '4.94', pct: 1.2 },
        { stage: '使用阶段', process: '碳化吸收(负值)', input: 'CO₂吸收', amount: '-12.8', unit: 'kg', factor: '1.0000', emission: '-12.80', pct: -3.2 },
        { stage: '废弃处理', process: '建筑拆除', input: '柴油', amount: '25', unit: 'L', factor: '2.6174', emission: '12.90', pct: 3.3 }
      ],
      suggestions: [
        { title: '替代燃料应用', desc: '使用生活垃圾衍生燃料(SRF)替代部分煤炭，降低化石碳排放', icon: 'el-icon-open', color: '#52C41A', reduction: 15.2 },
        { title: '熟料替代', desc: '提高矿渣、粉煤灰等混合材掺量，减少熟料用量', icon: 'el-icon-s-cooperation', color: '#1890FF', reduction: 12.8 },
        { title: '工艺优化', desc: '优化预热器系统，提高热回收效率，降低单位煤耗', icon: 'el-icon-setting', color: '#FAAD14', reduction: 8.5 },
        { title: '绿电采购', desc: '增加可再生能源电力采购比例，降低Scope 2排放', icon: 'el-icon-lightning', color: '#722ED1', reduction: 6.3 }
      ],
      scopePieChart: null,
      sensitivityChart: null
    }
  },
  computed: {
    currentProductName() {
      const p = this.productList.find(item => item.value === this.selectedProduct)
      return p ? p.label : ''
    },
    footprintValue() {
      return 396.0
    },
    prevFootprint() {
      return 408.5
    },
    benchmarkDiff() {
      return 5.8
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.scopePieChart) this.scopePieChart.dispose()
    if (this.sensitivityChart) this.sensitivityChart.dispose()
  },
  methods: {
    initCharts() {
      this.scopePieChart = echarts.init(this.$refs.scopePie)
      this.sensitivityChart = echarts.init(this.$refs.sensitivityBar)
      this.renderScopePie()
      this.renderSensitivityBar()
    },
    renderScopePie() {
      this.scopePieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} kgCO₂e ({d}%)' },
        legend: { bottom: 0, data: ['Scope 1', 'Scope 2', 'Scope 3'] },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{d}%' },
          data: [
            { value: 186.5, name: 'Scope 1', itemStyle: { color: '#FF6B6B' } },
            { value: 128.3, name: 'Scope 2', itemStyle: { color: '#4ECDC4' } },
            { value: 81.2, name: 'Scope 3', itemStyle: { color: '#45B7D1' } }
          ]
        }]
      })
    },
    renderSensitivityBar() {
      const factors = ['煤炭用量', '电力因子', '运输距离', '熟料系数', '替代燃料']
      const impacts = [28.6, 9.4, 8.2, 22.9, 15.2]
      this.sensitivityChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}%' },
        grid: { top: 10, right: 30, bottom: 30, left: 90 },
        xAxis: { type: 'value', name: '影响占比(%)' },
        yAxis: { type: 'category', data: factors, inverse: true },
        series: [{
          type: 'bar',
          data: impacts.map((val, idx) => ({
            value: val,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: idx === 0 ? '#FF6B6B' : '#1890FF' },
                { offset: 1, color: idx === 0 ? '#FF8E8E' : '#69C0FF' }
              ]),
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: 18,
          label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, fontFamily: 'D-DIN' }
        }]
      })
    },
    handleResize() {
      if (this.scopePieChart) this.scopePieChart.resize()
      if (this.sensitivityChart) this.sensitivityChart.resize()
    },
    handleProductChange() {},
    handleYearChange() {},
    handleCalc() {
      this.$message.success('正在核算产品碳足迹...')
    },
    handleReset() {
      this.selectedProduct = 'cement_42.5'
      this.functionalUnit = 't'
    },
    handleExport() {},
    handleGenReport() {
      this.$message.success('正在生成 ISO 14067 产品碳足迹报告...')
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

.lca-flow {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 8px;
}

.lca-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
  padding: $spacing-md;
  border-radius: $radius-md;
  background: #FAFAFA;
  cursor: pointer;
  transition: all $transition-duration;
  flex-shrink: 0;

  &:hover {
    background: rgba($primary-color, 0.04);
  }

  &--active {
    background: rgba($primary-color, 0.08);
    border: 1px solid rgba($primary-color, 0.3);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba($primary-color, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;

    i {
      font-size: 18px;
      color: $primary-color;
    }
  }

  &__name {
    font-size: $font-size-14;
    color: $text-regular;
    margin-bottom: 4px;
  }

  &__value {
    font-size: $font-size-20;
    color: $text-primary;
  }

  &__unit {
    font-size: $font-size-10;
    color: $text-placeholder;
    margin-top: 2px;
  }

  &__pct {
    font-size: $font-size-12;
    color: $primary-color;
    margin-top: 4px;
    padding: 1px 6px;
    background: rgba($primary-color, 0.1);
    border-radius: 2px;
    font-family: $font-d-din;
  }

  &__arrow {
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    color: $text-placeholder;
    font-size: 16px;
  }
}

.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $gutter;
}

.footprint-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: $spacing-md;
}

.footprint-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.footprint-value {
  font-size: $font-size-24;
  color: $primary-color;
  font-weight: 600;
}

.footprint-unit {
  font-size: $font-size-14;
  color: $text-secondary;
}

.footprint-compare {
  max-width: 280px;
}

.footprint-tags {
  display: flex;
  gap: 8px;
}

.footprint-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: $spacing-md;
  border-top: 1px solid $divider-color;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  align-items: center;
  gap: 12px;

  .breakdown-label {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  .breakdown-value {
    font-size: $font-size-14;
    color: $text-primary;
    text-align: right;
  }
}

.scope-pie-chart {
  height: 280px;
}

.sensitivity-chart {
  height: 280px;
}

.emission-val {
  color: $primary-color;
  font-weight: 600;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
}

.suggestion-item {
  background: #FAFAFA;
  border-radius: $radius-md;
  padding: $spacing-md;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    i {
      font-size: 18px;
    }
  }

  &__title {
    font-size: $font-size-14;
    color: $text-primary;
    font-weight: 600;
  }

  &__desc {
    font-size: $font-size-12;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  &__impact {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .impact-label {
      font-size: $font-size-12;
      color: $text-placeholder;
    }

    .impact-value {
      font-size: $font-size-16;
      color: $success-color;
    }
  }
}

.report-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-desc {
  font-size: $font-size-12;
  color: $text-placeholder;
}

.report-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
