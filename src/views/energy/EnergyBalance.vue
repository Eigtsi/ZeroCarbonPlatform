<template>
  <div class="energy-balance">
    

    <!-- KPI概览 -->
    <div class="kpi-grid mb-lg">
      <KpiCard
        v-for="item in balanceKpiData"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :unit="item.unit"
        :status="item.status"
        :trend="item.trend"
        :tip="item.tip"
      />
    </div>

    <!-- 能量平衡计算表 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">能量平衡计算表</h3>
      <div class="balance-equation mb-md">
        <div class="equation-block">
          <span class="equation-label">总输入能量</span>
          <span class="equation-value font-d-din">{{ balanceSummary.totalInput }}</span>
          <span class="equation-unit">GJ</span>
        </div>
        <span class="equation-op">=</span>
        <div class="equation-block">
          <span class="equation-label">总输出能量</span>
          <span class="equation-value font-d-din">{{ balanceSummary.totalOutput }}</span>
          <span class="equation-unit">GJ</span>
        </div>
        <span class="equation-op">+</span>
        <div class="equation-block">
          <span class="equation-label">总损失能量</span>
          <span class="equation-value font-d-din loss">{{ balanceSummary.totalLoss }}</span>
          <span class="equation-unit">GJ</span>
        </div>
      </div>
      <el-table :data="balanceTableData" border stripe style="width: 100%" show-summary :summary-method="getBalanceSummary">
        <el-table-column prop="category" label="能源类别" min-width="120" align="center" />
        <el-table-column prop="inputEnergy" label="输入能量(GJ)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.inputEnergy }}</span></template>
        </el-table-column>
        <el-table-column prop="usefulEnergy" label="有效利用(GJ)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.usefulEnergy }}</span></template>
        </el-table-column>
        <el-table-column prop="lossEnergy" label="损失能量(GJ)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din loss-val">{{ row.lossEnergy }}</span></template>
        </el-table-column>
        <el-table-column prop="efficiency" label="利用效率(%)" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span :class="['font-d-din', efficiencyClass(row.efficiency)]">{{ row.efficiency }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="lossRate" label="损失占比(%)" min-width="110" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.lossRate }}%</span></template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="100" align="center" />
      </el-table>
    </div>

    <!-- 热效率计算面板 -->
    <div class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">设备热效率</h3>
        <div class="efficiency-list">
          <div v-for="item in equipmentEfficiency" :key="item.name" class="efficiency-item">
            <div class="efficiency-item__header">
              <span class="efficiency-item__name">{{ item.name }}</span>
              <span :class="['efficiency-item__tag', `tag--${item.tagClass}`]">{{ item.tag }}</span>
            </div>
            <div class="efficiency-item__body">
              <div class="efficiency-ring">
                <el-progress
                  type="circle"
                  :percentage="item.efficiency"
                  :width="80"
                  :stroke-width="6"
                  :color="efficiencyColor(item.tagClass)"
                />
              </div>
              <div class="efficiency-details">
                <div class="eff-row">
                  <span class="eff-label">输入热量</span>
                  <span class="eff-val font-d-din">{{ item.inputHeat }}</span>
                  <span class="eff-unit">GJ</span>
                </div>
                <div class="eff-row">
                  <span class="eff-label">有效热量</span>
                  <span class="eff-val font-d-din">{{ item.usefulHeat }}</span>
                  <span class="eff-unit">GJ</span>
                </div>
                <div class="eff-row">
                  <span class="eff-label">热效率</span>
                  <span :class="['eff-val', `text--${item.tagClass}`]">{{ item.efficiency }}%</span>
                </div>
                <div class="eff-row">
                  <span class="eff-label">国标限值</span>
                  <span class="eff-val font-d-din">{{ item.standard }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TrendChart
        title="设备热效率对比"
        :height="380"
        :option="efficiencyCompareOption"
        class="flex-1"
      />
    </div>

    <!-- 平衡校验工具 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">平衡校验工具</h3>
      <div class="verify-grid">
        <div class="verify-form">
          <el-form :model="verifyForm" label-width="120px" size="small">
            <el-form-item label="校验项目">
              <el-select v-model="verifyForm.item" placeholder="选择校验项目" style="width: 100%">
                <el-option v-for="v in verifyItems" :key="v.value" :label="v.label" :value="v.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="输入能量">
              <el-input v-model="verifyForm.inputEnergy" placeholder="输入能量值">
                <template slot="append">GJ</template>
              </el-input>
            </el-form-item>
            <el-form-item label="有效利用">
              <el-input v-model="verifyForm.usefulEnergy" placeholder="有效利用值">
                <template slot="append">GJ</template>
              </el-input>
            </el-form-item>
            <el-form-item label="损失能量">
              <el-input v-model="verifyForm.lossEnergy" placeholder="损失能量值">
                <template slot="append">GJ</template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleVerify">开始校验</el-button>
              <el-button @click="handleVerifyReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="verify-result">
          <div v-if="verifyResult.visible" class="verify-result__content">
            <div class="verify-result__header">
              <i :class="verifyResult.passed ? 'el-icon-success' : 'el-icon-warning'" :style="{ color: verifyResult.passed ? '#52C41A' : '#FF4D4F', fontSize: '48px' }"></i>
            </div>
            <div :class="['verify-result__status', verifyResult.passed ? 'pass' : 'fail']">
              {{ verifyResult.passed ? '校验通过' : '校验未通过' }}
            </div>
            <div class="verify-result__detail">
              <div class="verify-detail-row">
                <span class="vd-label">输入能量</span>
                <span class="vd-value font-d-din">{{ verifyResult.input }}</span>
                <span class="vd-unit">GJ</span>
              </div>
              <div class="verify-detail-row">
                <span class="vd-label">有效利用</span>
                <span class="vd-value font-d-din">{{ verifyResult.useful }}</span>
                <span class="vd-unit">GJ</span>
              </div>
              <div class="verify-detail-row">
                <span class="vd-label">损失能量</span>
                <span class="vd-value font-d-din">{{ verifyResult.loss }}</span>
                <span class="vd-unit">GJ</span>
              </div>
              <div class="verify-detail-row total">
                <span class="vd-label">有效 + 损失</span>
                <span class="vd-value font-d-din">{{ verifyResult.sum }}</span>
                <span class="vd-unit">GJ</span>
              </div>
              <div class="verify-detail-row">
                <span class="vd-label">偏差</span>
                <span :class="['vd-value', 'font-d-din', verifyResult.passed ? '' : 'loss-text']">{{ verifyResult.deviation }} GJ</span>
              </div>
              <div class="verify-detail-row">
                <span class="vd-label">偏差率</span>
                <span :class="['vd-value', 'font-d-din', verifyResult.passed ? '' : 'loss-text']">{{ verifyResult.deviationRate }}%</span>
              </div>
            </div>
          </div>
          <div v-else class="verify-result__empty">
            <i class="el-icon-document-checked"></i>
            <span>请输入数据并点击校验</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <DataTable title="能效优化建议" :data="optimizationData" :pagination="false" class="mb-lg">
      <el-table-column prop="priority" label="优先级" width="80" align="center">
        <template slot-scope="{ row }">
          <span :class="['priority-tag', `priority--${row.priorityClass}`]">{{ row.priority }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="equipment" label="设备/环节" min-width="130" align="center" />
      <el-table-column prop="issue" label="问题描述" min-width="200" align="center" />
      <el-table-column prop="suggestion" label="优化建议" min-width="180" align="center" />
      <el-table-column prop="savingPotential" label="节能潜力(tce)" min-width="130" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.savingPotential }}</span></template>
      </el-table-column>
      <el-table-column prop="investment" label="预估投资(万元)" min-width="130" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.investment }}</span></template>
      </el-table-column>
      <el-table-column prop="payback" label="回收期(年)" min-width="110" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.payback }}</span></template>
      </el-table-column>
    </DataTable>

    <!-- 能效变化趋势 -->
    <TrendChart
      title="综合能效变化趋势"
      :height="300"
      :tabs="[{ key: 'month', label: '月度' }, { key: 'year', label: '年度' }]"
      :option="efficiencyTrendOption"
    />
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'EnergyBalance',
  components: { KpiCard, TrendChart, DataTable },
  data() {
    return {
      balanceKpiData: [
        { label: '综合能量利用率', value: 71.9, unit: '%', status: 'success', trend: { value: 2.3, type: 'up' }, tip: '有效利用能量/总输入能量' },
        { label: '系统热效率', value: 82.6, unit: '%', status: 'default', trend: { value: 1.1, type: 'up' }, tip: '加权平均热效率' },
        { label: '余热回收率', value: 62.5, unit: '%', status: 'warning', trend: { value: 5.8, type: 'up' }, tip: '回收余热/可回收余热' },
        { label: '平衡偏差率', value: 0.03, unit: '%', status: 'success', trend: { value: 0.02, type: 'down' }, tip: '输入-(输出+损失)/输入' }
      ],
      balanceSummary: {
        totalInput: '52,680.50',
        totalOutput: '37,892.60',
        totalLoss: '14,787.90'
      },
      balanceTableData: [
        { category: '煤炭', inputEnergy: '15,680.00', usefulEnergy: '10,890.50', lossEnergy: '4,789.50', efficiency: '69.5', lossRate: '32.4', remark: '锅炉燃烧为主' },
        { category: '天然气', inputEnergy: '11,850.00', usefulEnergy: '9,126.80', lossEnergy: '2,723.20', efficiency: '77.0', lossRate: '18.4', remark: '锅炉+直燃' },
        { category: '电力', inputEnergy: '15,970.00', usefulEnergy: '12,468.30', lossEnergy: '3,501.70', efficiency: '78.1', lossRate: '23.7', remark: '电机+照明+空调' },
        { category: '蒸汽', inputEnergy: '8,180.00', usefulEnergy: '5,407.00', lossEnergy: '2,773.00', efficiency: '66.1', lossRate: '18.7', remark: '管网损失较大' },
        { category: '余热回收', inputEnergy: '1,000.50', usefulEnergy: '1,000.00', lossEnergy: '0.50', efficiency: '99.9', lossRate: '0.0', remark: '热交换器回收' }
      ],
      equipmentEfficiency: [
        { name: '1号锅炉', efficiency: 92.3, inputHeat: '12,560.00', usefulHeat: '11,592.88', standard: '88.0', tag: '优秀', tagClass: 'good' },
        { name: '2号锅炉', efficiency: 85.6, inputHeat: '8,960.00', usefulHeat: '7,665.76', standard: '88.0', tag: '合格', tagClass: 'mid' },
        { name: '空气压缩机', efficiency: 54.9, inputHeat: '3,860.00', usefulHeat: '2,119.14', standard: '60.0', tag: '待优化', tagClass: 'bad' },
        { name: '循环水泵', efficiency: 76.8, inputHeat: '2,150.00', usefulHeat: '1,651.20', standard: '75.0', tag: '优秀', tagClass: 'good' },
        { name: '换热器组', efficiency: 88.5, inputHeat: '5,200.00', usefulHeat: '4,602.00', standard: '85.0', tag: '优秀', tagClass: 'good' }
      ],
      verifyItems: [
        { label: '煤炭平衡校验', value: 'coal' },
        { label: '天然气平衡校验', value: 'gas' },
        { label: '电力平衡校验', value: 'electricity' },
        { label: '蒸汽平衡校验', value: 'steam' },
        { label: '综合能量平衡', value: 'total' }
      ],
      verifyForm: {
        item: '',
        inputEnergy: '',
        usefulEnergy: '',
        lossEnergy: ''
      },
      verifyResult: {
        visible: false,
        passed: false,
        input: '',
        useful: '',
        loss: '',
        sum: '',
        deviation: '',
        deviationRate: ''
      },
      optimizationData: [
        { priority: '高', priorityClass: 'high', equipment: '空气压缩机', issue: '压缩热未回收，效率仅54.9%', suggestion: '加装余热回收装置，优化运行策略', savingPotential: '186.5', investment: '45.0', payback: '1.2' },
        { priority: '高', priorityClass: 'high', equipment: '蒸汽管网', issue: '管网保温老化，散热损失18.7%', suggestion: '更新保温材料，优化管网布局', savingPotential: '142.3', investment: '68.0', payback: '2.4' },
        { priority: '中', priorityClass: 'mid', equipment: '2号锅炉', issue: '热效率85.6%低于国标88%', suggestion: '清洗换热面，优化燃烧参数', savingPotential: '98.6', investment: '12.0', payback: '0.6' },
        { priority: '中', priorityClass: 'mid', equipment: '照明系统', issue: '部分区域仍使用传统灯具', suggestion: '全面更换LED照明，加装智能控制', savingPotential: '35.2', investment: '28.0', payback: '3.9' },
        { priority: '低', priorityClass: 'low', equipment: '循环水泵', issue: '运行频率固定，无变频调节', suggestion: '加装变频器，按需调节流量', savingPotential: '22.8', investment: '15.0', payback: '3.2' }
      ]
    }
  },
  computed: {
    efficiencyCompareOption() {
      const equipments = this.equipmentEfficiency.map(e => e.name)
      const currentValues = this.equipmentEfficiency.map(e => e.efficiency)
      const standardValues = this.equipmentEfficiency.map(e => Number(e.standard))
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['当前效率', '国标限值'], bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 100 },
        xAxis: { type: 'value', name: '%', max: 100 },
        yAxis: { type: 'category', data: equipments },
        series: [
          {
            name: '当前效率',
            type: 'bar',
            barWidth: 16,
            data: currentValues.map((val, idx) => ({
              value: val,
              itemStyle: { color: val >= standardValues[idx] ? '#52C41A' : '#FF4D4F' }
            })),
            label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
          },
          {
            name: '国标限值',
            type: 'bar',
            barWidth: 16,
            data: standardValues,
            itemStyle: { color: '#D9D9D9' },
            label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
          }
        ]
      }
    },
    efficiencyTrendOption() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['综合利用率', '热效率', '余热回收率'], bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 80 },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value', name: '%', min: 50, max: 100, nameTextStyle: { fontSize: 12 }, axisLabel: { fontSize: 11 } },
        series: [
          { name: '综合利用率', type: 'line', smooth: true, data: [68.2, 69.0, 69.8, 70.5, 71.9, null, null, null, null, null, null, null], itemStyle: { color: '#1890FF' } },
          { name: '热效率', type: 'line', smooth: true, data: [80.1, 80.8, 81.2, 82.0, 82.6, null, null, null, null, null, null, null], itemStyle: { color: '#52C41A' } },
          { name: '余热回收率', type: 'line', smooth: true, data: [52.3, 55.0, 57.8, 60.2, 62.5, null, null, null, null, null, null, null], itemStyle: { color: '#FAAD14' } }
        ]
      }
    }
  },
  methods: {
    getBalanceSummary({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const fields = ['inputEnergy', 'usefulEnergy', 'lossEnergy']
        if (fields.includes(column.property)) {
          const values = data.map(item => Number(item[column.property].replace(/,/g, '')))
          sums[index] = values.reduce((prev, curr) => prev + curr, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
        } else if (column.property === 'efficiency') {
          sums[index] = '71.9%'
        } else if (column.property === 'lossRate') {
          sums[index] = '100.0%'
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    efficiencyClass(val) {
      const num = parseFloat(val)
      if (num >= 85) return 'eff-good'
      if (num >= 70) return 'eff-mid'
      return 'eff-bad'
    },
    efficiencyColor(tagClass) {
      const map = { good: '#52C41A', mid: '#FAAD14', bad: '#FF4D4F' }
      return map[tagClass] || '#1890FF'
    },
    handleVerify() {
      const input = parseFloat(this.verifyForm.inputEnergy)
      const useful = parseFloat(this.verifyForm.usefulEnergy)
      const loss = parseFloat(this.verifyForm.lossEnergy)

      if (isNaN(input) || isNaN(useful) || isNaN(loss)) {
        this.$message.warning('请填写完整的校验数据')
        return
      }

      const sum = useful + loss
      const deviation = Math.abs(input - sum)
      const deviationRate = input > 0 ? ((deviation / input) * 100).toFixed(4) : '0'
      const passed = deviationRate < 0.5

      this.verifyResult = {
        visible: true,
        passed,
        input: input.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
        useful: useful.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
        loss: loss.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
        sum: sum.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
        deviation: deviation.toFixed(4),
        deviationRate
      }
    },
    handleVerifyReset() {
      this.verifyForm = { item: '', inputEnergy: '', usefulEnergy: '', lossEnergy: '' }
      this.verifyResult = { visible: false, passed: false, input: '', useful: '', loss: '', sum: '', deviation: '', deviationRate: '' }
    }
  }
}
</script>

<style lang="scss" scoped>
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
}

.balance-equation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: $spacing-md;
  background: #FAFAFA;
  border-radius: $radius-md;
}

.equation-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.equation-label {
  font-size: $font-size-12;
  color: $text-secondary;
}

.equation-value {
  font-size: $font-size-20;
  color: $text-primary;

  &.loss {
    color: $danger-color;
  }
}

.equation-unit {
  font-size: $font-size-12;
  color: $text-placeholder;
}

.equation-op {
  font-size: $font-size-20;
  color: $text-secondary;
  font-weight: 600;
}

.chart-row {
  display: flex;
  gap: $gutter;
}

.efficiency-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.efficiency-item {
  padding: $spacing-md;
  background: #FAFAFA;
  border-radius: $radius-md;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__name {
    font-size: $font-size-14;
    color: $text-primary;
    font-weight: 500;
  }

  &__tag {
    padding: 2px 8px;
    border-radius: 2px;
    font-size: $font-size-12;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 20px;
  }
}

.tag--good { color: $success-color; background: rgba($success-color, 0.1); }
.tag--mid { color: $warning-color; background: rgba($warning-color, 0.1); }
.tag--bad { color: $danger-color; background: rgba($danger-color, 0.1); }

.efficiency-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eff-row {
  display: flex;
  align-items: baseline;
  gap: 6px;

  .eff-label {
    font-size: $font-size-12;
    color: $text-placeholder;
    min-width: 60px;
  }

  .eff-val {
    font-size: $font-size-14;
    color: $text-primary;
  }

  .eff-unit {
    font-size: $font-size-12;
    color: $text-placeholder;
  }

  .text--good { color: $success-color; }
  .text--mid { color: $warning-color; }
  .text--bad { color: $danger-color; }
}

.verify-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;
}

.verify-result {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAFAFA;
  border-radius: $radius-md;
  min-height: 300px;

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: $text-placeholder;

    i {
      font-size: 48px;
    }

    span {
      font-size: $font-size-14;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: $spacing-md;
  }

  &__header {
    margin-bottom: 4px;
  }

  &__status {
    font-size: $font-size-16;
    font-weight: 600;
    padding: 4px 16px;
    border-radius: 4px;

    &.pass {
      color: $success-color;
      background: rgba($success-color, 0.1);
    }

    &.fail {
      color: $danger-color;
      background: rgba($danger-color, 0.1);
    }
  }

  &__detail {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 12px;
    border-top: 1px solid $divider-color;
  }
}

.verify-detail-row {
  display: flex;
  align-items: baseline;
  gap: 8px;

  .vd-label {
    font-size: $font-size-12;
    color: $text-secondary;
    min-width: 80px;
  }

  .vd-value {
    font-size: $font-size-14;
    color: $text-primary;
  }

  .vd-unit {
    font-size: $font-size-12;
    color: $text-placeholder;
  }

  &.total {
    padding-top: 6px;
    border-top: 1px dashed $divider-color;
  }
}

.loss-text {
  color: $danger-color !important;
}

.priority-tag {
  padding: 2px 8px;
  border-radius: 2px;
  font-size: $font-size-12;

  &--high { color: $danger-color; background: rgba($danger-color, 0.1); }
  &--mid { color: $warning-color; background: rgba($warning-color, 0.1); }
  &--low { color: $text-secondary; background: rgba($text-secondary, 0.1); }
}

.loss-val {
  color: $danger-color;
}

.eff-good { color: $success-color; }
.eff-mid { color: $warning-color; }
.eff-bad { color: $danger-color; }
</style>
