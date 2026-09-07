<template>
  <div class="analysis-dashboard">
    <!-- KPI 摘要区 -->
    <div class="kpi-grid mb-lg">
      <KpiCard v-for="item in kpiData" :key="item.label" v-bind="item" />
    </div>

    <!-- 图表区：分析维度分段切换 -->
    <div class="panel-toolbar mb-lg">
      <span class="panel-toolbar__label">分析维度</span>
      <el-radio-group v-model="activePanel" size="small">
        <el-radio-button label="structure">用能结构</el-radio-button>
        <el-radio-button label="load">负荷与用电</el-radio-button>
        <el-radio-button label="cost">成本与碳排</el-radio-button>
        <el-radio-button label="trend">趋势规律</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 用能结构：用能结构分析 + 车间用能排名 -->
    <div v-if="activePanel === 'structure'" class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">用能结构分析</h3>
        <TrendChart :height="320" :option="structurePieOption" />
        <div class="structure-summary">
          <span v-for="item in structureSummary" :key="item.label" class="summary-item">
            <span class="summary-dot" :style="{ background: item.color }"></span>
            {{ item.label }} {{ item.value }}%
          </span>
        </div>
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">车间用能排名（Top7）</h3>
        <TrendChart :height="380" :option="workshopRankOption" />
      </div>
    </div>

    <!-- 负荷与用电：24h负荷曲线 + 峰谷平用电 -->
    <div v-if="activePanel === 'load'" class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">
          24h 日负荷曲线
          <el-radio-group v-model="loadDayType" size="mini" style="margin-left:12px" @change="updateLoadCurve">
            <el-radio-button label="workday">工作日</el-radio-button>
            <el-radio-button label="weekend">休息日</el-radio-button>
          </el-radio-group>
        </h3>
        <TrendChart :height="300" :option="loadCurveOption" />
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">峰谷平用电分析</h3>
        <TrendChart :height="300" :option="peakValleyOption" />
        <div class="peak-summary">
          <div class="peak-item"><span class="peak-dot peak-dot--peak"></span>尖峰 8%</div>
          <div class="peak-item"><span class="peak-dot peak-dot--high"></span>高峰 27%</div>
          <div class="peak-item"><span class="peak-dot peak-dot--flat"></span>平段 47%</div>
          <div class="peak-item"><span class="peak-dot peak-dot--valley"></span>谷段 18%</div>
        </div>
      </div>
    </div>

    <!-- 成本与碳排：月度成本趋势 + 碳排放结构趋势 -->
    <div v-if="activePanel === 'cost'" class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">月度能源成本趋势</h3>
        <TrendChart :height="340" :option="costTrendOption" />
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">碳排放结构趋势（Scope 1 + Scope 2）</h3>
        <TrendChart :height="300" :option="carbonTrendOption" />
      </div>
    </div>

    <!-- 趋势规律：同环比分析 + 季节性规律 -->
    <div v-if="activePanel === 'trend'" class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">同环比趋势分析</h3>
        <TrendChart :height="300" :option="yoyMomOption" />
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">季节性用能规律</h3>
        <TrendChart :height="300" :option="seasonalOption" />
      </div>
    </div>

    <!-- 底部：TOP3 策略推荐卡片 -->
    <div class="section-card mb-lg">
      <div class="ai-header">
        <h3 class="section-title" style="margin-bottom:0">AI 策略推荐 · Top3</h3>
        <div class="ai-header__right">
          <span class="ai-badge"><i class="el-icon-cpu"></i> 智能分析</span>
          <el-button type="text" size="small" @click="$emit('switch-tab', 'strategy')">查看全部策略 <i class="el-icon-arrow-right"></i></el-button>
        </div>
      </div>
      <div class="strategy-grid">
        <div v-for="(card, idx) in topStrategies" :key="idx" class="strategy-card">
          <div class="strategy-card__header">
            <span :class="['strategy-card__priority', `priority--${card.priority}`]">{{ card.priorityLabel }}</span>
            <span class="strategy-card__category">{{ card.category }}</span>
          </div>
          <h4 class="strategy-card__title">{{ card.title }}</h4>
          <p class="strategy-card__desc">{{ card.description }}</p>
          <div class="strategy-card__metrics">
            <div class="metric">
              <span class="metric__label">预计节能</span>
              <span class="metric__value font-d-din">{{ card.saving }}</span>
            </div>
            <div class="metric">
              <span class="metric__label">投资回收期</span>
              <span class="metric__value font-d-din">{{ card.payback }}</span>
            </div>
            <div class="metric">
              <span class="metric__label">减碳量</span>
              <span class="metric__value font-d-din">{{ card.carbonReduction }}</span>
            </div>
          </div>
          <div class="strategy-card__footer">
            <span class="strategy-card__confidence">置信度 <strong class="font-d-din">{{ card.confidence }}%</strong></span>
            <el-button type="primary" size="mini" @click="$emit('apply-strategy', card)">采纳方案</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：最近异常诊断 -->
    <div class="section-card mb-lg">
      <div class="ai-header">
        <h3 class="section-title" style="margin-bottom:0">最近异常诊断</h3>
        <el-button type="text" size="small" @click="$emit('switch-tab', 'anomaly')">查看全部异常 <i class="el-icon-arrow-right"></i></el-button>
      </div>
      <div class="anomaly-list">
        <div v-for="(a, idx) in recentAnomalies" :key="idx" class="anomaly-item">
          <AlarmTag :level="a.level" :text="a.levelText" />
          <span class="anomaly-item__src">{{ a.source }}</span>
          <span class="anomaly-item__desc">{{ a.desc }}</span>
          <span class="anomaly-item__time">{{ a.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import AlarmTag from '@/components/AlarmTag.vue'

const STRUCTURE_CATEGORIES = [
  { key: 'solid_fuel', label: '固体燃料', tce: 3200, percent: 32, color: '#4A4A4A' },
  { key: 'liquid_fuel', label: '液体燃料', tce: 1200, percent: 12, color: '#CD853F' },
  { key: 'gas_fuel', label: '气体燃料', tce: 1800, percent: 18, color: '#2FC25B' },
  { key: 'electricity', label: '电力', tce: 2500, percent: 25, color: '#1890FF' },
  { key: 'heat', label: '热力', tce: 1000, percent: 10, color: '#FACC14' },
  { key: 'other_fuel', label: '其他燃料', tce: 300, percent: 3, color: '#722ED1' }
]

export default {
  name: 'AnalysisDashboard',
  components: { KpiCard, TrendChart, AlarmTag },
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] },
    timeDimension: { type: String, default: 'month' },
    energyCategory: { type: String, default: 'all' },
    compareBase: { type: String, default: 'yoy' }
  },
  data() {
    return {
      loadDayType: 'workday',
      activePanel: 'structure',
      kpiData: [
        { label: '综合能耗（当月）', value: 642.8, unit: 'tce', status: 'default', color: '#1890FF', trend: { value: 3.2, type: 'up' }, tip: '环比上月 +3.2%' },
        { label: '能源成本（当月）', value: 108.5, unit: '万元', status: 'warning', color: '#FAAD14', trend: { value: 5.8, type: 'up' }, tip: '同比去年 +5.8%' },
        { label: '碳排放（当月）', value: 1256.4, unit: 'tCO₂', status: 'default', color: '#52C41A', trend: { value: 2.1, type: 'down' }, tip: '环比上月 -2.1%' },
        { label: '单位产品能耗', value: 0.38, unit: 'kgce/件', status: 'success', color: '#722ED1', trend: { value: 4.5, type: 'down' }, tip: '优于目标值8.2%' }
      ],
      topStrategies: [
        {
          priority: 'high', priorityLabel: '高优先', category: '锅炉优化',
          title: 'BL-02 燃煤锅炉淘汰替代（煤改气+高效冷凝锅炉）',
          description: '当前热效率仅69.5%，远低于GB 24500限定值88%。建议淘汰4t/h燃煤锅炉，新建6t/h高效冷凝燃气锅炉（设计效率≥96%），同步加装省煤器。改造后年节约标煤约186 tce。',
          saving: '186 tce/年', payback: '1.8年', carbonReduction: '142 tCO₂/年', confidence: 95
        },
        {
          priority: 'high', priorityLabel: '高优先', category: '空压系统',
          title: 'AC-02 螺杆空压机变频改造+群控策略',
          description: '当前比功率7.8 kW/(m³/min)，加载率仅58%，非生产时段空载运行3h/天。变频改造配合多机联控策略，消除空载运行，比功率降至6.5以下。',
          saving: '85 tce/年', payback: '1.2年', carbonReduction: '62 tCO₂/年', confidence: 92
        },
        {
          priority: 'medium', priorityLabel: '中优先', category: '水泵系统',
          title: '循环水泵组(CP-01/给水泵)变频改造+叶轮优化',
          description: 'CP-01系统效率72%低于GB 19762标准，给水泵扬程过剩25%。叶轮切削降扬程+变频按需供水，年节电约42 tce。',
          saving: '42 tce/年', payback: '1.5年', carbonReduction: '31 tCO₂/年', confidence: 88
        }
      ],
      recentAnomalies: [
        { level: 'red', levelText: '预警', source: '淬火炉 HT-01', desc: '排烟温度192°C超阈值180°C', time: '07-15 09:15' },
        { level: 'red', levelText: '预警', source: '空压机 AC-01', desc: '用电量30分钟骤增45%', time: '07-15 08:40' },
        { level: 'yellow', levelText: '提醒', source: '燃煤锅炉 BL-02', desc: '月用煤量超限额11.6%', time: '07-14 10:00' }
      ]
    }
  },
  computed: {
    timeAxis() {
      const map = {
        day: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
        year: ['2021', '2022', '2023', '2024', '2025', '2026']
      }
      return map[this.timeDimension] || map.month
    },
    filteredStructure() {
      if (this.energyCategory === 'all') return STRUCTURE_CATEGORIES
      return STRUCTURE_CATEGORIES.filter(c => c.key === this.energyCategory)
    },
    structureSummary() {
      return this.filteredStructure.map(c => ({ label: c.label, value: c.percent, color: c.color }))
    },
    structurePieOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} tce ({d}%)' },
        legend: { show: false },
        series: [{
          type: 'pie',
          radius: ['48%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: '#595959' },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: this.filteredStructure.map(c => ({ value: c.tce, name: c.label, itemStyle: { color: c.color } }))
        }]
      }
    },
    workshopRankOption() {
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { containLabel: true, top: 10, right: 60, bottom: 20, left: 55 },
        xAxis: { type: 'value', name: 'tce', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        yAxis: { type: 'category', data: ['一车间(机加工)', '二车间(热处理+电镀)', '公用工程区', '三车间(总装)', '新能源区', '生活附属区', '其他'], inverse: true },
        series: [{
          type: 'bar', barWidth: 18,
          data: [
            { value: 212.5, itemStyle: { color: '#5470C6' } },
            { value: 162.8, itemStyle: { color: '#FAC858' } },
            { value: 138.2, itemStyle: { color: '#73C0DE' } },
            { value: 105.6, itemStyle: { color: '#91CC75' } },
            { value: 15.3, itemStyle: { color: '#3BA272' } },
            { value: 8.4, itemStyle: { color: '#FC8452' } },
            { value: 0, itemStyle: { color: '#E0E0E0' } }
          ],
          label: { show: true, position: 'right', fontFamily: 'D-DIN', fontSize: 12, formatter: '{c} tce' }
        }]
      }
    },
    loadCurveOption() {
      const workdayData = [2850, 2720, 2650, 2600, 2680, 2850, 3250, 3800, 4450, 4780, 4850, 4720, 4150, 4350, 4620, 4480, 4250, 3950, 3820, 3900, 3750, 3400, 3100, 2950]
      const weekendData = [2200, 2100, 2050, 2000, 1980, 2050, 2150, 2350, 2550, 2700, 2750, 2680, 2500, 2550, 2600, 2520, 2400, 2300, 2250, 2200, 2150, 2100, 2080, 2050]
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['全厂总负荷', '基荷基线'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 30, bottom: 40, left: 55 },
        xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`), axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', name: 'kW', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        visualMap: { show: false, pieces: [
          { lt: 7, color: 'rgba(115,192,222,0.08)' }, { gte: 7, lt: 9, color: 'rgba(145,204,117,0.08)' },
          { gte: 9, lt: 11, color: 'rgba(238,102,102,0.12)' }, { gte: 11, lt: 13, color: 'rgba(145,204,117,0.08)' },
          { gte: 13, lt: 17, color: 'rgba(238,102,102,0.12)' }, { gte: 17, lt: 21, color: 'rgba(145,204,117,0.08)' },
          { gte: 21, color: 'rgba(115,192,222,0.08)' }
        ] },
        series: [
          {
            name: '全厂总负荷', type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
            data: this.loadDayType === 'workday' ? workdayData : weekendData,
            lineStyle: { color: '#1890FF', width: 2.5 },
            areaStyle: { color: 'rgba(24,144,255,0.1)' },
            itemStyle: { color: '#1890FF' },
            markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#FAAD14' },
              data: [
                { yAxis: 4850, label: { formatter: '合同需量\n5,200kW', fontSize: 10 } },
                { yAxis: 2800, label: { formatter: '基荷\n2,800kW', fontSize: 10 } }
              ]
            }
          },
          {
            name: '基荷基线', type: 'line', smooth: true, symbol: 'none',
            data: Array(24).fill(2800),
            lineStyle: { color: '#D9D9D9', type: 'dashed', width: 1.5 },
            itemStyle: { color: '#D9D9D9' }
          }
        ]
      }
    },
    costTrendOption() {
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['固体燃料', '液体燃料', '气体燃料', '电力', '热力', '其他燃料'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: this.timeAxis, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: '万元', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: '固体燃料', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([10, 9, 8, 7, 6, 5, 5, 5, 6, 7, 9, 11]), itemStyle: { color: '#4A4A4A' } },
          { name: '液体燃料', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]), itemStyle: { color: '#CD853F' } },
          { name: '气体燃料', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([28, 25, 22, 18, 15, 14, 13, 12, 14, 18, 24, 30]), itemStyle: { color: '#2FC25B' } },
          { name: '电力', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([62, 58, 65, 68, 72, 78, 85, 88, 75, 68, 63, 66]), itemStyle: { color: '#1890FF' } },
          { name: '热力', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([12, 11, 9, 7, 5, 4, 4, 4, 5, 7, 10, 13]), itemStyle: { color: '#FACC14' } },
          { name: '其他燃料', type: 'bar', stack: 'cost', barWidth: 22, data: this.resampleData([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]), itemStyle: { color: '#722ED1' } }
        ]
      }
    },
    carbonTrendOption() {
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Scope 1(直接排放)', 'Scope 2(间接排放)'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: this.timeAxis, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'tCO₂', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: 'Scope 1(直接排放)', type: 'bar', stack: 'carbon', barWidth: 24,
            data: this.resampleData([340, 310, 280, 220, 185, 165, 155, 150, 170, 215, 275, 355]),
            itemStyle: { color: '#EE6666' } },
          { name: 'Scope 2(间接排放)', type: 'bar', stack: 'carbon', barWidth: 24,
            data: this.resampleData([1150, 1080, 1200, 1250, 1320, 1420, 1560, 1620, 1380, 1250, 1160, 1220]),
            itemStyle: { color: '#5470C6' } }
        ]
      }
    },
    peakValleyOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} 万kWh ({d}%)' },
        legend: { show: false },
        series: [{
          type: 'pie', radius: ['45%', '70%'], center: ['50%', '48%'],
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
          data: [
            { value: 18, name: '尖峰时段', itemStyle: { color: '#FF4D4F' } },
            { value: 58, name: '高峰时段', itemStyle: { color: '#FAAD14' } },
            { value: 102, name: '平段', itemStyle: { color: '#1890FF' } },
            { value: 39, name: '谷段', itemStyle: { color: '#52C41A' } }
          ]
        }]
      }
    },
    yoyMomOption() {
      const base = this.compareBase
      const compareName = base === 'mom' ? '上月' : base === 'fixed' ? '基期(2026-01)' : '去年同期'
      const compareData = base === 'mom'
        ? [672, 662, 645, 668, 655, 660, 623, null, null, null, null, null]
        : base === 'fixed'
          ? Array(12).fill(650)
          : [720, 695, 710, 688, 675, 668, 680, 690, 665, 670, 695, 710]
      const compareColor = base === 'mom' ? '#69C0FF' : '#D9D9D9'
      const compareLineType = base === 'mom' ? 'dashed' : 'dotted'
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['本月', compareName], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: this.timeAxis, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'tce', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: '本月', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
            data: this.resampleData([680, 650, 672, 658, 642, 635, 643, null, null, null, null, null]),
            lineStyle: { color: '#1890FF', width: 2.5 }, itemStyle: { color: '#1890FF' } },
          { name: compareName, type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
            data: this.resampleData(compareData),
            lineStyle: { color: compareColor, width: 2, type: compareLineType }, itemStyle: { color: compareColor } }
        ]
      }
    },
    seasonalOption() {
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['固体燃料', '液体燃料', '气体燃料', '电力', '热力', '其他燃料'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 20, bottom: 50, left: 55 },
        xAxis: { type: 'category', data: this.timeAxis, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'tce', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: '固体燃料', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([320, 302, 301, 334, 390, 330, 320, 280, 260, 310, 340, 350]),
            areaStyle: { color: 'rgba(74,74,74,0.08)' }, lineStyle: { color: '#4A4A4A', width: 2 }, itemStyle: { color: '#4A4A4A' } },
          { name: '液体燃料', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([120, 132, 101, 134, 90, 130, 110, 120, 140, 130, 110, 120]),
            areaStyle: { color: 'rgba(205,133,63,0.08)' }, lineStyle: { color: '#CD853F', width: 2 }, itemStyle: { color: '#CD853F' } },
          { name: '气体燃料', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([180, 170, 160, 190, 200, 185, 175, 165, 170, 180, 175, 190]),
            areaStyle: { color: 'rgba(47,194,91,0.08)' }, lineStyle: { color: '#2FC25B', width: 2 }, itemStyle: { color: '#2FC25B' } },
          { name: '电力', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([220, 182, 191, 234, 290, 230, 220, 200, 180, 220, 240, 250]),
            areaStyle: { color: 'rgba(24,144,255,0.08)' }, lineStyle: { color: '#1890FF', width: 2 }, itemStyle: { color: '#1890FF' } },
          { name: '热力', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([80, 92, 71, 94, 60, 90, 80, 75, 85, 80, 70, 85]),
            areaStyle: { color: 'rgba(250,204,20,0.08)' }, lineStyle: { color: '#FACC14', width: 2 }, itemStyle: { color: '#FACC14' } },
          { name: '其他燃料', type: 'line', smooth: true, symbol: 'none',
            data: this.resampleData([25, 22, 20, 28, 30, 25, 22, 18, 20, 24, 26, 28]),
            areaStyle: { color: 'rgba(114,46,209,0.08)' }, lineStyle: { color: '#722ED1', width: 2 }, itemStyle: { color: '#722ED1' } }
        ]
      }
    }
  },
  methods: {
    updateLoadCurve() {
      // computed 自动响应 loadDayType 变化
    },
    resampleData(template) {
      const len = this.timeAxis.length
      if (!template || !template.length) return []
      if (template.length === len) return template
      return Array.from({ length: len }, (_, i) => template[i % template.length])
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
.chart-row {
  display: flex;
  gap: $gutter;
}
.panel-toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__label {
    font-family: $font-title;
    font-size: $font-size-14;
    color: $text-secondary;
  }
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
}
.structure-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px $spacing-lg;
  margin-top: $spacing-sm;
  padding-top: $spacing-md;
  border-top: 1px solid $divider-color;
  font-size: $font-size-12;
  color: $text-secondary;
}
.summary-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.peak-summary {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: $spacing-sm;
  font-size: $font-size-12;
  color: $text-secondary;
}
.peak-dot {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
  &--peak { background: #FF4D4F; }
  &--high { background: #FAAD14; }
  &--flat { background: #1890FF; }
  &--valley { background: #52C41A; }
}

// AI 策略推荐
.ai-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: $spacing-md;
}
.ai-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 12px; font-size: $font-size-12;
  color: $primary-color; background: rgba($primary-color, 0.08);
  border: 1px solid rgba($primary-color, 0.2);
}
.strategy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $gutter;
}
.strategy-card {
  background: $background-color;
  border-radius: $card-radius;
  padding: $spacing-md;
  border: 1px solid $border-color-light;
  transition: all $transition-duration;
  display: flex; flex-direction: column;
  &:hover {
    border-color: rgba($primary-color, 0.3);
    box-shadow: 0 2px 12px rgba(24,144,255,0.1);
  }
  &__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  &__priority {
    display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: $font-size-12; font-weight: 500;
    &.priority--high { color: $danger-color; background: rgba($danger-color,0.1); }
    &.priority--medium { color: $warning-color; background: rgba($warning-color,0.1); }
    &.priority--low { color: $primary-color; background: rgba($primary-color,0.08); }
  }
  &__category { font-size: $font-size-12; color: $text-placeholder; }
  &__title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: 8px; line-height: $line-height-tight; }
  &__desc { font-size: $font-size-14; color: $text-secondary; line-height: $line-height-relaxed; margin-bottom: $spacing-md; flex: 1; }
  &__metrics { display: flex; gap: $spacing-lg; padding: $spacing-sm 0; margin-bottom: $spacing-md; border-top: 1px solid $divider-color; border-bottom: 1px solid $divider-color; }
  &__footer { display: flex; align-items: center; justify-content: space-between; }
  &__confidence { font-size: $font-size-12; color: $text-secondary; strong { color: $success-color; } }
}
.metric {
  display: flex; flex-direction: column; gap: 4px;
  &__label { font-size: $font-size-12; color: $text-placeholder; }
  &__value { font-size: $font-size-14; color: $text-primary; font-weight: 600; }
}
.ai-header__right { display: flex; align-items: center; gap: 12px; }
.anomaly-list { display: flex; flex-direction: column; gap: 10px; }
.anomaly-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: $background-color; border-radius: 4px;
  &__src { font-size: $font-size-14; color: $text-primary; font-weight: 500; min-width: 130px; }
  &__desc { font-size: $font-size-14; color: $text-secondary; flex: 1; }
  &__time { font-size: $font-size-12; color: $text-placeholder; font-family: $font-d-din; }
}
</style>
