<template>
  <div class="cost-analysis">
    <!-- 成本KPI -->
    <div class="kpi-grid mb-lg">
      <KpiCard v-for="item in costKpis" :key="item.label" v-bind="item" />
    </div>

    <!-- 第一行：月度费用堆叠 + 度电成本趋势 -->
    <div class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">月度能源费用构成（堆叠柱状图）</h3>
        <TrendChart :height="340" :option="monthlyCostStackOption" />
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">度电成本趋势（含基本电费+力调电费）</h3>
        <TrendChart :height="340" :option="unitCostTrendOption" />
      </div>
    </div>

    <!-- 第二行：成本结构饼图 + 力调电费分析 -->
    <div class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">能源成本结构</h3>
        <TrendChart :height="320" :option="costPieOption" />
        <div class="cost-summary">
          <span v-for="item in costSummary" :key="item.label" class="cost-item">
            <span class="cost-dot" :style="{ background: item.color }"></span>
            {{ item.label }} {{ item.amount }}万元 ({{ item.percent }}%)
          </span>
        </div>
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">力调电费与功率因数</h3>
        <TrendChart :height="320" :option="powerFactorOption" />
        <div class="pf-info">
          <el-alert title="当前功率因数 PF=0.92" type="warning" :closable="false" show-icon description="月均力调罚款约1.2万元→年14.4万元。建议加装无功补偿装置，目标PF≥0.96，年可节约力调电费+线损约18万元。" />
        </div>
      </div>
    </div>

    <!-- 第三行：基本电费优化空间 + 峰谷套利 -->
    <div class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">基本电费优化分析</h3>
        <div class="demand-analysis">
          <div class="demand-row">
            <span class="demand-label">合同申报需量</span>
            <span class="demand-value font-d-din">5,200 kW</span>
          </div>
          <div class="demand-row">
            <span class="demand-label">近12月实际最大需量</span>
            <span class="demand-value font-d-din" style="color:#FF4D4F">6,100 kW</span>
          </div>
          <div class="demand-row demand-row--over">
            <span class="demand-label">超额</span>
            <span class="demand-value font-d-din" style="color:#FF4D4F">+900 kW</span>
            <span class="demand-penalty">年罚款 ~37.8万元</span>
          </div>
          <el-divider />
          <p class="demand-suggestion">建议：1) 储能系统削峰（PCS-01 500kW填谷削峰）→降低峰时最大需量约400kW；2) 大设备错峰启动（AC-01/CH-01分时启动，避免同时段峰值叠加）→降低约300kW。</p>
        </div>
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">峰谷价差套利评估</h3>
        <div class="arbitrage-analysis">
          <div class="arb-row">
            <span class="arb-label">可转移负荷</span>
            <span class="arb-value font-d-din">~400 kW</span>
            <span class="arb-desc">(DR-01/AC-02/PW-01等)</span>
          </div>
          <div class="arb-row">
            <span class="arb-label">日可转移时长</span>
            <span class="arb-value font-d-din">8 h/天</span>
          </div>
          <div class="arb-row">
            <span class="arb-label">峰谷电价差</span>
            <span class="arb-value font-d-din">0.55 元/kWh</span>
          </div>
          <div class="arb-row arb-row--result">
            <span class="arb-label">年套利收益估算</span>
            <span class="arb-value font-d-din" style="color:#52C41A;font-size:24px">~64.2 万元/年</span>
          </div>
          <el-divider />
          <p class="demand-suggestion">含储能充放电套利（PCS-01 500kW×4h循环=2MWh/天×0.55元×365天=40.1万元/年）+ 错峰排产节费（可转移负荷~24.1万元/年）。</p>
        </div>
      </div>
    </div>

    <!-- 品种替代经济性评估 -->
    <div class="section-card">
      <h3 class="section-title">能源品种替代经济性评估</h3>
      <el-table :data="substitutionData" size="small" border>
        <el-table-column prop="scenario" label="替代方案" min-width="220" />
        <el-table-column prop="currentCost" label="当前年费用(万元)" min-width="140" align="center" />
        <el-table-column prop="newCost" label="替代后年费用(万元)" min-width="140" align="center" />
        <el-table-column prop="annualSaving" label="年节约(万元)" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span :style="{ color: row.annualSaving > 0 ? '#52C41A' : '#FF4D4F' }" class="font-d-din">{{ row.annualSaving > 0 ? '+' + row.annualSaving : row.annualSaving }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="carbonBenefit" label="减碳效益(tCO₂/年)" min-width="140" align="center" />
        <el-table-column prop="conclusion" label="综合评估" min-width="200" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.conclusionType" size="small">{{ row.conclusion }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'

export default {
  name: 'CostAnalysis',
  components: { KpiCard, TrendChart },
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] }
  },
  data() {
    return {
      costKpis: [
        { label: '当月能源总费用', value: 108.5, unit: '万元', status: 'warning', trend: { value: 5.8, type: 'up' }, tip: '同比去年 +5.8%' },
        { label: '度电成本（含基本电费）', value: 0.72, unit: '元/kWh', status: 'default', trend: { value: 1.2, type: 'up' }, tip: '峰时占比偏高' },
        { label: '当月力调电费', value: 1.2, unit: '万元', status: 'warning', trend: { value: 0.3, type: 'up' }, tip: 'PF=0.92，低于0.95奖励线' },
        { label: '峰谷套利空间（年）', value: 64.2, unit: '万元', status: 'success', trend: { value: 12.5, type: 'up' }, tip: '含储能+错峰排产' }
      ],
      costSummary: [
        { label: '电力', amount: 62.9, percent: 58, color: '#1890FF' },
        { label: '气体燃料', amount: 30.4, percent: 28, color: '#2FC25B' },
        { label: '固体燃料', amount: 9.8, percent: 9, color: '#4A4A4A' },
        { label: '液体燃料', amount: 3.3, percent: 3, color: '#CD853F' },
        { label: '热力', amount: 1.5, percent: 1.4, color: '#FACC14' },
        { label: '其他燃料', amount: 0.6, percent: 0.6, color: '#722ED1' }
      ],
      substitutionData: [
        { scenario: 'BL-02煤改气（燃煤锅炉→燃气锅炉）', currentCost: '1500t×800元/t=120万', newCost: '增购~300万m³天然气×3.5=1050万', annualSaving: -930, carbonBenefit: '—(气贵但减排)', conclusion: '经济性差，需碳收益补贴', conclusionType: 'danger' },
        { scenario: 'AC-02变频改造（工频→变频）', currentCost: '132kW×6000h×0.72=57.0万', newCost: '132kW×5000h×0.72×0.75=35.6万', annualSaving: 21.4, carbonBenefit: 62, conclusion: '推荐（回收期1.2年）', conclusionType: 'success' },
        { scenario: '屋顶光伏扩容（2MWp→3.5MWp）', currentCost: '新增发电150万kWh×0.72=108万（外购电费）', newCost: '投资420万÷15年=28万/年+运维8万', annualSaving: 72, carbonBenefit: 228, conclusion: '推荐（回收期4.5年）', conclusionType: 'success' },
        { scenario: '谷电储能套利（PCS-01充放电优化）', currentCost: '峰时购电2MWh/天×0.95=1.9元/kWh', newCost: '谷时充电成本0.40×2MWh×1.05(损耗)', annualSaving: 40.1, carbonBenefit: '—(碳排不变)', conclusion: '推荐（回收期即时）', conclusionType: 'success' },
        { scenario: 'CP-01水泵变频改造', currentCost: '45kW×7200h×0.72=23.3万', newCost: '45kW×6000h×0.72×0.70=13.6万', annualSaving: 9.7, carbonBenefit: 31, conclusion: '推荐（回收期1.5年）', conclusionType: 'success' }
      ]
    }
  },
  computed: {
    monthlyCostStackOption() {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['固体燃料','液体燃料','气体燃料','电力','热力','其他燃料'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: '万元', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontSize: 11 } },
        series: [
          { name:'固体燃料',type:'bar',stack:'cost',barWidth:22,data:[10,9,8,7,6,5,5,5,6,7,9,11],itemStyle:{color:'#4A4A4A'}},
          { name:'液体燃料',type:'bar',stack:'cost',barWidth:22,data:[3,3,3,3,3,3,3,3,3,3,3,3],itemStyle:{color:'#CD853F'}},
          { name:'气体燃料',type:'bar',stack:'cost',barWidth:22,data:[28,25,22,18,15,14,13,12,14,18,24,30],itemStyle:{color:'#2FC25B'}},
          { name:'电力',type:'bar',stack:'cost',barWidth:22,data:[62,58,65,68,72,78,85,88,75,68,63,66],itemStyle:{color:'#1890FF'}},
          { name:'热力',type:'bar',stack:'cost',barWidth:22,data:[12,11,9,7,5,4,4,4,5,7,10,13],itemStyle:{color:'#FACC14'}},
          { name:'其他燃料',type:'bar',stack:'cost',barWidth:22,data:[2,2,2,2,2,2,2,2,2,2,2,2],itemStyle:{color:'#722ED1'}}
        ]
      }
    },
    unitCostTrendOption() {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['度电成本(含基本电费)','纯电能量成本'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: '元/kWh', min: 0.3, nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontSize: 11 } },
        series: [
          { name:'度电成本(含基本电费)',type:'line',smooth:true,symbol:'circle',symbolSize:4,data:[0.70,0.68,0.71,0.72,0.73,0.75,0.78,0.79,0.76,0.73,0.71,0.72],lineStyle:{color:'#FF4D4F',width:2.5},itemStyle:{color:'#FF4D4F'}},
          { name:'纯电能量成本',type:'line',smooth:true,symbol:'circle',symbolSize:4,data:[0.55,0.54,0.56,0.57,0.58,0.59,0.61,0.62,0.60,0.58,0.56,0.57],lineStyle:{color:'#1890FF',width:2},itemStyle:{color:'#1890FF'}}
        ]
      }
    },
    costPieOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c}万元 ({d}%)' },
        series: [{
          type: 'pie', radius: ['45%','72%'], center: ['50%','48%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: this.costSummary.map(c => ({ value: c.amount, name: c.label, itemStyle: { color: c.color } }))
        }]
      }
    },
    powerFactorOption() {
      const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['功率因数PF','力调电费'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
        yAxis: [
          { type: 'value', name: 'PF', min: 0.85, max: 1.0, nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
          { type: 'value', name: '万元', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } }
        ],
        series: [
          { name:'功率因数PF',type:'line',yAxisIndex:0,smooth:true,symbol:'circle',symbolSize:5,
            data:[0.91,0.90,0.92,0.93,0.91,0.92,0.92,0.90,0.93,0.94,0.92,0.91],lineStyle:{color:'#1890FF',width:2.5},itemStyle:{color:'#1890FF'},
            markLine:{silent:true,symbol:'none',data:[
              {yAxis:0.95,lineStyle:{type:'dashed',color:'#52C41A'},label:{formatter:'奖励线 PF≥0.95',fontSize:10}},
              {yAxis:0.90,lineStyle:{type:'dashed',color:'#FF4D4F'},label:{formatter:'罚款线 PF≤0.90',fontSize:10}}
            ]} },
          { name:'力调电费',type:'bar',yAxisIndex:1,barWidth:18,
            data:[1.3,1.5,1.2,0.8,1.3,1.1,1.2,1.6,0.7,0.5,1.0,1.2],itemStyle:{color:'#FAAD14'} }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: $gutter; }
.chart-row { display: flex; gap: $gutter; }
.section-card { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.section-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.cost-summary { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 20px; margin-top: 8px; font-size: $font-size-12; color: $text-secondary; }
.cost-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.pf-info { margin-top: $spacing-md; }
.demand-analysis { padding: $spacing-sm 0; }
.demand-row { display: flex; align-items: center; gap: $spacing-md; padding: 8px 0; }
.demand-row--over { background: rgba(255,77,79,0.05); padding: 8px 12px; border-radius: 4px; }
.demand-label { font-size: $font-size-14; color: $text-secondary; width: 160px; }
.demand-value { font-size: $font-size-18; font-weight: 600; }
.demand-penalty { font-size: $font-size-14; color: $danger-color; font-weight: 500; }
.demand-suggestion { font-size: $font-size-14; color: $text-secondary; line-height: $line-height-relaxed; }
.arbitrage-analysis { padding: $spacing-sm 0; }
.arb-row { display: flex; align-items: center; gap: $spacing-md; padding: 8px 0; }
.arb-row--result { background: rgba(82,196,26,0.05); padding: 12px; border-radius: 4px; }
.arb-label { font-size: $font-size-14; color: $text-secondary; width: 140px; }
.arb-value { font-size: $font-size-18; font-weight: 600; }
.arb-desc { font-size: $font-size-12; color: $text-placeholder; }
</style>
