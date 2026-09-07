<template>
  <div class="intensity-view">
    <!-- 工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="refreshData" />
      <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- KPI 行 -->
    <div class="kpi-grid mb-lg">
      <KpiCard v-for="item in kpiList" :key="item.label" :label="item.label" :value="item.value" :unit="item.unit" :status="item.status" :trend="item.trend" />
    </div>

    <!-- 强度计算 + 趋势 -->
    <div class="chart-row mb-lg">
      <div class="intensity-card">
        <h3 class="card-title">能耗强度指标</h3>
        <div class="intensity-list">
          <div v-for="item in intensityItems" :key="item.label" class="intensity-item">
            <div class="ii-header">
              <span class="ii-label">{{ item.label }}</span>
              <span :class="['ii-trend', item.trendType]">
                <i :class="item.trendType==='up'?'el-icon-top':'el-icon-bottom'"></i> {{ item.change }}%
              </span>
            </div>
            <div class="ii-value">
              <span class="ii-num font-d-din">{{ item.value }}</span>
              <span class="ii-unit">{{ item.unit }}</span>
            </div>
            <el-progress :percentage="item.progress" :color="item.progressColor" :stroke-width="6" :show-text="false" />
            <div class="ii-ref">目标：{{ item.target }} {{ item.unit }}</div>
          </div>
        </div>
      </div>
      <div class="chart-col--1">
        <TrendChart title="能源强度趋势" :height="340" :option="trendOption" />
      </div>
    </div>

    <!-- 能效排名 -->
    <DataTable title="能效排名（按车间）" :data="rankingData" :pagination="false" class="mb-lg">
      <el-table-column prop="rank" label="排名" width="60" align="center">
        <template slot-scope="{ row }">
          <span :class="['rank-badge', `rank-${row.rank}`]">{{ row.rank }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="车间/产线" min-width="160" align="center" />
      <el-table-column prop="output" label="产值(万元)" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.output }}</span></template>
      </el-table-column>
      <el-table-column prop="consumption" label="综合能耗(tce)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.consumption }}</span></template>
      </el-table-column>
      <el-table-column prop="intensity" label="能耗强度(tce/万元)" min-width="140" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.intensity }}</span></template>
      </el-table-column>
      <el-table-column prop="level" label="能效等级" width="100" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.level===1?'success':row.level===2?'warning':'danger'" size="small">{{ row.level }}级</el-tag>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 产品产量填报 & 排名（合并） -->
    <div class="card mb-lg">
      <div class="card-title-row">
        <h3 class="card-title">产品产量填报与排名</h3>
        <span class="formula-tip">单位产品能耗 = 综合能耗 ÷ 产品产量</span>
      </div>
      <p class="card-desc">填报产量后自动计算单位产品能耗并排名。</p>
      <el-table :data="productRankData" border size="small">
        <el-table-column prop="rank" label="排名" width="60" align="center">
          <template slot-scope="{ row }">
            <span :class="['rank-badge', `rank-${row.rank}`]">{{ row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="line" label="产线" min-width="160" align="center" />
        <el-table-column prop="product" label="主要产品" width="100" align="center" />
        <el-table-column label="产量" min-width="160" align="center">
          <template slot-scope="{ row }">
            <el-input-number v-model="row.quantity" :min="0" :step="10" size="small" controls-position="right" style="width:130px" />
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="tce" label="综合能耗(tce)" width="120" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.tce }}</span></template>
        </el-table-column>
        <el-table-column label="单位产品能耗" min-width="150" align="center">
          <template slot-scope="{ row }">
            <span class="font-d-din">{{ row.quantity > 0 ? (row.tce / row.quantity).toFixed(3) : '--' }}</span>
            <span style="font-size:11px;color:#999;margin-left:2px">{{ row.unitStrComputed }}</span>
          </template>
        </el-table-column>
        <el-table-column label="能效等级" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.level===1?'success':row.level===2?'warning':'danger'" size="small">{{ row.level }}级</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:8px;text-align:right">
        <el-button size="small" type="primary" @click="saveProductData">保存并更新排名</el-button>
      </div>
    </div>

    <!-- 目标考核 -->
    <div class="card">
      <h3 class="card-title">目标考核完成情况</h3>
      <div class="target-grid">
        <div v-for="item in targetData" :key="item.name" class="target-item">
          <div class="target-header">
            <span class="target-name">{{ item.name }}</span>
            <span class="target-pct font-d-din">{{ item.percent }}%</span>
          </div>
          <el-progress :percentage="item.percent" :color="item.percent>=100?'#52C41A':item.percent>=80?'#1890FF':'#FAAD14'" :stroke-width="10" />
          <div class="target-detail">
            <span>实际：{{ item.actual }} {{ item.unit }}</span>
            <span>目标：{{ item.target }} {{ item.unit }}</span>
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
import OrgCascader from '../query/components/OrgCascader.vue'

export default {
  name: 'IntensityCalcView',
  components: { KpiCard, TrendChart, DataTable, OrgCascader },
  data() {
    return {
      selectedOrg: [], dateRange: ['2026-07-01', '2026-07-31'],
      productData: [
        { line:'一车间A线（粗加工）', product:'机加工件', quantity:1250, unit:'t', tce:325.6 },
        { line:'一车间B线（精加工）', product:'精密件', quantity:860, unit:'t', tce:268.4 },
        { line:'二车间C线（热处理）', product:'热处理件', quantity:2100, unit:'t', tce:366.2 },
        { line:'二车间D线（电镀）', product:'电镀件', quantity:3500, unit:'m²', tce:189.6 },
        { line:'三车间E线（总装）', product:'成品', quantity:580, unit:'台', tce:127.5 }
      ]
    }
  },
  computed: {
    kpiList() {
      return [
        { label:'单位产值能耗',value:'0.38',unit:'tce/万元',status:'success',trend:{value:'6.2',type:'down'} },
        { label:'单位增加值能耗',value:'0.52',unit:'tce/万元',status:'warning',trend:{value:'2.8',type:'down'} },
        { label:'单位产品能耗',value:'156.8',unit:'kgce/t',status:'default',trend:{value:'3.5',type:'down'} },
        { label:'节能量',value:'380',unit:'tce',status:'success',trend:{value:'12.5',type:'up'} }
      ]
    },
    intensityItems() {
      return [
        { label:'单位产值能耗',value:'0.38',unit:'tce/万元',change:'6.2',trendType:'down',progress:95,target:'0.40',progressColor:'#52C41A' },
        { label:'单位增加值能耗',value:'0.52',unit:'tce/万元',change:'2.8',trendType:'down',progress:87,target:'0.60',progressColor:'#1890FF' },
        { label:'单位产品能耗',value:'156.8',unit:'kgce/t',change:'3.5',trendType:'down',progress:78,target:'200',progressColor:'#1890FF' }
      ]
    },
    trendOption() {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return {
        tooltip:{trigger:'axis'},legend:{data:['单位产值能耗','单位增加值能耗','单位产品能耗'],bottom:0},
        grid:{top:20,right:20,bottom:40,left:50},
        xAxis:{type:'category',data:months},
        yAxis:{type:'value',name:'tce/万元',nameLocation:'middle',nameGap:35,nameTextStyle:{fontSize:14,color:'#595959'},axisLabel:{fontSize:12}},
        series:[
          {name:'单位产值能耗',type:'line',smooth:true,data:[0.42,0.41,0.40,0.39,0.38,0.37,0.36,null,null,null,null,null],itemStyle:{color:'#1890FF'}},
          {name:'单位产品能耗',type:'line',smooth:true,data:[0.32,0.31,0.30,0.29,0.28,0.27,0.26,null,null,null,null,null],itemStyle:{color:'#FACC14'}},{name:'单位增加值能耗',type:'line',smooth:true,data:[0.58,0.56,0.55,0.54,0.52,0.50,0.49,null,null,null,null,null],itemStyle:{color:'#52C41A'}}
        ]
      }
    },
    rankingData() {
      return [
        { rank:1, name:'一车间A线（粗加工）',output:'5,680.00',consumption:'1,825.60',intensity:'0.32',level:1 },
        { rank:2, name:'一车间B线（精加工）',output:'4,320.00',consumption:'1,512.00',intensity:'0.35',level:1 },
        { rank:3, name:'三车间E线（总装）',output:'3,860.00',consumption:'1,426.90',intensity:'0.37',level:1 },
        { rank:4, name:'二车间D线（电镀）',output:'2,150.00',consumption:'860.00',intensity:'0.40',level:2 },
        { rank:5, name:'二车间C线（热处理）',output:'2,850.00',consumption:'1,282.50',intensity:'0.45',level:2 },
        { rank:6, name:'公用工程-空压站',output:'1,860.00',consumption:'856.60',intensity:'0.46',level:2 },
        { rank:7, name:'公用工程-制冷站',output:'1,560.00',consumption:'780.00',intensity:'0.50',level:3 },
        { rank:8, name:'公用工程-锅炉房',output:'980.00',consumption:'558.58',intensity:'0.57',level:3 }
      ]
    },
    productRankData() {
      if (!this.productData.length) return []
      return this.productData
        .map(p => ({
          ...p,
          unitEnergy: p.quantity > 0 ? (p.tce / p.quantity).toFixed(3) : '--',
          unitStrComputed: p.unit === 't' ? 'tce/t' : p.unit === 'm²' ? 'tce/m²' : p.unit === '台' ? 'tce/台' : 'tce/单位',
          level: p.quantity > 0 ? (p.tce / p.quantity <= 0.2 ? 1 : p.tce / p.quantity <= 0.4 ? 2 : 3) : 3
        }))
        .sort((a, b) => {
          const va = a.quantity > 0 ? a.tce / a.quantity : 999
          const vb = b.quantity > 0 ? b.tce / b.quantity : 999
          return va - vb
        })
        .map((p, i) => ({ ...p, rank: i + 1 }))
    },
    targetData() {
      return [
        { name:'年度能耗强度目标',actual:'0.38',target:'0.40',unit:'tce/万元',percent:95 },
        { name:'年度节能量目标',actual:'380',target:'500',unit:'tce',percent:76 },
        { name:'万元产值能耗下降率',actual:'3.8%',target:'5.0%',unit:'',percent:76 },
        { name:'清洁能源占比提升',actual:'35.8%',target:'40%',unit:'',percent:90 }
      ]
    }
  },
  methods: {
    refreshData() {},
    saveProductData() {
      // 触发响应式更新
      this.productData = this.productData.map(p => ({ ...p }))
      this.$message.success('产量已保存，排名和等级已更新')
    }
  }
}
</script>

<style lang="scss" scoped>
.view-toolbar { display:flex;align-items:center;gap:10px;margin-bottom:$spacing-md;padding:10px $spacing-md;background:$background-white;border-radius:$card-radius;box-shadow:$card-shadow; }
.kpi-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:$gutter; }
.card { background:$background-white;border-radius:$card-radius;padding:$card-padding;box-shadow:$card-shadow; }
.card-title { font-family:$font-title;font-size:$font-size-16;color:$text-primary;margin:0; }
.card-title-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px; }
.formula-tip { font-size:12px;color:$text-placeholder;background:#f5f5f5;padding:2px 10px;border-radius:10px; }
.card-desc { font-size:12px;color:$text-secondary;margin:0 0 12px; }
::v-deep .kpi-card { text-align: center; }
::v-deep .kpi-card__header { justify-content: center; }
::v-deep .kpi-card__value { justify-content: center; }
::v-deep .kpi-card__trend { justify-content: center; }
.chart-row { display:flex;gap:$gutter; align-items:stretch; }
.intensity-card { flex:0 0 calc(50% - 8px); background:$background-white;border-radius:$card-radius;padding:$card-padding;box-shadow:$card-shadow; }
.chart-col--1 { flex:0 0 calc(50% - 8px); }
.intensity-list { display:flex;flex-direction:column;gap:8px; }
.intensity-item { padding:10px;background:#FAFAFA;border-radius:$radius-md; }
.ii-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:4px; }
.ii-label { font-size:$font-size-14;color:$text-regular; }
.ii-trend { font-size:$font-size-12;padding:1px 6px;border-radius:2px;
  &.up { color:$danger-color;background:rgba($danger-color,0.1); }
  &.down { color:$success-color;background:rgba($success-color,0.1); }
}
.ii-value { display:flex;align-items:baseline;gap:6px;margin-bottom:3px; }
.ii-num { font-size:$font-size-20;color:$text-primary; }
.ii-unit { font-size:$font-size-12;color:$text-placeholder; }
.ii-ref { font-size:11px;color:$text-placeholder;margin-top:3px; }
.rank-badge { display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;font-size:12px;font-weight:600;color:#fff;
  &.rank-1{background:#FF4D4F} &.rank-2{background:#FA541C} &.rank-3{background:#FAAD14} &.rank-4,&.rank-5,&.rank-6,&.rank-7,&.rank-8{background:#D9D9D9;color:#595959}
}
.target-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:20px; }
.target-item { .target-header { display:flex;justify-content:space-between;margin-bottom:6px;font-size:$font-size-14; } .target-name{color:$text-regular;} .target-pct{font-family:$font-d-din;color:$text-primary;} .target-detail{display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:$text-placeholder;} }
.mb-lg { margin-bottom:$spacing-lg; }
</style>
