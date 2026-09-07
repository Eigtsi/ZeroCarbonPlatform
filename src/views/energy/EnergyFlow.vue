<template>
  <div class="energy-flow">
    <!-- 顶部工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        :clearable="false"
        style="width: 240px"
      />
      <el-radio-group v-model="timeGranularity" size="small" @change="handleGranularityChange">
        <el-radio-button label="month">月</el-radio-button>
        <el-radio-button label="quarter">季</el-radio-button>
        <el-radio-button label="year">年</el-radio-button>
      </el-radio-group>
      <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- 能流 KPI 摘要 -->
    <div class="kpi-row">
      <KpiCard
        v-for="item in flowKpiData"
        :key="item.label"
        v-bind="item"
      />
    </div>

    <!-- 能量流动桑基图 -->
    <SankeyChart
      title="园区能量流动桑基图（四层拓扑）"
      :height="520"
      :data="sankeyData"
    />
    <div class="flow-legend">
      <span class="flow-legend__label">能源品类：</span>
      <span class="flow-legend__item"><i style="background:#5470C6"></i>电力</span>
      <span class="flow-legend__item"><i style="background:#91CC75"></i>天然气</span>
      <span class="flow-legend__item"><i style="background:#333333"></i>原煤</span>
      <span class="flow-legend__item"><i style="background:#FAC858"></i>柴油</span>
      <span class="flow-legend__item"><i style="background:#3BA272"></i>光伏</span>
      <span class="flow-legend__item"><i style="background:#EE6666"></i>蒸汽</span>
    </div>

    <!-- 能流分析明细 -->
    <div class="flow-tabs">
      <el-tabs v-model="activeTab" type="card">
        <!-- Tab 1：能源平衡表 -->
        <el-tab-pane label="能源平衡表" name="balance" lazy>
          <div class="panel">
            <div class="panel__header">
              <span class="panel__title">能源平衡表（GB/T 28749）</span>
              <div class="panel__actions">
                <el-radio-group v-model="balanceView" size="mini" @change="handleBalanceViewChange">
                  <el-radio-button label="year">年度汇总</el-radio-button>
                  <el-radio-button label="quarter">季度</el-radio-button>
                  <el-radio-button label="month">月度</el-radio-button>
                </el-radio-group>
                <el-button size="mini" icon="el-icon-download" @click="handleExport('excel')">导出Excel</el-button>
                <el-button size="mini" icon="el-icon-printer" @click="handleExport('pdf')">导出PDF</el-button>
              </div>
            </div>
            <el-table
              :data="balanceRows"
              size="small"
              border
              :row-class-name="balanceRowClass"
              style="width: 100%"
            >
              <el-table-column prop="name" label="能源品种" min-width="120" align="center" fixed="left" />
              <el-table-column prop="init" label="期初库存" min-width="90" align="center" />
              <el-table-column prop="buy" label="本期购入" min-width="100" align="center" />
              <el-table-column prop="produce" label="本期产出(转换)" min-width="120" align="center" />
              <el-table-column prop="consume" label="本期消费" min-width="100" align="center" />
              <el-table-column prop="end" label="期末库存" min-width="90" align="center" />
              <el-table-column prop="loss" label="损失量" min-width="90" align="center" />
              <el-table-column label="平衡差" min-width="100" align="center">
                <template slot-scope="scope">
                  <span :class="['balance-diff', { 'balance-diff--warn': scope.row.warn }]">{{ scope.row.diff }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="panel__footnote">注：单位 tce（吨标准煤）；平衡差 = |购入 + 产出 − 消费 − 损失 − 期末| / 合计，Δ &gt; 3% 标橙提示校验。</div>
          </div>
        </el-tab-pane>

        <!-- Tab 2：转换效率 -->
        <el-tab-pane label="转换效率" name="efficiency" lazy>
          <div class="panel">
            <div class="panel__header">
              <span class="panel__title">主要用能设备转换效率分析</span>
              <span class="panel__sub">效率低于额定 90% 标橙建议检修，低于 80% 标红强制淘汰</span>
            </div>
            <div class="eff-grid">
              <div v-for="d in efficiencyDevices" :key="d.key" :class="['eff-card', `eff-card--${d.level}`]">
                <div class="eff-card__header">
                  <span class="eff-card__name">{{ d.name }}</span>
                  <span :class="['eff-status', `eff-status--${d.level}`]">{{ d.status }}</span>
                </div>
                <div class="eff-card__kpi">
                  <div class="eff-card__main">
                    <span class="eff-card__actual font-d-din">{{ d.actual }}</span>
                    <span class="eff-card__rated">额定 {{ d.rated }}</span>
                  </div>
                  <span :class="['eff-card__diff font-d-din', `eff-diff--${d.level}`]">{{ d.diff }}</span>
                </div>
                <svg class="eff-card__spark" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <polyline
                    :points="sparkPoints(d.trend)"
                    fill="none"
                    :stroke="levelColor(d.level)"
                    stroke-width="1.5"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
                <div class="eff-card__io">{{ d.io }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3：损耗溯源 -->
        <el-tab-pane label="损耗溯源" name="loss" lazy>
          <div class="loss-panel">
            <div class="panel">
              <div class="panel__header">
                <span class="panel__title">损耗构成月度堆积图</span>
                <span class="panel__sub">年度损耗合计约 800 tce</span>
              </div>
              <TrendChart :option="lossStackOption" height="300" />
            </div>
            <div class="loss-panel__row">
              <div class="panel loss-panel__half">
                <div class="panel__header">
                  <span class="panel__title">损耗环节 Top5</span>
                </div>
                <TrendChart :option="lossTop5Option" height="300" />
              </div>
              <div class="panel loss-panel__half">
                <div class="panel__header">
                  <span class="panel__title">损耗类型构成</span>
                </div>
                <TrendChart :option="lossTypePieOption" height="300" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4：余热评估 -->
        <el-tab-pane label="余热评估" name="wasteHeat" lazy>
          <div class="waste-panel">
            <div class="waste-summary">
              <div class="waste-summary__item">
                <span class="waste-summary__label">可回收余热总量</span>
                <span class="waste-summary__value font-d-din">18,300 <em>GJ</em></span>
                <span class="waste-summary__sub">≈ 624 tce/年</span>
              </div>
              <div class="waste-summary__item">
                <span class="waste-summary__label">回收 60% 后年节能</span>
                <span class="waste-summary__value font-d-din">374 <em>tce</em></span>
                <span class="waste-summary__sub">优先改造 6 处余热源</span>
              </div>
              <div class="waste-summary__item">
                <span class="waste-summary__label">降低综合能耗</span>
                <span class="waste-summary__value font-d-din">4.7<em>%</em></span>
                <span class="waste-summary__sub">按当前 8,000 tce 折算</span>
              </div>
            </div>
            <div class="panel">
              <div class="panel__header">
                <span class="panel__title">余热源回收方案（按优先级排序）</span>
              </div>
              <el-table :data="wasteHeatSources" size="small" border style="width: 100%">
                <el-table-column prop="priority" label="优先级" width="80" align="center">
                  <template slot-scope="scope">
                    <span class="waste-priority font-d-din">{{ scope.row.priority }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="余热源" min-width="150" align="center" />
                <el-table-column prop="grade" label="温度等级" min-width="120" align="center" />
                <el-table-column prop="temp" label="温度范围" min-width="100" align="center" />
                <el-table-column prop="amount" label="余热量" min-width="120" align="center" />
                <el-table-column prop="method" label="回收方式" min-width="140" align="center" />
                <el-table-column prop="invest" label="投资(万元)" min-width="100" align="center">
                  <template slot-scope="scope">
                    <span class="font-d-din">{{ scope.row.invest }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="payback" label="回收期" min-width="90" align="center" />
                <el-table-column prop="benefit" label="年效益(tce)" min-width="110" align="center">
                  <template slot-scope="scope">
                    <span class="font-d-din">{{ scope.row.benefit }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="maturity" label="技术成熟度" min-width="100" align="center" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import OrgCascader from './query/components/OrgCascader.vue'
import KpiCard from '@/components/KpiCard.vue'
import SankeyChart from '@/components/SankeyChart.vue'
import TrendChart from '@/components/TrendChart.vue'

function genTrend(base, amp = 1.5, drift = 0) {
  return Array.from({ length: 30 }, (_, i) => +(base + drift * i + (Math.random() - 0.5) * amp).toFixed(1))
}

export default {
  name: 'EnergyFlow',
  components: { OrgCascader, KpiCard, SankeyChart, TrendChart },
  data() {
    return {
      selectedOrg: [],
      dateRange: ['2026-01-01', '2026-12-31'],
      timeGranularity: 'year',
      activeTab: 'balance',
      balanceView: 'year',
      flowKpiData: [
        { label: '综合能源利用率', value: 69.5, unit: '%', status: 'default', decimal: 1, trend: { value: 1.2, type: 'up' }, tip: '有效利用 ÷ 总输入 × 100%' },
        { label: '年度综合能耗', value: 8000, unit: 'tce', status: 'default', decimal: 0, trend: { value: 2.1, type: 'down' }, tip: '约 8,000 tce/年（GB/T 2589）' },
        { label: '能量平衡闭合差', value: 1.88, unit: '%', status: 'success', decimal: 2, trend: { value: 0.3, type: 'down' }, tip: 'Δ ≤ 3%，平衡校验正常' },
        { label: '可回收余热潜力', value: 374, unit: 'tce', status: 'warning', decimal: 0, trend: { value: 5.6, type: 'up' }, tip: '按 60% 回收率估算' }
      ],
      sankeyData: {
        nodes: [
          { name: '外购电力', color: '#5470C6' },
          { name: '天然气', color: '#91CC75' },
          { name: '原煤', color: '#333333' },
          { name: '柴油', color: '#FAC858' },
          { name: '光伏发电', color: '#3BA272' },
          { name: '配电变压器', color: '#5470C6' },
          { name: '逆变器', color: '#FAC858' },
          { name: '燃气锅炉BL-01', color: '#EE6666' },
          { name: '燃煤锅炉BL-02', color: '#AA6666' },
          { name: '空压站', color: '#73C0DE' },
          { name: '冷冻站', color: '#3BA272' },
          { name: '冷却塔', color: '#91CC75' },
          { name: '分汽缸', color: '#EE6666' },
          { name: '一车间', color: '#5470C6' },
          { name: '二车间', color: '#FAC858' },
          { name: '三车间', color: '#91CC75' },
          { name: '公用工程', color: '#73C0DE' },
          { name: '生活附属', color: '#FC8452' },
          { name: 'A线粗加工', color: '#5470C6' },
          { name: 'B线精加工', color: '#5470C6' },
          { name: 'C线热处理', color: '#FAC858' },
          { name: 'D线电镀', color: '#FAC858' },
          { name: 'E线总装', color: '#91CC75' },
          { name: '压缩空气系统', color: '#73C0DE' },
          { name: '冷冻水系统', color: '#3BA272' },
          { name: '锅炉房', color: '#EE6666' },
          { name: '水处理系统', color: '#73C0DE' },
          { name: '环保处理', color: '#FC8452' },
          { name: '办公楼', color: '#FC8452' },
          { name: '食堂', color: '#FC8452' },
          { name: '宿舍', color: '#FC8452' }
        ],
        links: [
          { source: '外购电力', target: '配电变压器', value: 108000 },
          { source: '光伏发电', target: '逆变器', value: 7200 },
          { source: '逆变器', target: '配电变压器', value: 7200 },
          { source: '天然气', target: '燃气锅炉BL-01', value: 7800 },
          { source: '天然气', target: 'C线热处理', value: 3200 },
          { source: '天然气', target: '环保处理', value: 890 },
          { source: '天然气', target: '食堂', value: 180 },
          { source: '原煤', target: '燃煤锅炉BL-02', value: 31400 },
          { source: '柴油', target: '一车间', value: 1200 },
          { source: '配电变压器', target: '一车间', value: 42000 },
          { source: '配电变压器', target: '二车间', value: 38000 },
          { source: '配电变压器', target: '三车间', value: 15000 },
          { source: '配电变压器', target: '公用工程', value: 64800 },
          { source: '配电变压器', target: '生活附属', value: 3600 },
          { source: '燃气锅炉BL-01', target: '分汽缸', value: 26000 },
          { source: '燃煤锅炉BL-02', target: '分汽缸', value: 10400 },
          { source: '分汽缸', target: '一车间', value: 7300 },
          { source: '分汽缸', target: 'D线电镀', value: 5100 },
          { source: '分汽缸', target: '三车间', value: 3600 },
          { source: '分汽缸', target: '锅炉房', value: 9500 },
          { source: '分汽缸', target: '生活附属', value: 2900 },
          { source: '一车间', target: 'A线粗加工', value: 25000 },
          { source: '一车间', target: 'B线精加工', value: 17000 },
          { source: '二车间', target: 'C线热处理', value: 22000 },
          { source: '二车间', target: 'D线电镀', value: 16000 },
          { source: '三车间', target: 'E线总装', value: 15000 },
          { source: '公用工程', target: '空压站', value: 22000 },
          { source: '公用工程', target: '冷冻站', value: 18000 },
          { source: '公用工程', target: '冷却塔', value: 8000 },
          { source: '公用工程', target: '水处理系统', value: 6800 },
          { source: '公用工程', target: '环保处理', value: 10000 },
          { source: '空压站', target: '压缩空气系统', value: 19800 },
          { source: '冷冻站', target: '冷冻水系统', value: 16200 },
          { source: '冷却塔', target: 'C线热处理', value: 4000 },
          { source: '冷却塔', target: 'D线电镀', value: 3200 },
          { source: '生活附属', target: '办公楼', value: 1800 },
          { source: '生活附属', target: '食堂', value: 1200 },
          { source: '生活附属', target: '宿舍', value: 600 }
        ]
      },
      balanceRows: [
        { name: '外购电力', init: '0', buy: '3,687', produce: '0', consume: '3,520', end: '0', loss: '167', diff: '0.0%', warn: false },
        { name: '天然气', init: '0', buy: '2,671', produce: '0', consume: '2,561', end: '0', loss: '110', diff: '0.0%', warn: false },
        { name: '原煤', init: '42', buy: '1,029', produce: '0', consume: '985', end: '36', loss: '50', diff: '0.0%', warn: false },
        { name: '柴油', init: '5', buy: '87', produce: '0', consume: '90', end: '2', loss: '0', diff: '0.0%', warn: false },
        { name: '光伏(自用)', init: '0', buy: '0', produce: '246', consume: '246', end: '0', loss: '0', diff: '0.0%', warn: false },
        { name: '蒸汽(自产)', init: '0', buy: '0', produce: '2,540', consume: '2,410', end: '0', loss: '105', diff: '1.0%', warn: false },
        { name: '压缩空气', init: '0', buy: '0', produce: '860', consume: '812', end: '0', loss: '35', diff: '1.5%', warn: false },
        { name: '冷冻水', init: '0', buy: '0', produce: '620', consume: '610', end: '0', loss: '10', diff: '0.0%', warn: false },
        { name: '循环水', init: '0', buy: '0', produce: '180', consume: '178', end: '0', loss: '2', diff: '0.0%', warn: false },
        { name: '纯化水', init: '0', buy: '0', produce: '95', consume: '93', end: '0', loss: '2', diff: '0.0%', warn: false },
        { name: '氮气(外购)', init: '0', buy: '12', produce: '0', consume: '11', end: '0', loss: '1', diff: '0.0%', warn: false },
        { name: '合计', init: '47', buy: '7,486', produce: '4,541', consume: '—', end: '38', loss: '482', diff: '1.88%', warn: false, total: true }
      ],
      efficiencyDevices: [
        { key: 'BL-02', name: '燃煤锅炉 BL-02', io: 'M12 原煤 → M13 蒸汽', rated: '88.0%', actual: '69.5%', diff: '-21.0%', level: 'red', status: '强制淘汰建议', trend: genTrend(70, 2.5, -0.25) },
        { key: 'AC-02', name: '螺杆空压机 AC-02', io: 'M16 电力 → M18 压缩空气', rated: '80.0%', actual: '76.8%', diff: '-4.0%', level: 'orange', status: '建议检修', trend: genTrend(77, 1.8, -0.08) },
        { key: 'AC-01', name: '离心空压机 AC-01', io: 'M16 电力 → M17 压缩空气', rated: '85.0%', actual: '82.1%', diff: '-3.4%', level: 'orange', status: '建议检修', trend: genTrend(82, 1.5, -0.05) },
        { key: 'BL-01', name: '燃气锅炉 BL-01', io: 'M10 天然气 → M11 蒸汽', rated: '92.0%', actual: '92.3%', diff: '+0.3%', level: 'green', status: '达标', trend: genTrend(92.3, 1.0, 0) },
        { key: 'CH-01', name: '离心冷水机 CH-01', io: 'M20 电力 → M21 冷冻水', rated: 'COP 5.0', actual: '5.2', diff: '+4.0%', level: 'green', status: '达标', trend: genTrend(5.2, 0.15, 0) },
        { key: 'CH-02', name: '螺杆冷水机 CH-02', io: 'M20 电力 → M21 冷冻水', rated: 'COP 4.5', actual: '4.6', diff: '+2.2%', level: 'green', status: '达标', trend: genTrend(4.6, 0.12, 0) },
        { key: 'TR', name: '配电变压器', io: 'M01(10kV) → 各配电间', rated: '98.5%', actual: '98.6%', diff: '+0.1%', level: 'green', status: '达标', trend: genTrend(98.6, 0.4, 0) },
        { key: 'INV', name: '逆变器 INV-01~04', io: '光伏DC → M31(AC)', rated: '98.0%', actual: '98.2%', diff: '+0.2%', level: 'green', status: '达标', trend: genTrend(98.2, 0.4, 0) },
        { key: 'PCS-C', name: '储能变流器 PCS-01(充电)', io: 'M33(AC) → 电池', rated: '95.0%', actual: '95.3%', diff: '+0.3%', level: 'green', status: '达标', trend: genTrend(95.3, 0.5, 0) },
        { key: 'PCS-D', name: '储能变流器 PCS-01(放电)', io: '电池 → M34(AC)', rated: '95.0%', actual: '95.1%', diff: '+0.1%', level: 'green', status: '达标', trend: genTrend(95.1, 0.5, 0) }
      ],
      lossTrend: [
        { name: '传输损耗', values: [24, 23, 25, 22, 21, 20, 22, 23, 21, 24, 26, 29], color: '#5470C6' },
        { name: '转换损耗', values: [35, 34, 36, 33, 32, 31, 33, 34, 32, 35, 37, 38], color: '#FF4D4F' },
        { name: '待机损耗', values: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], color: '#FAAD14' },
        { name: '余热排放', values: [4, 4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 4], color: '#52C41A' }
      ],
      lossTop5: [
        { name: 'BL-02 燃煤锅炉转换损失', value: 210 },
        { name: 'AC-02 空压机转换损失', value: 88 },
        { name: '蒸汽管道散热损失', value: 65 },
        { name: '压缩空气管网泄漏', value: 42 },
        { name: '配电变压器损耗', value: 38 }
      ],
      lossTypeData: [
        { name: '传输损耗', value: 280, color: '#5470C6' },
        { name: '转换损耗', value: 410, color: '#FF4D4F' },
        { name: '待机损耗', value: 60, color: '#FAAD14' },
        { name: '余热排放', value: 50, color: '#52C41A' }
      ],
      wasteHeatSources: [
        { priority: 1, name: '冷水机组冷凝热', grade: '低温(<200℃)', temp: '32-37℃', amount: '4,800 GJ/年', method: '生活热水预热', invest: 60, payback: '1.5年', benefit: '82', maturity: '成熟' },
        { priority: 2, name: '淬火/回火炉烟气', grade: '中温(200-400℃)', temp: '280-350℃', amount: '5,200 GJ/年', method: '预热燃烧空气', invest: 150, payback: '2.2年', benefit: '89', maturity: '成熟' },
        { priority: 3, name: '锅炉 BL-01 排烟', grade: '中温(200-400℃)', temp: '220℃', amount: '1,800 GJ/年', method: '加热锅炉给水', invest: 45, payback: '2.0年', benefit: '31', maturity: '成熟' },
        { priority: 4, name: 'RTO 废气焚烧炉烟气', grade: '高温(≥400℃)', temp: '750℃', amount: '3,500 GJ/年', method: '余热锅炉产蒸汽', invest: 320, payback: '3.5年', benefit: '60', maturity: '较成熟' },
        { priority: 5, name: '空压机冷却风', grade: '低温(<200℃)', temp: '40-60℃', amount: '2,100 GJ/年', method: '冬季采暖预热', invest: 30, payback: '1.8年', benefit: '36', maturity: '成熟' },
        { priority: 6, name: '淬火油冷槽换热', grade: '低温(<200℃)', temp: '80-120℃', amount: '900 GJ/年', method: 'ORC 低温发电', invest: 200, payback: '4.5年', benefit: '15', maturity: '论证中' }
      ]
    }
  },
  computed: {
    lossStackOption() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: this.lossTrend.map(i => i.name), bottom: 0 },
        grid: { left: 20, right: 20, top: 30, bottom: 40, containLabel: true },
        xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#E8E8E8' } }, axisLabel: { color: '#595959' } },
        yAxis: { type: 'value', name: 'tce', nameTextStyle: { color: '#8C8C8C' }, splitLine: { lineStyle: { color: '#F0F0F0' } } },
        series: this.lossTrend.map(i => ({
          name: i.name,
          type: 'bar',
          stack: 'loss',
          barMaxWidth: 22,
          data: i.values,
          itemStyle: { color: i.color }
        }))
      }
    },
    lossTop5Option() {
      const data = [...this.lossTop5].reverse()
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 20, right: 40, top: 10, bottom: 10, containLabel: true },
        xAxis: { type: 'value', name: 'tce', nameTextStyle: { color: '#8C8C8C' }, splitLine: { lineStyle: { color: '#F0F0F0' } } },
        yAxis: { type: 'category', data: data.map(i => i.name), axisLabel: { color: '#595959', fontSize: 11 }, axisLine: { lineStyle: { color: '#E8E8E8' } } },
        series: [{
          type: 'bar',
          barMaxWidth: 18,
          data: data.map(i => i.value),
          itemStyle: { color: '#FF4D4F', borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: '#595959' }
        }]
      }
    },
    lossTypePieOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}：{c} tce（{d}%）' },
        legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
        series: [{
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '44%'],
          label: { formatter: '{d}%', color: '#595959' },
          data: this.lossTypeData.map(i => ({ name: i.name, value: i.value, itemStyle: { color: i.color } }))
        }]
      }
    }
  },
  methods: {
    refreshData() {
      this.$message.success('能流数据已刷新')
    },
    handleGranularityChange(val) {
      this.$message.info(`时间粒度已切换为：${val === 'month' ? '月' : val === 'quarter' ? '季' : '年'}`)
    },
    handleBalanceViewChange(val) {
      const map = { year: '年度汇总', quarter: '季度', month: '月度' }
      this.$message.info(`平衡表视图切换为：${map[val]}`)
    },
    handleExport(type) {
      this.$message.success(`能源平衡表已导出为 ${type === 'excel' ? 'Excel' : 'PDF'}`)
    },
    balanceRowClass({ row }) {
      if (row.total) return 'balance-total-row'
      if (row.warn) return 'balance-warn-row'
      return ''
    },
    levelColor(level) {
      return { red: '#FF4D4F', orange: '#FAAD14', green: '#52C41A' }[level] || '#52C41A'
    },
    sparkPoints(arr) {
      const min = Math.min(...arr)
      const max = Math.max(...arr)
      const range = max - min || 1
      return arr.map((v, i) => {
        const x = (i / (arr.length - 1)) * 100
        const y = 29 - ((v - min) / range) * 26
        return `${x.toFixed(1)},${y.toFixed(1)}`
      }).join(' ')
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-flow {
  padding: $gutter;
}

.view-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: $spacing-md;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
  margin-bottom: $spacing-md;
}

.flow-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 24px;
  margin-bottom: $spacing-md;
  background: $background-white;
  border-radius: $card-radius;
  box-shadow: $card-shadow;

  &__label {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-12;
    color: $text-primary;

    i {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      display: inline-block;
    }
  }
}

.flow-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 0;
  }
  ::v-deep .el-tabs__content {
    padding-top: $spacing-md;
  }
}

.panel {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
  margin-bottom: $spacing-md;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
  }

  &__title {
    font-family: $font-title;
    font-size: $font-size-16;
    color: $text-primary;
  }

  &__sub {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__footnote {
    margin-top: 12px;
    font-size: $font-size-12;
    color: $text-placeholder;
    line-height: $line-height-relaxed;
  }
}

// 平衡表
::v-deep .balance-total-row {
  background: #f5f5f5 !important;
  font-weight: 600;
}
::v-deep .balance-warn-row {
  background: rgba(250, 173, 20, 0.08) !important;
}
.balance-diff {
  color: $text-primary;
  &--warn {
    color: $warning-color;
    font-weight: 600;
  }
}

// 转换效率
.eff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $gutter;
}
.eff-card {
  border: 1px solid #e8e8e8;
  border-radius: $radius-md;
  padding: 16px;
  transition: box-shadow $transition-duration;

  &:hover {
    box-shadow: $card-shadow;
  }

  &--red {
    border-left: 3px solid $danger-color;
  }
  &--orange {
    border-left: 3px solid $warning-color;
  }
  &--green {
    border-left: 3px solid $success-color;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__name {
    font-size: $font-size-14;
    font-weight: 600;
    color: $text-primary;
  }

  &__kpi {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__main {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__actual {
    font-size: $font-size-24;
    color: $text-primary;
  }

  &__rated {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__diff {
    font-size: $font-size-16;
    font-weight: 600;
  }

  &__spark {
    width: 100%;
    height: 40px;
    display: block;
  }

  &__io {
    margin-top: 8px;
    font-size: $font-size-12;
    color: $text-placeholder;
  }
}

.eff-status {
  font-size: $font-size-12;
  padding: 2px 8px;
  border-radius: $radius-sm;
  &--red { color: $danger-color; background: rgba(255, 77, 79, 0.1); }
  &--orange { color: $warning-color; background: rgba(250, 173, 20, 0.1); }
  &--green { color: $success-color; background: rgba(82, 196, 26, 0.1); }
}

.eff-diff {
  &--red { color: $danger-color; }
  &--orange { color: $warning-color; }
  &--green { color: $success-color; }
}

// 损耗溯源
.loss-panel {
  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $gutter;
  }
  &__half {
    margin-bottom: 0;
  }
}

// 余热评估
.waste-panel {
  display: flex;
  flex-direction: column;
}
.waste-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $gutter;
  margin-bottom: $spacing-md;

  &__item {
    background: linear-gradient(135deg, #1890ff 0%, #3ba272 100%);
    border-radius: $card-radius;
    padding: 20px 24px;
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: $card-shadow;
  }

  &__label {
    font-size: $font-size-12;
    opacity: 0.85;
    margin-bottom: 8px;
  }

  &__value {
    font-size: $font-size-24;
    line-height: 1;

    em {
      font-style: normal;
      font-size: $font-size-12;
      margin-left: 4px;
      opacity: 0.85;
    }
  }

  &__sub {
    font-size: $font-size-12;
    opacity: 0.85;
    margin-top: 8px;
  }
}
.waste-priority {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  font-size: $font-size-12;
}
</style>