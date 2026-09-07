<template>
  <div class="data-query-panel">
    <QueryFilter v-model="queryFilters" @query="handleQuery" />

    <TrendChart title="能耗趋势对比" :height="320" :option="trendChartOption" class="mb-lg" />

    <div class="compare-row mb-lg">
      <div class="compare-card-custom">
        <div class="cc-label">本期总能耗</div>
        <div class="cc-value font-d-din">{{ summaryData.currentTotal }}</div>
        <div class="cc-unit">tce</div>
        <div class="cc-compare">
          <span :class="['cc-trend', summaryData.yoyType]"><i :class="summaryData.yoyType === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i> {{ summaryData.yoy }}%</span>
          <span class="cc-ref">同比去年</span>
        </div>
      </div>
      <div class="compare-card-custom">
        <div class="cc-label">上期总能耗</div>
        <div class="cc-value font-d-din">{{ summaryData.previousTotal }}</div>
        <div class="cc-unit">tce</div>
        <div class="cc-compare">
          <span :class="['cc-trend', summaryData.momType === 'up' ? 'up' : 'down']"><i :class="summaryData.momType === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i> {{ summaryData.mom }}%</span>
          <span class="cc-ref">变化幅度</span>
        </div>
      </div>
      <div class="compare-card-custom">
        <div class="cc-label">单位产值能耗</div>
        <div class="cc-value font-d-din">{{ summaryData.intensity }}</div>
        <div class="cc-unit">tce/万元</div>
        <div class="cc-compare">
          <span :class="['cc-trend', summaryData.intensityTrend]"><i :class="summaryData.intensityTrend === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i> {{ summaryData.intensityChange }}%</span>
          <span class="cc-ref">同比去年</span>
        </div>
      </div>
      <div class="compare-card-custom">
        <div class="cc-label">碳排放估算</div>
        <div class="cc-value font-d-din">{{ summaryData.carbon }}</div>
        <div class="cc-unit">tCO₂e</div>
        <div class="cc-compare">
          <span :class="['cc-trend', summaryData.carbonTrend]"><i :class="summaryData.carbonTrend === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i> {{ summaryData.carbonChange }}%</span>
          <span class="cc-ref">同比去年</span>
        </div>
      </div>
    </div>

    <!-- 动态列数据表格 -->
    <DataTable
      title="能耗数据明细"
      :data="tableData"
      :total="results.total"
      :page="results.page"
      :size="results.size"
      :loading="loading"
      :exportable="true"
      @page-change="handlePageChange"
      @export="handleExport"
    >
      <el-table-column prop="time" label="时间" min-width="140" align="center" sortable />
      <el-table-column prop="section" label="用能单元" min-width="130" align="center" />
      <!-- 动态能源品类列 -->
      <el-table-column
        v-for="col in energyColumns"
        :key="col.key"
        :prop="col.key"
        :label="col.label"
        :min-width="col.width || 90"
        align="center"
      >
        <template slot-scope="{ row }">
          <span class="font-d-din">{{ row[col.key] || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalTce" label="折标煤(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.totalTce }}</span></template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="handleDrillDown(row)">追溯</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 仪表追溯弹窗 -->
    <el-dialog :visible.sync="meterVisible" title="原始仪表数据追溯" width="640px" append-to-body>
      <div v-if="meterSource">
        <div class="meter-info">
          <div class="meter-info__row"><span class="mi-label">仪表编号：</span>{{ meterSource.meterId }}</div>
          <div class="meter-info__row"><span class="mi-label">仪表名称：</span>{{ meterSource.meterName }}</div>
          <div class="meter-info__row"><span class="mi-label">型号/协议：</span>{{ meterSource.model }} / {{ meterSource.protocol }}</div>
          <div class="meter-info__row"><span class="mi-label">安装位置：</span>{{ meterSource.installLocation }}</div>
          <div class="meter-info__row"><span class="mi-label">检定有效期：</span>{{ meterSource.calibrationValid }}</div>
        </div>
        <el-table :data="meterSource.readings" size="small" border style="margin-top:12px">
          <el-table-column prop="time" label="采集时间" min-width="150" align="center" />
          <el-table-column prop="value" label="读数" min-width="100" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.value }}</span></template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="80" align="center" />
        </el-table>
        <div v-if="meterSource.auditLog?.length" class="audit-log">
          <h4>数据修改审计日志</h4>
          <el-table :data="meterSource.auditLog" size="small" border>
            <el-table-column prop="time" label="时间" min-width="140" align="center" />
            <el-table-column prop="operator" label="操作人" width="80" align="center" />
            <el-table-column prop="action" label="操作" width="100" align="center" />
            <el-table-column prop="before" label="修改前" width="100" align="center" />
            <el-table-column prop="after" label="修改后" width="100" align="center" />
            <el-table-column prop="reason" label="原因" min-width="140" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import QueryFilter from './components/QueryFilter.vue'

// 30种子品类 → 显示名 + 大类
const ALL_SUB_TYPES = {
  raw_coal: { label:'原煤', cat:'固体燃料', unit:'t', factor:0.7143, color:'#E64A19' },
  washed_coal: { label:'洗精煤', cat:'固体燃料', unit:'t', factor:0.9000, color:'#FF7043' },
  coke: { label:'焦炭', cat:'固体燃料', unit:'t', factor:0.9714, color:'#8D6E63' },
  coal_gangue: { label:'煤矸石', cat:'固体燃料', unit:'t', factor:0.1786, color:'#A1887F' },
  crude_oil: { label:'原油', cat:'液体燃料', unit:'t', factor:1.4286, color:'#D84315' },
  gasoline: { label:'汽油', cat:'液体燃料', unit:'t', factor:1.4714, color:'#EF6C00' },
  kerosene: { label:'煤油', cat:'液体燃料', unit:'t', factor:1.4714, color:'#F9A825' },
  diesel: { label:'柴油', cat:'液体燃料', unit:'t', factor:1.4571, color:'#827717' },
  fuel_oil: { label:'燃料油', cat:'液体燃料', unit:'t', factor:1.4286, color:'#BF360C' },
  lpg: { label:'液化石油气', cat:'液体燃料', unit:'t', factor:1.7143, color:'#E65100' },
  natural_gas: { label:'天然气', cat:'气体燃料', unit:'万m³', factor:12.143, color:'#00C853' },
  coke_oven_gas: { label:'焦炉煤气', cat:'气体燃料', unit:'万m³', factor:5.714, color:'#64DD17' },
  bf_gas: { label:'高炉煤气', cat:'气体燃料', unit:'万m³', factor:1.286, color:'#009688' },
  converter_gas: { label:'转炉煤气', cat:'气体燃料', unit:'万m³', factor:2.714, color:'#26A69A' },
  lng: { label:'液化天然气', cat:'气体燃料', unit:'t', factor:1.757, color:'#00897B' },
  grid_power: { label:'电网购电', cat:'电力', unit:'万kWh', factor:1.229, color:'#1565C0' },
  hydro_power: { label:'水电', cat:'电力', unit:'万kWh', factor:1.229, color:'#00ACC1' },
  wind_power: { label:'风电', cat:'电力', unit:'万kWh', factor:1.229, color:'#43A047' },
  solar_power: { label:'光伏发电', cat:'电力', unit:'万kWh', factor:1.229, color:'#FF8F00' },
  biomass_power: { label:'生物质发电', cat:'电力', unit:'万kWh', factor:1.229, color:'#6D4C41' },
  nuclear_power: { label:'核电', cat:'电力', unit:'万kWh', factor:1.229, color:'#7B1FA2' },
  high_voltage: { label:'外购高压电', cat:'电力', unit:'万kWh', factor:1.229, color:'#283593' },
  steam_high: { label:'高压蒸汽', cat:'热力', unit:'t', factor:0.1286, color:'#F57F17' },
  steam_low: { label:'低压蒸汽', cat:'热力', unit:'t', factor:0.09, color:'#FDD835' },
  hot_water: { label:'热水', cat:'热力', unit:'GJ', factor:0.0341, color:'#FFB300' },
  methanol: { label:'甲醇', cat:'其他燃料', unit:'t', factor:0.7714, color:'#6A1B9A' },
  ethanol: { label:'乙醇', cat:'其他燃料', unit:'t', factor:0.9286, color:'#8E24AA' },
  hydrogen: { label:'氢气', cat:'其他燃料', unit:'万m³', factor:4.857, color:'#AB47BC' },
  biomass_fuel: { label:'生物质燃料', cat:'其他燃料', unit:'t', factor:0.5000, color:'#CE93D8' }
}

const CAT_INFO = {
  '固体燃料': { color:'#4A4A4A', base:320, unit:'tce' },
  '液体燃料': { color:'#CD853F', base:120, unit:'tce' },
  '气体燃料': { color:'#2FC25B', base:180, unit:'tce' },
  '电力': { color:'#1890FF', base:250, unit:'tce' },
  '热力': { color:'#FACC14', base:100, unit:'tce' },
  '其他燃料': { color:'#722ED1', base:30, unit:'tce' }
}

export default {
  name: 'DataQueryView',
  components: { TrendChart, DataTable, QueryFilter },
  data() {
    return {
      queryFilters: {},
      meterVisible: false,
      meterSource: null
    }
  },
  computed: {
    ...mapState('energy', ['query', 'loading']),
    results() { return this.query.results },
    loading() { return this.$store.state.energy.loading.query },

    // 选中的子品类 keys
    selectedKeys() { return this.queryFilters.energyTypes || [] },

    // 动态能源列定义
    energyColumns() {
      const keys = this.selectedKeys
      if (keys.length) {
        // 有筛选：按子品类展开为列
        return keys.filter(k => ALL_SUB_TYPES[k]).map(k => ({
          key: k,
          label: ALL_SUB_TYPES[k].label,
          width: 90
        }))
      }
      // 无筛选：显示6大类
      return Object.keys(CAT_INFO).map(cat => ({
        key: cat,
        label: cat,
        width: 100
      }))
    },

    // 透视表数据（将行数据按时间+用能单元聚合）
    tableData() {
      const rawList = this.results.list || []
      if (!rawList.length) return []

      const keys = this.selectedKeys
      const hasFilter = keys.length > 0

      // 按时间+用能单元分组
      const groups = {}
      rawList.forEach(row => {
        const rowKey = `${row.date}_${row.section}`
        if (!groups[rowKey]) {
          groups[rowKey] = { time: row.date, section: row.section, _cols: {}, totalTce: 0 }
        }
        const colName = hasFilter ? row.energyType : (Object.keys(ALL_SUB_TYPES).find(k => ALL_SUB_TYPES[k].cat === row.energyLabel) ? row.energyLabel : row.energyType)
        // Map sub-type to category when no filter
        const actualCol = hasFilter ? row.energyType : row.energyLabel
        groups[rowKey]._cols[actualCol] = (groups[rowKey]._cols[actualCol] || 0) + parseFloat(row.tce || 0)
        groups[rowKey].totalTce += parseFloat(row.tce || 0)
      })

      return Object.values(groups).map(g => {
        const row = { time: g.time, section: g.section, totalTce: g.totalTce.toFixed(1) }
        // 填充所有列
        if (hasFilter) {
          keys.forEach(k => { row[k] = (g._cols[k] || 0).toFixed(1) })
        } else {
          Object.keys(CAT_INFO).forEach(cat => { row[cat] = (g._cols[cat] || 0).toFixed(1) })
        }
        return row
      })
    },

    summaryData() {
      const tceVals = (this.results.list || []).map(r => parseFloat(r.tce) || 0)
      const total = tceVals.reduce((a, b) => a + b, 0) || 156.82
      return {
        currentTotal: total.toFixed(1),
        previousTotal: (total * 0.98).toFixed(1),
        yoy: '3.2', yoyType: total > 152 ? 'up' : 'down',
        mom: '2.1', momType: 'down',
        intensity: '0.38', intensityChange: '6.2', intensityTrend: 'down',
        carbon: (total * 2.67).toFixed(1), carbonChange: '4.8', carbonTrend: 'down'
      }
    },

    trendChartOption() {
      const range = this.queryFilters.timeRange || []
      let xAxis = []
      if (range.length === 2) {
        const start = new Date(range[0]), end = new Date(range[1])
        const days = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1
        if (days <= 31) {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) xAxis.push(`${d.getMonth() + 1}/${d.getDate()}`)
        } else {
          const m = []; for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) m.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          xAxis = [...new Set(m)]
        }
      }
      if (!xAxis.length) xAxis = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      const tickCount = xAxis.length
      const hasFilter = this.selectedKeys.length > 0

      const catColorMap = { '固体燃料':'#4A4A4A', '液体燃料':'#CD853F', '气体燃料':'#2FC25B', '电力':'#1890FF', '热力':'#FACC14', '其他燃料':'#722ED1' }

      let entries
      if (!hasFilter) {
        entries = Object.keys(catColorMap).map(cat => [cat, { color: catColorMap[cat], total: CAT_INFO[cat].base * 10, count: 12 }])
      } else {
        entries = this.selectedKeys.filter(k => ALL_SUB_TYPES[k]).map(k => [ALL_SUB_TYPES[k].label, { color: ALL_SUB_TYPES[k].color, total: 500, count: 12 }])
        if (!entries.length) entries = Object.keys(catColorMap).map(cat => [cat, { color: catColorMap[cat], total: CAT_INFO[cat].base * 10, count: 12 }])
      }

      const series = entries.map(([name, info], idx) => {
        const avg = (info.total / (info.count || tickCount)) || 50
        return {
          name, type: 'line', smooth: true, symbol: 'none',
          data: Array.from({ length: tickCount }, (_, i) => (avg + Math.sin((i / tickCount) * Math.PI * 2 + idx * 1.2) * avg * 0.15).toFixed(1)),
          itemStyle: { color: info.color }
        }
      })

      return {
        tooltip: { trigger: 'axis' }, legend: { data: series.map(s => s.name), bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'category', data: xAxis, boundaryGap: false },
        yAxis: { type: 'value', name: 'tce', nameLocation: 'middle', nameGap: 35, nameTextStyle: { fontSize: 14, color: '#595959', fontWeight: 'normal' }, axisLabel: { fontSize: 12, color: '#595959', formatter: '{value}' }, splitLine: { lineStyle: { type: 'dashed', color: '#E8E8E8' } } },
        series
      }
    }
  },
  mounted() { this.handleQuery(this.queryFilters) },
  methods: {
    ...mapActions('energy', ['fetchQueryResults', 'fetchMeterSource']),
    handleQuery(filters) { this.fetchQueryResults(filters || this.queryFilters) },
    handlePageChange({ page, size }) { this.fetchQueryResults({ ...this.queryFilters, page, size }) },
    handleExport() { this.$message.info('正在导出能耗数据...') },
    async handleDrillDown(row) {
      this.meterVisible = true
      await this.fetchMeterSource(row.meterId || 'M05')
      this.meterSource = this.$store.state.energy.query.meterSource
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: $gutter; }
.compare-card-custom {
  background: $background-white; border-radius: $card-radius; padding: 20px $card-padding; box-shadow: $card-shadow;
  .cc-label { font-size: $font-size-14; color: $text-secondary; margin-bottom: 8px; }
  .cc-value { font-size: $font-size-24; color: $text-primary; line-height: 1.2; }
  .cc-unit { font-size: $font-size-12; color: $text-placeholder; margin-top: 2px; }
  .cc-compare { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
  .cc-trend { display: inline-flex; align-items: center; gap: 2px; font-size: $font-size-12; font-family: $font-d-din; padding: 2px 6px; border-radius: 2px;
    &.up { color: $danger-color; background: rgba($danger-color, 0.1); }
    &.down { color: $success-color; background: rgba($success-color, 0.1); }
  }
  .cc-ref { font-size: $font-size-12; color: $text-placeholder; }
}
.meter-info { background: #FAFAFA; border-radius: $radius-md; padding: $spacing-md;
  &__row { font-size: 13px; color: $text-regular; margin-bottom: 6px; line-height: 1.6; &:last-child { margin-bottom: 0; } }
}
.mi-label { color: $text-secondary; }
.audit-log { margin-top: $spacing-md; h4 { font-size: $font-size-14; color: $text-primary; margin-bottom: 8px; } }
</style>
