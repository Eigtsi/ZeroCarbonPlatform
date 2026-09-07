<template>
  <div class="device-diagnosis">
    <div class="device-layout">
      <!-- 左侧设备列表 -->
      <div class="device-list-panel">
        <div class="panel-header">
          <el-input v-model="searchKey" placeholder="搜索设备名称/型号/计量点" size="small" clearable prefix-icon="el-icon-search" />
          <div class="filter-row">
            <el-select v-model="filterType" placeholder="设备类型" size="small" multiple collapse-tags style="width:100%">
              <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <div class="filter-row">
            <el-select v-model="filterGrade" placeholder="能效等级" size="small" multiple collapse-tags style="width:100%">
              <el-option label="1级(先进)" :value="1" /><el-option label="2级(中等)" :value="2" /><el-option label="3级(落后)" :value="3" />
            </el-select>
          </div>
        </div>
        <div class="device-list">
          <div v-for="device in filteredDevices" :key="device.id"
            :class="['device-item', { 'device-item--active': selectedDevice && selectedDevice.id === device.id }]"
            @click="selectDevice(device)">
            <div class="device-item__line1">
              <span class="device-item__name">{{ device.name }}</span>
              <span :class="['grade-badge-sm', `grade-sm--${device.gradeClass}`]">{{ device.grade }}</span>
            </div>
            <div class="device-item__line2">
              <span class="device-item__type">{{ device.type }}</span>
              <span class="device-item__metric font-d-din">{{ device.efficiency }}%</span>
            </div>
            <div class="device-item__line3">
              <span class="device-item__trend">
                退化趋势
                <i :class="device.degradation > 0 ? 'el-icon-top trend-up' : device.degradation < 0 ? 'el-icon-bottom trend-down' : 'el-icon-minus trend-stable'"></i>
                {{ Math.abs(device.degradation) }}%/月
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧设备详情 -->
      <div class="device-detail-panel" v-if="selectedDevice">
        <div class="detail-header">
          <h3 class="detail-title">{{ selectedDevice.name }}</h3>
          <span :class="['grade-badge-lg', `grade-lg--${selectedDevice.gradeClass}`]">{{ selectedDevice.grade }}能效</span>
        </div>
        <!-- 基本信息卡片 -->
        <div class="info-grid mb-md">
          <div class="info-item"><span class="info-label">型号</span><span class="info-value">{{ selectedDevice.model }}</span></div>
          <div class="info-item"><span class="info-label">额定参数</span><span class="info-value">{{ selectedDevice.ratedParam }}</span></div>
          <div class="info-item"><span class="info-label">安装日期</span><span class="info-value">{{ selectedDevice.installDate }}</span></div>
          <div class="info-item"><span class="info-label">所属车间</span><span class="info-value">{{ selectedDevice.workshop }}</span></div>
          <div class="info-item"><span class="info-label">关联计量点</span><span class="info-value font-d-din">{{ selectedDevice.meters }}</span></div>
          <div class="info-item"><span class="info-label">适用标准</span><span class="info-value">{{ selectedDevice.standard }}</span></div>
        </div>
        <!-- 运行参数趋势 -->
        <div class="section-card mb-md">
          <h4 class="subsection-title">运行参数趋势（近30天）</h4>
          <TrendChart :height="280" :option="deviceTrendOption" />
        </div>
        <!-- 能效指标仪表盘 -->
        <div class="chart-row mb-md">
          <div class="section-card flex-1">
            <h4 class="subsection-title">能效指标四刻度</h4>
            <div class="gauge-row">
              <div v-for="g in deviceGauges" :key="g.label" class="gauge-item">
                <div class="gauge-value font-d-din" :style="{ color: g.color }">{{ g.value }}{{ g.suffix }}</div>
                <div class="gauge-label">{{ g.label }}</div>
              </div>
            </div>
          </div>
          <div class="section-card flex-1">
            <h4 class="subsection-title">节能潜力量化</h4>
            <div class="saving-analysis">
              <p class="saving-text">{{ selectedDevice.savingAnalysis }}</p>
            </div>
          </div>
        </div>
        <!-- 能效退化趋势 -->
        <div class="section-card mb-md">
          <h4 class="subsection-title">能效退化检测（近90天 · OLS回归）</h4>
          <TrendChart :height="260" :option="degradationOption" />
        </div>
        <!-- 维修履历 -->
        <div class="section-card">
          <h4 class="subsection-title">维修/保养履历</h4>
          <el-timeline>
            <el-timeline-item v-for="(log, idx) in selectedDevice.maintenanceLog" :key="idx"
              :timestamp="log.date" :type="log.type" :color="log.color" placement="top">
              <p>{{ log.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 未选中设备时的提示 -->
      <div class="device-detail-panel device-detail--empty" v-else>
        <div class="empty-hint">
          <i class="el-icon-info" style="font-size:48px;color:#D9D9D9"></i>
          <p>请从左侧列表选择一台设备查看诊断详情</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TrendChart from '@/components/TrendChart.vue'

export default {
  name: 'DeviceDiagnosis',
  components: { TrendChart },
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] }
  },
  data() {
    return {
      searchKey: '',
      filterType: [],
      filterGrade: [],
      deviceTypes: ['工业锅炉', '空压机', '冷水机组', '变压器', '电动机', '水泵', '逆变器', 'PCS'],
      selectedDevice: null,
      devices: [
        { id: 'BL01', name: '燃气锅炉 BL-01', type: '工业锅炉', grade: '1级', gradeClass: 'good', efficiency: 92.3, degradation: 0.02, model: 'WNS6-1.25-Q', ratedParam: '蒸发量6t/h/压力1.25MPa', installDate: '2020-06', workshop: '公用工程-锅炉房', meters: 'M10(天然气)→M11(蒸汽)', standard: 'GB 24500', savingAnalysis: '当前效率92.3% vs 历史最佳93.1% → 恢复到历史最佳年节能约8 tce；若升级高效冷凝锅炉(η≥96%)年节能约42 tce。',
          maintenanceLog: [{ date:'2026-03', content:'计划停炉检修（清灰+除垢）', type:'primary', color:'#1890FF' },{ date:'2025-11', content:'更换燃烧器喷嘴，效率恢复0.8个百分点', type:'success', color:'#52C41A' },{ date:'2025-06', content:'清灰保养，效率恢复1.2个百分点', type:'success', color:'#52C41A' },{ date:'2025-01', content:'年度检验——安全阀、压力表校验合格', type:'primary', color:'#1890FF' },{ date:'2024-09', content:'省煤器管束局部泄漏→更换管束', type:'danger', color:'#FF4D4F' }] },
        { id: 'BL02', name: '燃煤锅炉 BL-02', type: '工业锅炉', grade: '3级', gradeClass: 'bad', efficiency: 69.5, degradation: -0.85, model: 'DZL4-1.25-AII', ratedParam: '蒸发量4t/h/压力1.25MPa', installDate: '2012-03', workshop: '公用工程-锅炉房', meters: 'M12(原煤)→M13(蒸汽)', standard: 'GB 24500', savingAnalysis: '当前效率69.5%，远低于GB 24500限定值88%→年均多耗煤~300t，建议淘汰替代（煤改气），年节能约186 tce，减排142 tCO₂。', maintenanceLog: [{ date:'2026-02', content:'炉排卡涩故障抢修', type:'danger', color:'#FF4D4F' },{ date:'2025-10', content:'省煤器管束更换（已严重腐蚀）', type:'danger', color:'#FF4D4F' },{ date:'2025-04', content:'年度停炉清灰检修', type:'warning', color:'#FAAD14' },{ date:'2024-07', content:'引风机轴承更换', type:'warning', color:'#FAAD14' }] },
        { id: 'AC01', name: '离心空压机 AC-01', type: '空压机', grade: '1级', gradeClass: 'good', efficiency: 82.1, degradation: -0.05, model: 'ZH630-8', ratedParam: '250kW/排气量40m³/min', installDate: '2021-03', workshop: '公用工程-空压站', meters: 'M16(电力)→M17(排气量)', standard: 'GB 19153', savingAnalysis: '当前比功率6.1 kW/(m³/min)，优于GB 19153 2级限值6.3→工况良好，建议定期维护保持。', maintenanceLog: [{ date:'2026-04', content:'更换空气滤芯及油分离器', type:'success', color:'#52C41A' },{ date:'2025-08', content:'年度维保——轴承检查+润滑油更换', type:'primary', color:'#1890FF' }] },
        { id: 'AC02', name: '螺杆空压机 AC-02', type: '空压机', grade: '3级', gradeClass: 'bad', efficiency: 76.8, degradation: -0.32, model: 'GA132-8.5', ratedParam: '132kW/排气量22m³/min', installDate: '2018-09', workshop: '公用工程-空压站', meters: 'M16(电力)→M18(排气量)', standard: 'GB 19153', savingAnalysis: '当前比功率7.8，高于GB 19153 2级限值7.2→加载率仅58%+非生产时段空载3h→建议变频改造，年节能约85 tce，投资回收期1.2年。', maintenanceLog: [{ date:'2026-01', content:'皮带张紧调整+进气阀清洗', type:'warning', color:'#FAAD14' },{ date:'2025-07', content:'油分离器更换（压差偏高）', type:'warning', color:'#FAAD14' }] },
        { id: 'CH01', name: '离心冷水机 CH-01', type: '冷水机组', grade: '1级', gradeClass: 'good', efficiency: 83.8, degradation: 0.01, model: 'YK-6K6K-95D', ratedParam: '1200kW/制冷量6,300kW', installDate: '2021-06', workshop: '公用工程-制冷站', meters: 'M20(电力)→M21/M22(冷量)', standard: 'GB 19577', savingAnalysis: '当前COP 5.2，优于GB 19577 1级限值5.0→工况优秀。夏季高峰期间建议优先投用CH-01，CH-02辅助。', maintenanceLog: [{ date:'2026-05', content:'制冷季前维保——冷凝器通炮清洗', type:'success', color:'#52C41A' },{ date:'2025-11', content:'制冷季结束后防冻保养', type:'primary', color:'#1890FF' }] },
        { id: 'CH02', name: '螺杆冷水机 CH-02', type: '冷水机组', grade: '2级', gradeClass: 'mid', efficiency: 79.3, degradation: -0.12, model: 'RTHD-D2E2', ratedParam: '800kW/制冷量3,680kW', installDate: '2019-05', workshop: '公用工程-制冷站', meters: 'M20(电力)→M21/M22(冷量)', standard: 'GB 19577', savingAnalysis: '当前COP 4.6，达到GB 19577 2级→建议非制冷季降频运行并加强冷凝器清洗频率。', maintenanceLog: [{ date:'2026-04', content:'冷凝器化学清洗', type:'warning', color:'#FAAD14' },{ date:'2025-09', content:'压缩机吸气压力偏低→补充制冷剂', type:'warning', color:'#FAAD14' }] },
        { id: 'CP01', name: '循环水泵组 CP-01', type: '水泵', grade: '2级', gradeClass: 'mid', efficiency: 72.0, degradation: -0.18, model: 'KQW200/315-45/4', ratedParam: '45kW/流量300m³/h/扬程32m', installDate: '2019-03', workshop: '公用工程-水处理站', meters: 'M27(电力)', standard: 'GB 19762', savingAnalysis: '当前系统效率72%，低于GB 19762 2级80%→给水泵扬程过剩25%→叶轮切削+变频改造，年节能约42 tce。', maintenanceLog: [{ date:'2025-12', content:'机械密封泄漏更换', type:'danger', color:'#FF4D4F' }] },
        { id: 'INV01', name: '逆变器 INV-01', type: '逆变器', grade: '1级', gradeClass: 'good', efficiency: 98.2, degradation: -0.01, model: 'SUN2000-500KTL', ratedParam: '500kW/DC1500V', installDate: '2023-03', workshop: '新能源区-光伏方阵', meters: '光伏DC→M31(AC)', standard: 'NB/T 32004', savingAnalysis: '当前效率98.2%，优于额定98%→性能良好。建议每季度清洁光伏组件表面灰尘以维持高转化率。', maintenanceLog: [{ date:'2026-02', content:'季度巡检——散热风机运行正常', type:'success', color:'#52C41A' }] },
        { id: 'PCS01', name: '储能变流器 PCS-01', type: 'PCS', grade: '1级', gradeClass: 'good', efficiency: 95.3, degradation: -0.03, model: 'SC500TL', ratedParam: '500kW/AC400V', installDate: '2023-06', workshop: '新能源区-储能系统', meters: 'M33→M34', standard: 'GB/T 34120', savingAnalysis: '充放电效率95.3%/95.1%→正常。建议优化充放电策略（峰谷套利+需量管理）以提升储能经济性。', maintenanceLog: [{ date:'2026-03', content:'半年检——电池柜BAT-01~04均衡性测试', type:'success', color:'#52C41A' }] }
      ]
    }
  },
  computed: {
    filteredDevices() {
      let list = this.devices
      if (this.searchKey) {
        const kw = this.searchKey.toLowerCase()
        list = list.filter(d => d.name.toLowerCase().includes(kw) || d.model.toLowerCase().includes(kw) || d.meters.toLowerCase().includes(kw))
      }
      if (this.filterType.length) list = list.filter(d => this.filterType.includes(d.type))
      if (this.filterGrade.length) list = list.filter(d => this.filterGrade.includes(d.gradeClass === 'good' ? 1 : d.gradeClass === 'mid' ? 2 : 3))
      return list
    },
    deviceGauges() {
      if (!this.selectedDevice) return []
      const d = this.selectedDevice
      return [
        { label: '当前值', value: d.efficiency, suffix: '%', color: d.gradeClass === 'good' ? '#52C41A' : d.gradeClass === 'mid' ? '#FAAD14' : '#FF4D4F' },
        { label: '铭牌额定', value: d.id === 'BL01' ? 94.0 : d.id === 'BL02' ? 88.0 : d.id === 'AC01' ? 85.0 : d.id === 'AC02' ? 80.0 : d.id === 'CH01' ? 84.5 : d.id === 'CH02' ? 80.5 : d.id === 'CP01' ? 80.0 : d.id === 'INV01' ? 98.0 : 96.0, suffix: '%', color: '#595959' },
        { label: '行业基准', value: d.id === 'BL01' ? 92.0 : d.id === 'BL02' ? 88.0 : d.id === 'AC01' ? 82.4 : d.id === 'AC02' ? 78.9 : d.id === 'CH01' ? 83.3 : d.id === 'CH02' ? 78.9 : d.id === 'CP01' ? 80.0 : d.id === 'INV01' ? 98.0 : 95.0, suffix: '%', color: '#1890FF' },
        { label: '历史最佳', value: d.id === 'BL01' ? 93.1 : d.id === 'BL02' ? 78.2 : d.id === 'AC01' ? 83.5 : d.id === 'AC02' ? 79.5 : d.id === 'CH01' ? 84.5 : d.id === 'CH02' ? 81.0 : d.id === 'CP01' ? 76.0 : d.id === 'INV01' ? 98.5 : 96.5, suffix: '%', color: '#722ED1' }
      ]
    },
    deviceTrendOption() {
      const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['输入功率(kW)', '输出参数'], bottom: 0 },
        grid: { containLabel: true, top: 15, right: 20, bottom: 40, left: 55 },
        xAxis: { type: 'category', data: days, axisLabel: { fontSize: 10 } },
        yAxis: [
          { type: 'value', name: 'kW', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
          { type: 'value', name: '%', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } }
        ],
        series: [
          { name: '输入功率(kW)', type: 'line', yAxisIndex: 0, smooth: true, symbol: 'none', data: Array.from({ length: 30 }, () => (80 + Math.random() * 40).toFixed(0)), lineStyle: { color: '#1890FF', width: 2 } },
          { name: '输出参数', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', data: Array.from({ length: 30 }, () => (70 + Math.random() * 30).toFixed(0)), lineStyle: { color: '#52C41A', width: 2 } }
        ]
      }
    },
    degradationOption() {
      const days = Array.from({ length: 90 }, (_, i) => `${i + 1}`)
      const base = this.selectedDevice ? this.selectedDevice.efficiency : 90
      const slope = this.selectedDevice ? this.selectedDevice.degradation / 30 : 0
      const scatterData = days.map((_, i) => (base + slope * i + (Math.random() - 0.5) * 3).toFixed(2))
      const regLine = days.map((_, i) => (base + slope * i).toFixed(2))
      return {
        tooltip: { trigger: 'axis' },
        grid: { containLabel: true, top: 20, right: 30, bottom: 30, left: 55 },
        xAxis: { type: 'category', data: days, axisLabel: { show: false } },
        yAxis: { type: 'value', name: '%', nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontFamily: 'D-DIN', fontSize: 11 } },
        series: [
          { name: '日效率散点', type: 'scatter', symbolSize: 3, data: scatterData, itemStyle: { color: '#1890FF', opacity: 0.6 } },
          { name: '退化趋势线', type: 'line', smooth: false, symbol: 'none', data: regLine, lineStyle: { color: slope < 0 ? '#FF4D4F' : '#52C41A', width: 2, type: 'dashed' },
            markLine: { silent: true, symbol: 'none', lineStyle: { type: 'solid', color: '#FAAD14', width: 1.5 }, label: { formatter: '基准={c}%', fontSize: 10 }, data: [{ yAxis: base }] } }
        ]
      }
    }
  },
  methods: {
    selectDevice(device) {
      this.selectedDevice = device
    }
  },
  mounted() {
    if (this.devices.length) this.selectedDevice = this.devices[0]
  }
}
</script>

<style lang="scss" scoped>
.device-layout { display: flex; gap: $gutter; min-height: 600px; }
.device-list-panel {
  width: 320px; flex-shrink: 0; background: $background-white; border-radius: $card-radius; box-shadow: $card-shadow;
  display: flex; flex-direction: column;
}
.panel-header { padding: $spacing-md; border-bottom: 1px solid $divider-color; }
.filter-row { margin-top: 8px; }
.device-list { flex: 1; overflow-y: auto; }
.device-item {
  padding: 12px $spacing-md; border-bottom: 1px solid $border-color-light; cursor: pointer; transition: background .2s;
  &:hover { background: rgba($primary-color, 0.04); }
  &--active { background: rgba($primary-color, 0.08); border-left: 3px solid $primary-color; }
  &__line1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  &__name { font-size: $font-size-14; color: $text-primary; font-weight: 500; }
  &__line2 { display: flex; justify-content: space-between; }
  &__type { font-size: $font-size-12; color: $text-placeholder; }
  &__metric { font-size: $font-size-16; font-weight: 600; color: $text-primary; }
  &__line3 { margin-top: 4px; font-size: $font-size-12; color: $text-secondary; }
}
.trend-up { color: $danger-color; }
.trend-down { color: $success-color; }
.trend-stable { color: $text-placeholder; }
.grade-badge-sm {
  display: inline-block; padding: 1px 6px; border-radius: 2px; font-size: 11px; font-weight: 500;
  &.grade-sm--good { color: #52C41A; background: rgba(82,196,26,0.1); }
  &.grade-sm--mid { color: #FAAD14; background: rgba(250,173,20,0.1); }
  &.grade-sm--bad { color: #FF4D4F; background: rgba(255,77,79,0.1); }
}
.device-detail-panel {
  flex: 1; background: $background-white; border-radius: $card-radius; box-shadow: $card-shadow;
  padding: $card-padding; overflow-y: auto;
  &--empty { display: flex; align-items: center; justify-content: center; }
}
.empty-hint { text-align: center; color: $text-placeholder; p { margin-top: $spacing-md; } }
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: $spacing-md; }
.detail-title { font-family: $font-title; font-size: $font-size-20; color: $text-primary; margin: 0; }
.grade-badge-lg {
  display: inline-block; padding: 4px 16px; border-radius: 4px; font-size: $font-size-14; font-weight: 600;
  &.grade-lg--good { color: #52C41A; background: rgba(82,196,26,0.1); border: 1px solid rgba(82,196,26,0.3); }
  &.grade-lg--mid { color: #FAAD14; background: rgba(250,173,20,0.1); border: 1px solid rgba(250,173,20,0.3); }
  &.grade-lg--bad { color: #FF4D4F; background: rgba(255,77,79,0.1); border: 1px solid rgba(255,77,79,0.3); }
}
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.info-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; background: $background-color; border-radius: 4px; }
.info-label { font-size: $font-size-12; color: $text-placeholder; }
.info-value { font-size: $font-size-14; color: $text-primary; font-weight: 500; }
.subsection-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.gauge-row { display: flex; justify-content: space-around; padding: $spacing-md 0; }
.gauge-item { text-align: center; }
.gauge-value { font-size: 28px; font-weight: 700; }
.gauge-label { font-size: $font-size-12; color: $text-placeholder; margin-top: 4px; }
.saving-text { font-size: $font-size-14; color: $text-secondary; line-height: $line-height-relaxed; }
.chart-row { display: flex; gap: $gutter; }
.section-card { background: $background-color; border-radius: $card-radius; padding: $spacing-md; }
</style>
