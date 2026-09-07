<template>
  <div class="anomaly-diagnosis">
    <!-- 告警统计卡片 -->
    <div class="alarm-stats-grid mb-lg">
      <div v-for="stat in alarmStats" :key="stat.label" class="alarm-stat-card" :style="{ borderLeftColor: stat.color }">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value font-d-din" :style="{ color: stat.color }">{{ stat.value }}</div>
      </div>
    </div>

    <!-- 异常类型分布 -->
    <div class="chart-row mb-lg">
      <div class="section-card flex-1">
        <h3 class="section-title">异常类型分布（近30天）</h3>
        <TrendChart :height="300" :option="anomalyTypePieOption" />
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">异常趋势（逐日新增）</h3>
        <TrendChart :height="300" :option="anomalyTrendOption" />
      </div>
    </div>

    <!-- 异常诊断列表 -->
    <DataTable title="异常诊断列表" :data="filteredAnomalies" :total="filteredAnomalies.length" :pagination="true" class="mb-lg">
      <template slot="toolbar">
        <el-select v-model="filterAlarmType" placeholder="异常类型" size="small" clearable style="width:140px">
          <el-option label="全部" value="" />
          <el-option v-for="t in alarmTypes" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-select v-model="filterLevel" placeholder="严重度" size="small" clearable style="width:120px;margin-left:8px">
          <el-option label="全部" value="" />
          <el-option label="红色预警" value="red" />
          <el-option label="橙色预警" value="yellow" />
          <el-option label="蓝色提示" value="blue" />
        </el-select>
      </template>
      <el-table-column prop="time" label="发现时间" min-width="155" align="center" />
      <el-table-column prop="typeLabel" label="异常类型" min-width="130" align="center">
        <template slot-scope="{ row }">
          <span :class="['anomaly-type-tag', `anomaly-type--${row.type}`]">{{ row.typeLabel }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="来源设备/仪表" min-width="150" align="center" />
      <el-table-column prop="content" label="异常描述" min-width="280" show-overflow-tooltip />
      <el-table-column prop="deviation" label="偏差" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span class="font-d-din" :style="{ color: row.deviationColor }">{{ row.deviation }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="严重度" width="90" align="center">
        <template slot-scope="{ row }"><AlarmTag :level="row.level" :text="row.levelText" /></template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="showDetail(row)">诊断</el-button>
          <el-button type="text" size="small" @click="handleResolve(row)">处理</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 诊断详情弹窗 -->
    <el-dialog :title="`异常诊断详情 — ${detailRow ? detailRow.source : ''}`" :visible.sync="detailVisible" width="700px">
      <div v-if="detailRow" class="diagnosis-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="发现时间">{{ detailRow.time }}</el-descriptions-item>
          <el-descriptions-item label="异常类型">
            <span :class="['anomaly-type-tag', `anomaly-type--${detailRow.type}`]">{{ detailRow.typeLabel }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="来源">{{ detailRow.source }}</el-descriptions-item>
          <el-descriptions-item label="严重度"><AlarmTag :level="detailRow.level" :text="detailRow.levelText" /></el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">{{ detailRow.content }}</el-descriptions-item>
          <el-descriptions-item label="当前值">{{ detailRow.currentValue }} {{ detailRow.unit }}</el-descriptions-item>
          <el-descriptions-item label="阈值/基准">{{ detailRow.threshold }} {{ detailRow.unit }}</el-descriptions-item>
          <el-descriptions-item label="偏差">{{ detailRow.deviation }}</el-descriptions-item>
          <el-descriptions-item label="关联计量点">{{ detailRow.meterId }}</el-descriptions-item>
          <el-descriptions-item label="诊断结论" :span="2">
            <span :style="{ color: detailRow.diagnosisColor }">{{ detailRow.diagnosis }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="建议措施" :span="2">{{ detailRow.suggestion }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleResolve(detailRow); detailVisible = false">标记已处理</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'

export default {
  name: 'AnomalyDiagnosis',
  components: { TrendChart, DataTable, AlarmTag },
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] }
  },
  data() {
    return {
      filterAlarmType: '',
      filterLevel: '',
      detailVisible: false,
      detailRow: null,
      alarmTypes: [
        { value: 'surge', label: '能耗突增' },
        { value: 'meter_offline', label: '仪表失联' },
        { value: 'quota_exceed', label: '能耗超标' },
        { value: 'standby_waste', label: '待机空耗' },
        { value: 'power_factor', label: '功率因数异常' },
        { value: 'process_anomaly', label: '工艺参数异常' }
      ],
      alarmStats: [
        { label: '合计', value: 37, color: '#595959' },
        { label: '红色预警', value: 8, color: '#FF4D4F' },
        { label: '黄色提醒', value: 15, color: '#FAAD14' },
        { label: '蓝色提示', value: 14, color: '#1890FF' },
        { label: '待处理', value: 5, color: '#FF4D4F' },
        { label: '处理中', value: 10, color: '#1890FF' },
        { label: '已关闭', value: 12, color: '#52C41A' },
        { label: '已归档', value: 10, color: '#909399' }
      ],
      anomalies: [
        { time: '2026-07-15 09:15', type: 'process_anomaly', typeLabel: '工艺参数异常', source: '淬火炉 HT-01', content: '排烟温度持续超过180°C阈值，当前192°C，检查空燃比是否失衡', deviation: '+12°C', deviationColor: '#FF4D4F', level: 'red', levelText: '预警', currentValue: '192', threshold: '180', unit: '°C', meterId: 'M07b(烟气温度)', diagnosis: '空燃比失衡导致过量空气系数偏高→不完全燃烧→排烟温度升高。', diagnosisColor: '#FF4D4F', suggestion: '1) 调节燃烧器空燃比至1.15-1.2范围；2) 检查空气预热器是否堵塞；3) 清理燃烧器喷嘴积碳。预计处理后温度可降至165-175°C。' },
        { time: '2026-07-15 08:40', type: 'surge', typeLabel: '能耗突增', source: '空压机 AC-01', content: '用电量30分钟内骤增45%，超出M16计量点历史波动范围（±20%）', deviation: '+45%', deviationColor: '#FF4D4F', level: 'red', levelText: '预警', currentValue: '268', threshold: '185', unit: 'kW', meterId: 'M16(空压站总电)', diagnosis: '干燥器AD-01再生周期触发叠加+管网临时泄漏。45%的突增幅度超出正常工况波动范围。', diagnosisColor: '#FF4D4F', suggestion: '1) 优化AD-01再生时序，与AC-01加载错峰；2) 管网巡检排查泄漏点（超声检漏仪）；3) 检查M16仪表是否正常。' },
        { time: '2026-07-14 23:30', type: 'standby_waste', typeLabel: '待机空耗', source: '螺杆空压机 AC-02', content: '周日凌晨3点仍运行在65kW，该时段无生产计划→待机空耗约195kWh/晚', deviation: '+65kW持续3h', deviationColor: '#FAAD14', level: 'yellow', levelText: '提醒', currentValue: '65', threshold: '20', unit: 'kW', meterId: 'M16(空压站总电)', diagnosis: 'AC-02未配置自动停机策略，非生产时段持续运行在卸载状态（65kW卸载功率偏高）。', diagnosisColor: '#FAAD14', suggestion: '1) 配置MES联动自动停机策略（无排产信号→延时30min自动停机）；2) 卸载压力设定点检查，降低卸载功率至<35kW。' },
        { time: '2026-07-14 18:20', type: 'meter_offline', typeLabel: '仪表失联', source: '天然气流量计 M10', content: '艾默生流量计通信超时35分钟，ANet网关RS485接口松动导致数据断点', deviation: '中断35min', deviationColor: '#FF4D4F', level: 'red', levelText: '预警', currentValue: '—(断点)', threshold: '连续>15min', unit: '—', meterId: 'M10(BL-01天然气)', diagnosis: 'ANet网关COM2口RS485接线端子松动，间歇性通信故障。断点期间BL-01用气量采用前3日均值估算补填。', diagnosisColor: '#FF4D4F', suggestion: '1) 重新紧固RS485接线端子并点胶固定；2) 配置ANet网关看门狗自动复位；3) 增加通信状态Heartbeat监控告警。' },
        { time: '2026-07-14 10:00', type: 'quota_exceed', typeLabel: '能耗超标', source: '燃煤锅炉 BL-02', content: '本月累计用煤量已达125t，超过月度限额112t（+11.6%），高温季满负荷+效率下降双重因素', deviation: '+13t(+11.6%)', deviationColor: '#FAAD14', level: 'yellow', levelText: '提醒', currentValue: '125', threshold: '112', unit: 't/月', meterId: 'M12(燃煤地磅)', diagnosis: '7月高温季蒸汽需求增加+BL-02效率持续下降(当前69.5%)→单位蒸汽煤耗上升→月用煤量超限。', diagnosisColor: '#FAAD14', suggestion: '1) 优先投用BL-01燃气锅炉(高效)分担负荷；2) 安排BL-02停炉清灰检修，恢复效率至>75%；3) 评估月度限额是否需调整。' },
        { time: '2026-07-13 22:10', type: 'process_anomaly', typeLabel: '工艺参数异常', source: '冷却塔 CT-01', content: '风机振动值7.2mm/s，超过ISO 10816-3阈值5.0mm/s→可能存在不平衡或轴承磨损', deviation: '+44%', deviationColor: '#FF4D4F', level: 'red', levelText: '预警', currentValue: '7.2', threshold: '5.0', unit: 'mm/s', meterId: 'M23(振动传感器)', diagnosis: '振动频谱分析显示1倍频分量突出→风机动平衡不良（叶片结垢或配重脱落）。', diagnosisColor: '#FF4D4F', suggestion: '1) 立即降频运行(≤40Hz)并安排停机检查；2) 清洗风机叶片并做动平衡校正；3) 检查轴承游隙，必要时更换。' },
        { time: '2026-07-13 15:45', type: 'power_factor', typeLabel: '功率因数异常', source: '公用工程配电间 M15', content: '功率因数PF=0.87（持续>30min），大量空压机/水泵感性负载未满负荷运行', deviation: 'PF 0.87<0.90', deviationColor: '#1890FF', level: 'blue', levelText: '提示', currentValue: '0.87', threshold: '0.90', unit: 'PF', meterId: 'M15(公用工程配电间)', diagnosis: 'AC-02空压机+CP-01水泵低负载率运行→感性无功占比升高→PF下降。非紧急但需关注力调电费累积效应。', diagnosisColor: '#1890FF', suggestion: '1) 加装自动无功补偿柜(建议容量200kvar)；2) 优化AC-02/CP-01变频运行策略提升负载率；3) 定期巡检电容器组状态。' },
        { time: '2026-07-12 06:50', type: 'surge', typeLabel: '能耗突降', source: '二车间 C线(热处理)', content: '天然气消耗突降35%——淬火炉HT-01/H-02天然气流量疑异常', deviation: '-35%', deviationColor: '#FAAD14', level: 'yellow', levelText: '提醒', currentValue: '65', threshold: '100', unit: 'm³/h', meterId: 'M07(淬火炉)/M07b(回火炉)', diagnosis: 'HT-01淬火炉可能已进入保温阶段或M07流量计导压管堵塞→实测值偏低。需现场确认。', diagnosisColor: '#FAAD14', suggestion: '1) 联系现场确认HT-01/H-02运行状态；2) 检查M07/M07b艾默生流量计导压管是否堵塞；3) 对比SCADA工艺温度曲线辅助判断。' }
      ]
    }
  },
  computed: {
    filteredAnomalies() {
      let list = this.anomalies
      if (this.filterAlarmType) list = list.filter(a => a.type === this.filterAlarmType)
      if (this.filterLevel) list = list.filter(a => a.level === this.filterLevel)
      return list
    },
    anomalyTypePieOption() {
      return {
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie', radius: ['40%', '68%'], center: ['50%', '45%'],
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: [
            { value: 6, name: '能耗突增', itemStyle: { color: '#FF4D4F' } },
            { value: 3, name: '仪表失联', itemStyle: { color: '#FF7A45' } },
            { value: 4, name: '能耗超标', itemStyle: { color: '#FAAD14' } },
            { value: 8, name: '待机空耗', itemStyle: { color: '#FADB14' } },
            { value: 5, name: '功率因数异常', itemStyle: { color: '#1890FF' } },
            { value: 11, name: '工艺参数异常', itemStyle: { color: '#722ED1' } }
          ]
        }]
      }
    },
    anomalyTrendOption() {
      const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['红色预警', '黄色提醒', '蓝色提示'], bottom: 0 },
        grid: { containLabel: true, top: 15, right: 20, bottom: 40, left: 55 },
        xAxis: { type: 'category', data: days, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', name: '条', minInterval: 1, nameGap: 15, nameTextStyle: { fontSize: 12, color: '#666' } },
        series: [
          { name: '红色预警', type: 'bar', stack: 'anomaly', barWidth: 12, data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3)), itemStyle: { color: '#FF4D4F' } },
          { name: '黄色提醒', type: 'bar', stack: 'anomaly', barWidth: 12, data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 4)), itemStyle: { color: '#FAAD14' } },
          { name: '蓝色提示', type: 'bar', stack: 'anomaly', barWidth: 12, data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 4)), itemStyle: { color: '#1890FF' } }
        ]
      }
    }
  },
  methods: {
    showDetail(row) { this.detailRow = row; this.detailVisible = true },
    handleResolve(row) { this.$message.success(`已标记处理: ${row.source} — ${row.typeLabel}`) }
  }
}
</script>

<style lang="scss" scoped>
.alarm-stats-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: $gutter; }
.alarm-stat-card {
  background: $background-white; border-radius: $card-radius; padding: 14px 12px; text-align: center;
  box-shadow: $card-shadow; border-left: 3px solid;
  .stat-label { font-size: $font-size-12; color: $text-secondary; margin-bottom: 4px; }
  .stat-value { font-size: 24px; font-weight: 700; }
}
.chart-row { display: flex; gap: $gutter; }
.section-card { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.section-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.anomaly-type-tag {
  display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: $font-size-12;
  &.anomaly-type--surge { color: #FF4D4F; background: rgba(255,77,79,0.1); }
  &.anomaly-type--meter_offline { color: #FF7A45; background: rgba(255,122,69,0.1); }
  &.anomaly-type--quota_exceed { color: #FAAD14; background: rgba(250,173,20,0.1); }
  &.anomaly-type--standby_waste { color: #FADB14; background: rgba(250,219,20,0.1); }
  &.anomaly-type--power_factor { color: #1890FF; background: rgba(24,144,255,0.1); }
  &.anomaly-type--process_anomaly { color: #722ED1; background: rgba(114,46,209,0.1); }
}
</style>
