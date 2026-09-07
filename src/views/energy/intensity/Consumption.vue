<template>
  <div class="consumption-view">
    <!-- 工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="refreshData" />
      <div class="tce-head">
        <span class="tce-label">综合能耗合计</span>
        <span class="tce-val font-d-din">{{ totalTce }}</span>
        <span class="tce-unit">tce</span>
      </div>
      <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- KPI 行：6大能源品类统计 -->
    <div class="kpi-grid mb-lg">
      <KpiCard v-for="item in categoryKpi" :key="item.label" :label="item.label" :value="item.value" :unit="item.unit" :status="item.status" :trend="item.trend" :trend-label="item.trendLabel" />
    </div>

    <!-- 折标煤计算表 -->
    <div class="card mb-lg">
      <h3 class="card-title">综合能耗计算 — 折标准煤（{{ shortPeriodLabel }}）</h3>
      <el-table :data="coalData" border size="small" show-summary :summary-method="getSummary">
        <el-table-column type="index" label="#" width="45" align="center" />
        <el-table-column prop="category" label="能源品类" width="100" align="center" />
        <el-table-column prop="name" label="能源品种" min-width="120" align="center">
          <template slot-scope="{ row }"><span class="type-dot" :style="{ background: row.color }"></span> {{ row.name }}</template>
        </el-table-column>
        <el-table-column prop="consumption" label="实物消耗量" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.consumption }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="90" align="center" />
        <el-table-column prop="factor" label="折标系数" width="110" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.factor }}</span></template>
        </el-table-column>
        <el-table-column prop="tce" label="折标煤(tce)" min-width="120" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.tce }}</span></template>
        </el-table-column>
        <el-table-column prop="percent" label="占比" width="80" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.percent }}%</span></template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 能源消费明细 — 按车间/产线汇总 -->
    <DataTable title="能源消费明细（按车间/产线）" :data="detailData" :total="detailTotal" :page="page" :size="size" @page-change="handlePage">
      <el-table-column prop="workshop" label="车间/产线" min-width="160" align="center" />
      <el-table-column prop="solidFuel" label="固体燃料(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.solidFuel }}</span></template>
      </el-table-column>
      <el-table-column prop="liquidFuel" label="液体燃料(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.liquidFuel }}</span></template>
      </el-table-column>
      <el-table-column prop="gasFuel" label="气体燃料(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.gasFuel }}</span></template>
      </el-table-column>
      <el-table-column prop="electricity" label="电力(tce)" min-width="110" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.electricity }}</span></template>
      </el-table-column>
      <el-table-column prop="heat" label="热力(tce)" min-width="100" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.heat }}</span></template>
      </el-table-column>
      <el-table-column prop="otherFuel" label="其他燃料(tce)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.otherFuel }}</span></template>
      </el-table-column>
      <el-table-column prop="total" label="合计(tce)" min-width="110" align="center">
        <template slot-scope="{ row }"><span class="font-d-din sum-col">{{ row.total }}</span></template>
      </el-table-column>
    </DataTable>

    <!-- 各车间产值填报 -->
    <div class="card mb-lg">
      <h3 class="card-title">各车间综合产值填报（{{ shortPeriodLabel }}）</h3>
      <p class="card-desc">用于计算单位产值能耗，请填写各车间的当期产值数据。</p>
      <el-table :data="outputData" border size="small">
        <el-table-column type="index" label="#" width="45" align="center" />
        <el-table-column prop="workshop" label="车间/产线" min-width="160" align="center" />
        <el-table-column label="产值（万元）" min-width="200" align="center">
          <template slot-scope="{ row }">
            <el-input-number v-model="row.output" :min="0" :step="10" size="small" controls-position="right" style="width:180px" />
          </template>
        </el-table-column>
        <el-table-column label="填报人" width="100" align="center">
          <template slot-scope="{ row }"><el-input v-model="row.reporter" size="small" /></template>
        </el-table-column>
        <el-table-column label="联系方式" min-width="140" align="center">
          <template slot-scope="{ row }"><el-input v-model="row.contact" size="small" /></template>
        </el-table-column>
        <el-table-column label="填报日期" width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.reportDate }}</span></template>
        </el-table-column>
      </el-table>
      <div style="margin-top:8px;text-align:right">
        <el-button size="small" type="primary" @click="saveOutputData">保存产值数据</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import DataTable from '@/components/DataTable.vue'
import OrgCascader from '../query/components/OrgCascader.vue'

const COAL_ITEMS = [
  { category:'固体燃料',name:'原煤',consumption:'1,256.80',unit:'t',factor:'0.7143',tce:'897.92',percent:'47.1',color:'#4A4A4A' },
  { category:'固体燃料',name:'洗精煤',consumption:'120.00',unit:'t',factor:'0.9000',tce:'108.00',percent:'5.7',color:'#666' },
  { category:'液体燃料',name:'柴油',consumption:'22.50',unit:'t',factor:'1.4571',tce:'32.78',percent:'1.7',color:'#CD853F' },
  { category:'液体燃料',name:'汽油',consumption:'8.20',unit:'t',factor:'1.4714',tce:'12.07',percent:'0.6',color:'#EF6C00' },
  { category:'气体燃料',name:'天然气',consumption:'45.80',unit:'万m³',factor:'12.143',tce:'556.15',percent:'29.2',color:'#2FC25B' },
  { category:'电力',name:'外购电力',consumption:'2,356.80',unit:'万kWh',factor:'1.229',tce:'289.68',percent:'15.2',color:'#1890FF' },
  { category:'热力',name:'低压蒸汽',consumption:'856.00',unit:'t',factor:'0.0900',tce:'77.04',percent:'4.0',color:'#FACC14' },
  { category:'其他燃料',name:'甲醇',consumption:'12.00',unit:'t',factor:'0.7714',tce:'9.26',percent:'0.5',color:'#722ED1' }
]

export default {
  name: 'ConsumptionView',
  components: { KpiCard, DataTable, OrgCascader },
  data() {
    return {
      selectedOrg: [],
      dateRange: ['2026-08-01', '2026-08-04'],
      page: 1, size: 10, detailTotal: 8,
      outputData: [
        { workshop:'一车间A线（粗加工）', output:5680, reporter:'张工', contact:'138****6789', reportDate:'2026-08-04' },
        { workshop:'一车间B线（精加工）', output:4320, reporter:'张工', contact:'138****6789', reportDate:'2026-08-04' },
        { workshop:'二车间C线（热处理）', output:2850, reporter:'李工', contact:'139****8901', reportDate:'2026-08-04' },
        { workshop:'二车间D线（电镀）', output:2150, reporter:'李工', contact:'139****8901', reportDate:'2026-08-04' },
        { workshop:'三车间E线（总装）', output:3860, reporter:'王工', contact:'137****4567', reportDate:'2026-08-04' },
        { workshop:'公用工程-空压站', output:1860, reporter:'赵工', contact:'136****2345', reportDate:'2026-08-04' },
        { workshop:'公用工程-制冷站', output:1560, reporter:'赵工', contact:'136****2345', reportDate:'2026-08-04' },
        { workshop:'公用工程-锅炉房', output:980, reporter:'赵工', contact:'136****2345', reportDate:'2026-08-04' }
      ]
    }
  },
  computed: {
    shortPeriodLabel() {
      const d = this.dateRange || []
      return d.length === 2 ? `${d[0]} ~ ${d[1]}` : '本月'
    },
    categoryKpi() {
      return [
        { label:'固体燃料', value:1055.92, unit:'tce', status:'default', trend:{value:2.8,type:'up'}, trendLabel:'环比' },
        { label:'液体燃料', value:44.85, unit:'tce', status:'warning', trend:{value:1.5,type:'down'}, trendLabel:'环比' },
        { label:'气体燃料', value:556.15, unit:'tce', status:'success', trend:{value:0.8,type:'down'}, trendLabel:'环比' },
        { label:'电力', value:289.68, unit:'tce', status:'default', trend:{value:3.5,type:'up'}, trendLabel:'环比' },
        { label:'热力', value:77.04, unit:'tce', status:'success', trend:{value:1.2,type:'down'}, trendLabel:'环比' },
        { label:'其他燃料', value:9.26, unit:'tce', status:'default', trend:{value:0.5,type:'up'}, trendLabel:'环比' }
      ]
    },
    coalData() { return COAL_ITEMS },
    totalTce() { return '1,906.78' },
    detailData() {
      // 按车间/产线汇总的消费明细
      const workshops = [
        { name:'一车间A线（粗加工）', solid:320.5, liquid:12.3, gas:45.2, elec:85.6, heat:22.1, other:2.5 },
        { name:'一车间B线（精加工）', solid:180.2, liquid:8.6, gas:28.4, elec:62.3, heat:15.8, other:1.8 },
        { name:'二车间C线（热处理）', solid:95.8, liquid:5.2, gas:180.5, elec:48.2, heat:35.2, other:1.2 },
        { name:'二车间D线（电镀）', solid:60.3, liquid:4.8, gas:35.6, elec:75.4, heat:12.8, other:0.8 },
        { name:'三车间E线（总装）', solid:40.2, liquid:3.5, gas:22.3, elec:52.6, heat:8.5, other:0.5 },
        { name:'公用工程-空压站', solid:0, liquid:2.2, gas:0, elec:185.3, heat:0, other:0.3 },
        { name:'公用工程-制冷站', solid:0, liquid:1.5, gas:0, elec:142.6, heat:5.2, other:0.2 },
        { name:'公用工程-锅炉房', solid:358.5, liquid:3.8, gas:244.5, elec:35.2, heat:0, other:0.8 }
      ]
      return workshops.map(w => ({
        workshop: w.name,
        solidFuel: w.solid.toFixed(1),
        liquidFuel: w.liquid.toFixed(1),
        gasFuel: w.gas.toFixed(1),
        electricity: w.elec.toFixed(1),
        heat: (w.heat || 0).toFixed(1),
        otherFuel: (w.other || 0).toFixed(1),
        total: (w.solid+w.liquid+w.gas+w.elec+(w.heat||0)+(w.other||0)).toFixed(1)
      }))
    }
  },
  methods: {
    formatDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` },
    getSummary(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((col, idx) => {
        if (idx === 0) { sums[idx] = '合计'; return }
        const vals = data.map(item => {
          const val = item[col.property]
          return parseFloat(typeof val === 'string' ? val.replace(/,/g,'') : val) || 0
        })
        if (col.property === 'consumption' || col.property === 'tce') sums[idx] = vals.reduce((a,b)=>a+b,0).toFixed(1)
        else if (col.property === 'percent') sums[idx] = '100'
        else sums[idx] = ''
      })
      return sums
    },
    saveOutputData() { this.$message.success('产值数据已保存') },
    refreshData() {},
    handlePage({page,size}) { this.page=page; this.size=size }
  }
}
</script>

<style lang="scss" scoped>
.view-toolbar { display:flex;align-items:center;gap:10px;margin-bottom:$spacing-md;padding:10px $spacing-md;background:$background-white;border-radius:$card-radius;box-shadow:$card-shadow; }
.tce-head { margin-left:auto;display:flex;align-items:baseline;gap:6px; }
.tce-label { font-size:13px;color:$text-secondary; }
.tce-val { font-size:$font-size-20;font-weight:600;color:$primary-color; }
.tce-unit { font-size:12px;color:$text-placeholder; }
.kpi-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:$gutter; }
.card { background:$background-white;border-radius:$card-radius;padding:$card-padding;box-shadow:$card-shadow; }
.card-title { font-family:$font-title;font-size:$font-size-16;color:$text-primary;margin-bottom:4px; }
.card-desc { font-size:12px;color:$text-secondary;margin:0 0 12px; }
.type-dot { display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle; }
.sum-col { color:$primary-color;font-weight:600; }
.mb-lg { margin-bottom:$spacing-lg; }
// KPI 卡片居中
::v-deep .kpi-card { text-align: center; }
::v-deep .kpi-card__header { justify-content: center; }
::v-deep .kpi-card__value { justify-content: center; }
::v-deep .kpi-card__trend { justify-content: center; }
</style>
