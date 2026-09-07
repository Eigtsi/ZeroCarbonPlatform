<template>
  <div class="carbon-asset">
    

    <!-- 资产概览 KPI -->
    <div class="kpi-grid mb-lg">
      <KpiCard label="碳配额总量" value="58000" unit="tCO₂e" status="default" :trend="{ value: 5.0, type: 'down' }" tip="全国碳市场年度免费配额" />
      <KpiCard label="已使用配额" value="24360" unit="tCO₂e" status="warning" :trend="{ value: 4.8, type: 'up' }" />
      <KpiCard label="剩余配额" value="33640" unit="tCO₂e" status="success" :trend="{ value: 12.5, type: 'down' }" />
      <KpiCard label="CCER持有量" value="8500" unit="tCO₂e" status="default" :trend="{ value: 20, type: 'up' }" tip="国家核证自愿减排量" />
      <KpiCard label="配额市值" value="336.4" unit="万元" status="default" :trend="{ value: 3.2, type: 'up' }" tip="按当前市场价计算" />
    </div>

    <!-- 配额管理面板 + 仪表盘 -->
    <div class="quota-row mb-lg">
      <div class="section-card quota-gauge-card">
        <h3 class="section-title">配额余额</h3>
        <div ref="quotaGauge" class="quota-gauge"></div>
        <div class="quota-detail">
          <div class="quota-detail__row">
            <span class="quota-detail__label">年度免费配额</span>
            <span class="quota-detail__value font-d-din">58,000 <small>tCO₂e</small></span>
          </div>
          <div class="quota-detail__row">
            <span class="quota-detail__label">已使用配额</span>
            <span class="quota-detail__value font-d-din">24,360 <small>tCO₂e</small></span>
          </div>
          <div class="quota-detail__row">
            <span class="quota-detail__label">CCER可用于抵销</span>
            <span class="quota-detail__value font-d-din">5,800 <small>tCO₂e</small></span>
          </div>
          <div class="quota-detail__row highlight">
            <span class="quota-detail__label">实际可用余额</span>
            <span class="quota-detail__value font-d-din">39,440 <small>tCO₂e</small></span>
          </div>
        </div>
      </div>
      <div class="section-card quota-action-card">
        <h3 class="section-title">配额操作</h3>
        <div class="action-grid">
          <div class="action-item" @click="handleBuyQuota">
            <i class="el-icon-shopping-cart-2"></i>
            <span>配额买入</span>
          </div>
          <div class="action-item" @click="handleSellQuota">
            <i class="el-icon-sell"></i>
            <span>配额卖出</span>
          </div>
          <div class="action-item" @click="handleCcerOffset">
            <i class="el-icon-document-checked"></i>
            <span>CCER抵销</span>
          </div>
          <div class="action-item" @click="handleTransferQuota">
            <i class="el-icon-right"></i>
            <span>配额划转</span>
          </div>
        </div>
        <div class="market-info">
          <div class="market-info__row">
            <span class="market-info__label">当前碳价</span>
            <span class="market-info__value font-d-din">100.2 <small>元/tCO₂e</small></span>
          </div>
          <div class="market-info__row">
            <span class="market-info__label">今日涨跌</span>
            <span class="market-info__value font-d-din up"><i class="el-icon-top"></i> 2.8%</span>
          </div>
          <div class="market-info__row">
            <span class="market-info__label">成交量</span>
            <span class="market-info__value font-d-din">156,800 <small>tCO₂e</small></span>
          </div>
        </div>
      </div>
      <div class="section-card compliance-card">
        <h3 class="section-title">履约跟踪</h3>
        <div class="compliance-list">
          <div v-for="item in complianceList" :key="item.period" class="compliance-item">
            <div class="compliance-item__header">
              <span class="compliance-item__period">{{ item.period }}</span>
              <span :class="['compliance-item__status', `status--${item.status}`]">{{ item.statusText }}</span>
            </div>
            <el-progress :percentage="item.progress" :color="item.progress >= 100 ? '#52C41A' : '#1890FF'" :stroke-width="10" />
            <div class="compliance-item__detail">
              <span>配额：<span class="font-d-din">{{ item.quota }}</span> tCO₂e</span>
              <span>排放：<span class="font-d-din">{{ item.emission }}</span> tCO₂e</span>
              <span>差额：<span class="font-d-din">{{ item.diff }}</span> tCO₂e</span>
            </div>
          </div>
        </div>
        <div class="compliance-summary">
          <span class="compliance-summary__label">下次履约截止</span>
          <span class="compliance-summary__date font-d-din">2026-12-31</span>
          <span class="compliance-summary__days">剩余 <span class="font-d-din">232</span> 天</span>
        </div>
      </div>
    </div>

    <!-- CCER 资产台账 -->
    <DataTable title="CCER 资产明细" :data="ccerData" :total="20" :exportable="true" class="mb-lg" @page-change="handlePageChange" @export="handleExport">
      <el-table-column prop="project" label="项目名称" min-width="200" align="center" />
      <el-table-column prop="type" label="项目类型" min-width="140" align="center" />
      <el-table-column prop="credit" label="签发量(tCO₂e)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.credit }}</span></template>
      </el-table-column>
      <el-table-column prop="used" label="已使用(tCO₂e)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.used }}</span></template>
      </el-table-column>
      <el-table-column prop="available" label="可用余额(tCO₂e)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din available-val">{{ row.available }}</span></template>
      </el-table-column>
      <el-table-column prop="vintage" label="产出年份" min-width="100" align="center" />
      <el-table-column prop="registry" label="登记机构" min-width="140" align="center" />
      <el-table-column prop="expireDate" label="到期日" min-width="120" align="center" />
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="handleOffsetCcer(row)">抵销</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 碳排放预测 -->
    <TrendChart
      title="碳排放预测与配额分析"
      :height="360"
      :tabs="[{ key: 'monthly', label: '月度' }, { key: 'quarterly', label: '季度' }]"
      :option="forecastOption"
      class="mb-lg"
      @tab-change="handleForecastTabChange"
    />

    <!-- 交易记录 -->
    <DataTable title="配额交易记录" :data="tradeRecords" :total="80" :pagination="true">
      <el-table-column prop="date" label="交易日期" min-width="120" align="center" sortable />
      <el-table-column prop="type" label="交易类型" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span :class="['trade-type', row.type === '买入' ? 'trade--buy' : 'trade--sell']">{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="volume" label="数量(tCO₂e)" min-width="130" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.volume }}</span></template>
      </el-table-column>
      <el-table-column prop="price" label="单价(元/t)" min-width="110" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.price }}</span></template>
      </el-table-column>
      <el-table-column prop="amount" label="金额(元)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
      </el-table-column>
      <el-table-column prop="counterparty" label="交易对手" min-width="160" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template slot-scope="{ row }"><span :class="['trade-status', `status--${row.statusClass}`]">{{ row.status }}</span></template>
      </el-table-column>
    </DataTable>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'CarbonAsset',
  components: { KpiCard, TrendChart, DataTable },
  data() {
    return {
      quotaGaugeChart: null,
      complianceList: [
        { period: '2026年度', progress: 42, quota: '58,000', emission: '24,360', diff: '+33,640', status: 'active', statusText: '履约中' },
        { period: '2025年度', progress: 100, quota: '61,000', emission: '58,200', diff: '+2,800', status: 'done', statusText: '已完成' },
        { period: '2024年度', progress: 100, quota: '64,000', emission: '60,150', diff: '+3,850', status: 'done', statusText: '已完成' }
      ],
      ccerData: [
        { project: '内蒙古风电场一期', type: '风力发电', credit: '5,200', used: '1,800', available: '3,400', vintage: '2024', registry: '国家气候战略中心', expireDate: '2029-12-31' },
        { project: '云南光伏电站项目', type: '太阳能发电', credit: '3,800', used: '1,200', available: '2,600', vintage: '2024', registry: '国家气候战略中心', expireDate: '2029-12-31' },
        { project: '广西林业碳汇项目', type: '林业碳汇', credit: '2,500', used: '0', available: '2,500', vintage: '2023', registry: '国家气候战略中心', expireDate: '2028-12-31' },
        { project: '湖北农村沼气工程', type: '甲烷回收', credit: '1,200', used: '0', available: '1,200', vintage: '2023', registry: '国家气候战略中心', expireDate: '2028-06-30' },
        { project: '湖南生物质发电', type: '生物质能', credit: '800', used: '0', available: '800', vintage: '2025', registry: '国家气候战略中心', expireDate: '2030-12-31' }
      ],
      tradeRecords: [
        { date: '2026-05-12', type: '买入', volume: '1,000', price: '100.50', amount: '100,500', counterparty: '华能碳资产经营公司', status: '已完成', statusClass: 'done' },
        { date: '2026-05-08', type: '卖出', volume: '500', price: '98.20', amount: '49,100', counterparty: '中电联碳交易平台', status: '已完成', statusClass: 'done' },
        { date: '2026-04-25', type: '买入', volume: '2,000', price: '96.80', amount: '193,600', counterparty: '国家碳交易中心', status: '已完成', statusClass: 'done' },
        { date: '2026-04-10', type: '买入', volume: '800', price: '95.50', amount: '76,400', counterparty: '华能碳资产经营公司', status: '已完成', statusClass: 'done' },
        { date: '2026-03-28', type: '卖出', volume: '300', price: '94.00', amount: '28,200', counterparty: '上海环境能源交易所', status: '已完成', statusClass: 'done' },
        { date: '2026-03-15', type: '买入', volume: '1,500', price: '92.60', amount: '138,900', counterparty: '中碳集团', status: '已完成', statusClass: 'done' }
      ],
      forecastType: 'monthly'
    }
  },
  computed: {
    forecastOption() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const actualEmission = [5150, 4980, 5320, 5010, 4900, null, null, null, null, null, null, null]
      const forecastEmission = [null, null, null, null, null, 5100, 5250, 5380, 5150, 4980, 4850, 5020]
      const quotaLine = Array(12).fill(4833)
      const ccerOffset = Array(12).fill(0).map((_, i) => i >= 5 ? 483 : 0)
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际排放', '预测排放', '配额月均线', 'CCER抵销'], bottom: 0 },
        grid: { top: 30, right: 30, bottom: 50, left: 80 },
        xAxis: { type: 'category', data: months, boundaryGap: false },
        yAxis: { type: 'value', name: 'tCO₂e', nameTextStyle: { fontSize: 12 }, axisLabel: { fontSize: 11 } },
        series: [
          {
            name: '实际排放',
            type: 'line',
            smooth: true,
            data: actualEmission,
            itemStyle: { color: '#FF6B6B' },
            areaStyle: { color: 'rgba(255,107,107,0.08)' }
          },
          {
            name: '预测排放',
            type: 'line',
            smooth: true,
            data: forecastEmission,
            lineStyle: { type: 'dashed' },
            itemStyle: { color: '#FF6B6B' }
          },
          {
            name: '配额月均线',
            type: 'line',
            data: quotaLine,
            lineStyle: { type: 'dotted', color: '#52C41A', width: 2 },
            itemStyle: { color: '#52C41A' },
            symbol: 'none'
          },
          {
            name: 'CCER抵销',
            type: 'bar',
            data: ccerOffset,
            itemStyle: { color: 'rgba(24,144,255,0.3)' },
            barWidth: 20
          }
        ]
      }
    }
  },
  mounted() {
    this.initQuotaGauge()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.quotaGaugeChart) this.quotaGaugeChart.dispose()
  },
  methods: {
    initQuotaGauge() {
      this.quotaGaugeChart = echarts.init(this.$refs.quotaGauge)
      this.quotaGaugeChart.setOption({
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
              width: 18,
              color: [
                [0.3, '#FF4D4F'],
                [0.5, '#FAAD14'],
                [0.7, '#1890FF'],
                [1, '#52C41A']
              ]
            }
          },
          pointer: {
            width: 5,
            length: '60%',
            itemStyle: { color: '#1890FF' }
          },
          axisTick: { distance: -18, length: 6, lineStyle: { color: '#fff', width: 1 } },
          splitLine: { distance: -18, length: 12, lineStyle: { color: '#fff', width: 2 } },
          axisLabel: { distance: 28, color: '#999', fontSize: 11 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 22,
            fontFamily: 'D-DIN',
            offsetCenter: [0, '68%'],
            color: '#52C41A'
          },
          title: { offsetCenter: [0, '90%'], fontSize: 12, color: '#999' },
          data: [{ value: 58, name: '配额剩余比例' }]
        }]
      })
    },
    handleResize() {
      if (this.quotaGaugeChart) this.quotaGaugeChart.resize()
    },
    handleBuyQuota() {
      this.$message.info('配额买入功能：跳转碳交易平台')
    },
    handleSellQuota() {
      this.$message.info('配额卖出功能：跳转碳交易平台')
    },
    handleCcerOffset() {
      this.$message.info('CCER抵销申请：选择项目提交审核')
    },
    handleTransferQuota() {
      this.$message.info('配额划转功能：跨账户配额调配')
    },
    handleOffsetCcer(row) {
      this.$confirm(`确认使用"${row.project}"的CCER进行配额抵销？`, 'CCER抵销确认', { type: 'info' }).then(() => {
        this.$message.success('已提交CCER抵销申请')
      }).catch(() => {})
    },
    handlePageChange() {},
    handleExport() {},
    handleForecastTabChange(key) {
      this.forecastType = key
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

.quota-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $gutter;
}

.quota-gauge {
  height: 200px;
}

.quota-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $divider-color;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &.highlight {
      padding: 8px 12px;
      background: rgba($success-color, 0.06);
      border-radius: $radius-md;
      border: 1px solid rgba($success-color, 0.2);
    }
  }

  &__label {
    font-size: $font-size-14;
    color: $text-secondary;
  }

  &__value {
    font-size: $font-size-16;
    color: $text-primary;

    small {
      font-size: $font-size-12;
      color: $text-placeholder;
      font-family: $font-body;
    }

    .highlight & {
      color: $success-color;
    }
  }
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: $spacing-md;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: $spacing-md;
  background: #FAFAFA;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-duration;

  i {
    font-size: 24px;
    color: $primary-color;
  }

  span {
    font-size: $font-size-14;
    color: $text-regular;
  }

  &:hover {
    background: rgba($primary-color, 0.06);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba($primary-color, 0.15);
  }
}

.market-info {
  padding-top: $spacing-md;
  border-top: 1px solid $divider-color;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  &__label {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__value {
    font-size: $font-size-14;
    color: $text-primary;

    small {
      font-size: $font-size-12;
      color: $text-placeholder;
      font-family: $font-body;
    }

    &.up {
      color: $danger-color;
    }
  }
}

.compliance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compliance-item {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__period {
    font-size: $font-size-14;
    color: $text-regular;
    font-weight: 600;
  }

  &__status {
    font-size: $font-size-12;
    padding: 2px 8px;
    border-radius: 2px;

    &.status--active { color: $primary-color; background: rgba($primary-color, 0.1); }
    &.status--done { color: $success-color; background: rgba($success-color, 0.1); }
  }

  &__detail {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    font-size: $font-size-12;
    color: $text-placeholder;
  }
}

.compliance-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: rgba($primary-color, 0.04);
  border-radius: $radius-md;
  border: 1px solid rgba($primary-color, 0.15);

  &__label {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__date {
    font-size: $font-size-16;
    color: $primary-color;
  }

  &__days {
    font-size: $font-size-12;
    color: $text-placeholder;
    margin-left: auto;
  }
}

.available-val {
  color: $success-color;
  font-weight: 600;
}

.trade-type {
  font-size: $font-size-12;
  padding: 2px 8px;
  border-radius: 2px;

  &.trade--buy { color: $danger-color; background: rgba($danger-color, 0.08); }
  &.trade--sell { color: $success-color; background: rgba($success-color, 0.08); }
}

.trade-status {
  font-size: $font-size-12;

  &.status--done { color: $success-color; }
  &.status--pending { color: $warning-color; }
}
</style>
