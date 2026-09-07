<template>
  <div class="energy-benchmark">
    <!-- 工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="refreshData" />
      <el-select v-model="standardVersion" placeholder="对标标准版本" size="small" style="width:150px" @change="refreshData">
        <el-option v-for="v in standardVersions" :key="v.value" :label="v.label" :value="v.value" />
      </el-select>
      <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- Tab 导航 -->
    <el-tabs v-model="activeTab" type="card" class="benchmark-tabs">
      <!-- ==================== Tab 1：对标总览 ==================== -->
      <el-tab-pane label="对标总览" name="overview">
        <!-- 三色分类统计卡片 -->
        <div class="stat-cards mb-lg">
          <div v-for="s in gradeStats" :key="s.label" class="stat-card" :style="{ borderLeftColor: s.color }">
            <div class="stat-card__value font-d-din" :style="{ color: s.color }">{{ s.value }}</div>
            <div class="stat-card__label">{{ s.label }}</div>
            <div class="stat-card__desc">{{ s.desc }}</div>
          </div>
        </div>

        <!-- 国标对标面板（6 指标卡片，含三级限值） -->
        <div class="section-card mb-lg">
          <h3 class="section-title">国标对标面板（GB/T 32045）</h3>
          <div class="benchmark-grid">
            <div v-for="item in gbBenchmark" :key="item.name" class="benchmark-item">
              <div class="benchmark-item__header">
                <span class="benchmark-item__name">{{ item.name }}</span>
                <span :class="['grade-badge', `grade--${item.gradeClass}`]">{{ item.grade }}</span>
              </div>
              <div class="benchmark-item__value">
                <span class="benchmark-val font-d-din">{{ item.current }}</span>
                <span class="benchmark-unit">{{ item.unit }}</span>
              </div>
              <div class="limit-bar">
                <div class="limit-bar__track" :class="`limit-bar__track--${item.direction}`">
                  <div class="limit-bar__gradient"></div>
                  <span class="limit-bar__marker" :style="{ left: item.markerPos }" :title="`当前值 ${item.current}${item.unit}`"></span>
                </div>
                <div class="limit-bar__labels">
                  <span>先进 {{ item.advanced }}</span>
                  <span>准入 {{ item.entry }}</span>
                  <span>限定 {{ item.limit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 行业对标雷达图 -->
        <div class="section-card mb-lg">
          <h3 class="section-title">行业对标雷达图（7 项核心指标）</h3>
          <TrendChart :height="420" :option="radarOption" />
          <p class="chart-note">注：各指标以行业先进值为 100 归一化，越接近外圈表示能效越好。</p>
        </div>

        <!-- 行业标杆对比 + 差距分析 -->
        <div class="chart-row mb-lg">
          <TrendChart
            title="行业标杆对比"
            :height="340"
            :tabs="[{ key: 'intensity', label: '能耗强度' }, { key: 'efficiency', label: '能效比' }]"
            :option="industryCompareOption"
            class="flex-1"
            @tab-change="handleCompareTabChange"
          />
          <TrendChart title="与先进水平差距" :height="340" :option="gapAnalysisOption" class="flex-1" />
        </div>

        <!-- 差距分析 KPI -->
        <div class="kpi-grid mb-lg">
          <KpiCard v-for="item in gapKpiData" :key="item.label" v-bind="item" />
        </div>

        <!-- 对标预警 -->
        <div class="section-card mb-lg">
          <h3 class="section-title">对标预警</h3>
          <div class="alert-list">
            <div v-for="(a, idx) in benchmarkAlerts" :key="idx" class="alert-item">
              <span :class="['alert-dot', `alert-dot--${a.level}`]"></span>
              <span :class="['alert-level', `alert-level--${a.level}`]">{{ a.levelLabel }}</span>
              <span class="alert-item__src">{{ a.source }}</span>
              <span class="alert-item__desc">{{ a.desc }}</span>
              <span class="alert-item__time">{{ a.time }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== Tab 2：设备能效清单 ==================== -->
      <el-tab-pane label="设备能效清单" name="device" lazy>
        <div class="section-card mb-lg">
          <div class="filter-row">
            <el-select v-model="deviceGradeFilter" placeholder="能效等级" size="small" clearable style="width:130px">
              <el-option label="全部等级" value="" />
              <el-option label="1级（先进）" value="1" />
              <el-option label="2级（中等）" value="2" />
              <el-option label="3级（落后）" value="3" />
            </el-select>
            <el-select v-model="deviceTypeFilter" placeholder="设备类型" size="small" clearable style="width:150px">
              <el-option label="全部类型" value="" />
              <el-option v-for="t in deviceTypes" :key="t" :label="t" :value="t" />
            </el-select>
            <el-select v-model="deviceResultFilter" placeholder="对标结果" size="small" clearable style="width:130px">
              <el-option label="全部结果" value="" />
              <el-option label="达标" value="pass" />
              <el-option label="未达标" value="fail" />
            </el-select>
            <span class="filter-count">共 {{ filteredDevices.length }} 台设备</span>
          </div>
          <el-table :data="filteredDevices" size="small" border>
            <el-table-column type="expand">
              <template slot-scope="{ row }">
                <div class="device-detail">
                  <div class="device-detail__col">
                    <h4>铭牌参数</h4>
                    <div v-for="(v, k) in row.nameplate" :key="k" class="detail-row">
                      <span class="detail-label">{{ k }}</span>
                      <span class="detail-value font-d-din">{{ v }}</span>
                    </div>
                  </div>
                  <div class="device-detail__col">
                    <h4>运行数据</h4>
                    <div v-for="(v, k) in row.runtime" :key="k" class="detail-row">
                      <span class="detail-label">{{ k }}</span>
                      <span class="detail-value font-d-din">{{ v }}</span>
                    </div>
                  </div>
                  <div class="device-detail__col device-detail__col--wide">
                    <h4>节能建议</h4>
                    <p class="detail-suggestion">{{ row.suggestion }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="设备名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="model" label="型号/规格" min-width="140" show-overflow-tooltip />
            <el-table-column prop="type" label="设备类型" width="110" align="center" />
            <el-table-column prop="standard" label="适用标准" width="120" align="center" />
            <el-table-column label="能效等级" width="100" align="center">
              <template slot-scope="{ row }">
                <span :class="['grade-badge', `grade--${row.gradeClass}`]">{{ row.gradeLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column label="对标结果" width="100" align="center">
              <template slot-scope="{ row }">
                <el-tag :type="row.resultType" size="small">{{ row.result }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- ==================== Tab 3：能效提升路线图 ==================== -->
      <el-tab-pane label="能效提升路线图" name="roadmap" lazy>
        <div class="section-card mb-lg">
          <h3 class="section-title">分阶段能效提升路线图（2026-2027）</h3>
          <div class="gantt">
            <div class="gantt__header">
              <div class="gantt__axis gantt__axis--label"></div>
              <div class="gantt__axis">
                <span v-for="q in quarters" :key="q" class="gantt__quarter">{{ q }}</span>
              </div>
            </div>
            <div v-for="m in ganttMeasures" :key="m.id" class="gantt__row">
              <div class="gantt__task-label">
                <span class="gantt__task-name">{{ m.name }}</span>
                <span class="gantt__task-dept">{{ m.dept }}</span>
              </div>
              <div class="gantt__track">
                <div class="gantt__grid">
                  <span v-for="q in quarters" :key="q" class="gantt__grid-line"></span>
                </div>
                <div
                  class="gantt__bar"
                  :style="{ left: m.left, width: m.width, background: m.color }"
                  @click="openMeasure(m)"
                >
                  <span v-if="m.widthNum >= 25" class="gantt__bar-text">{{ m.statusLabel }}</span>
                </div>
              </div>
            </div>
            <div class="gantt__legend">
              <span class="legend-item"><i class="legend-dot" style="background:#52C41A"></i>已完成</span>
              <span class="legend-item"><i class="legend-dot" style="background:#1890FF"></i>进行中</span>
              <span class="legend-item"><i class="legend-dot" style="background:#FAAD14"></i>未开始</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h3 class="section-title">提升措施清单</h3>
          <el-table :data="roadmapMeasures" size="small" border>
            <el-table-column prop="name" label="措施名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="dept" label="负责部门" width="120" align="center" />
            <el-table-column label="预期投资(万元)" width="120" align="center">
              <template slot-scope="{ row }"><span class="font-d-din">{{ row.invest }}</span></template>
            </el-table-column>
            <el-table-column label="预期节能量(tce/年)" width="140" align="center">
              <template slot-scope="{ row }"><span class="font-d-din">{{ row.saving }}</span></template>
            </el-table-column>
            <el-table-column prop="payback" label="回收期" width="90" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template slot-scope="{ row }">
                <el-tag :type="row.statusType" size="small">{{ row.statusLabel }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="{ row }">
                <el-button type="text" size="small" @click="openMeasure(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 措施详情弹窗 -->
        <el-dialog :title="currentMeasure.name" :visible.sync="measureVisible" width="520px" :append-to-body="true">
          <div class="measure-detail">
            <div class="detail-row"><span class="detail-label">负责部门</span><span class="detail-value">{{ currentMeasure.dept }}</span></div>
            <div class="detail-row"><span class="detail-label">优先级</span><span class="detail-value">{{ currentMeasure.priority }}</span></div>
            <div class="detail-row"><span class="detail-label">预期投资</span><span class="detail-value font-d-din">{{ currentMeasure.invest }} 万元</span></div>
            <div class="detail-row"><span class="detail-label">预期节能量</span><span class="detail-value font-d-din">{{ currentMeasure.saving }} tce/年</span></div>
            <div class="detail-row"><span class="detail-label">投资回收期</span><span class="detail-value font-d-din">{{ currentMeasure.payback }}</span></div>
            <div class="detail-row"><span class="detail-label">当前进度</span><span class="detail-value">{{ currentMeasure.progress }}</span></div>
            <p class="detail-suggestion">{{ currentMeasure.description }}</p>
          </div>
          <span slot="footer">
            <el-button size="small" @click="measureVisible = false">关闭</el-button>
            <el-button size="small" type="primary" @click="measureVisible = false">确定</el-button>
          </span>
        </el-dialog>
      </el-tab-pane>

      <!-- ==================== Tab 4：节能目标设定 ==================== -->
      <el-tab-pane label="节能目标设定" name="target" lazy>
        <div class="section-card">
          <h3 class="section-title">年度节能目标设定</h3>
          <el-form ref="targetForm" :model="targetForm" :rules="targetRules" label-width="170px" size="small">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="年度能耗强度目标" prop="intensityTarget">
                  <el-input v-model="targetForm.intensityTarget" placeholder="默认 0.40">
                    <template slot="append">tce/万元</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年度节能量目标" prop="savingTarget">
                  <el-input v-model="targetForm.savingTarget" placeholder="默认 500">
                    <template slot="append">tce</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="万元产值能耗下降率" prop="declineRate">
                  <el-input v-model="targetForm.declineRate" placeholder="默认 5.0">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="可再生能源占比" prop="renewableRatio">
                  <el-input v-model="targetForm.renewableRatio" placeholder="默认 40">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="目标年份" prop="targetYear">
                  <el-date-picker v-model="targetForm.targetYear" type="year" placeholder="选择年份" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对标行业" prop="industry">
                  <el-select v-model="targetForm.industry" placeholder="请选择行业" style="width: 100%">
                    <el-option v-for="ind in industryList" :key="ind.value" :label="ind.label" :value="ind.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="handleSubmitTarget">提交目标</el-button>
              <el-button @click="handleResetTarget">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- ==================== Tab 5：对标历史记录 ==================== -->
      <el-tab-pane label="对标历史记录" name="history" lazy>
        <DataTable title="对标历史记录" :data="filteredHistory" :total="50" :exportable="true" @page-change="handlePageChange" @export="handleExport">
          <template slot="toolbar">
            <el-select v-model="historyYear" placeholder="年份" size="small" clearable style="width:110px">
              <el-option v-for="y in historyYears" :key="y" :label="y" :value="y" />
            </el-select>
            <el-select v-model="historyGrade" placeholder="等级" size="small" clearable style="width:110px">
              <el-option label="全部" value="" />
              <el-option label="1级" value="1" />
              <el-option label="2级" value="2" />
              <el-option label="3级" value="3" />
            </el-select>
          </template>
          <el-table-column prop="year" label="年份" width="80" align="center" />
          <el-table-column prop="indicator" label="指标名称" min-width="160" align="center" />
          <el-table-column prop="currentValue" label="当前值" min-width="120" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.currentValue }}</span></template>
          </el-table-column>
          <el-table-column prop="standardValue" label="国标限值" min-width="120" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.standardValue }}</span></template>
          </el-table-column>
          <el-table-column prop="gap" label="差距" min-width="100" align="center">
            <template slot-scope="{ row }">
              <span :class="['gap-val', row.gapClass]">{{ row.gap }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="grade" label="等级" width="80" align="center">
            <template slot-scope="{ row }">
              <span :class="['grade-badge', `grade--${row.gradeClass}`]">{{ row.grade }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" align="center" />
        </DataTable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import OrgCascader from './query/components/OrgCascader.vue'

export default {
  name: 'EnergyBenchmark',
  components: { KpiCard, TrendChart, DataTable, OrgCascader },
  data() {
    return {
      selectedOrg: [],
      dateRange: ['2026-07-01', '2026-07-31'],
      activeTab: 'overview',
      standardVersion: '2024',
      standardVersions: [
        { label: '2024版标准', value: '2024' },
        { label: '2023版标准', value: '2023' },
        { label: '2022版标准', value: '2022' }
      ],
      compareTab: 'intensity',
      refreshKey: 0,
      // ---- 对标总览 ----
      gradeStats: [
        { label: '1级（先进）', value: 1, color: '#52C41A', desc: '优于行业先进水平' },
        { label: '2级（中等）', value: 4, color: '#FAAD14', desc: '达到国标准入，需优化' },
        { label: '3级（落后）', value: 1, color: '#FF4D4F', desc: '未达标，需重点整改' }
      ],
      gbBenchmark: [
        { name: '单位产品综合能耗', current: '128.5', unit: 'kgce/件', advanced: '135.6', entry: '180.0', limit: '200.0', direction: 'low', grade: '1级', gradeClass: 'good', markerPos: '8%' },
        { name: '单位产值综合能耗', current: '0.38', unit: 'tce/万元', advanced: '0.30', entry: '0.45', limit: '0.55', direction: 'low', grade: '2级', gradeClass: 'mid', markerPos: '38%' },
        { name: '万元增加值能耗', current: '0.52', unit: 'tce/万元', advanced: '0.45', entry: '0.60', limit: '0.72', direction: 'low', grade: '2级', gradeClass: 'mid', markerPos: '36%' },
        { name: '锅炉热效率', current: '92.3', unit: '%', advanced: '94.0', entry: '88.0', limit: '82.0', direction: 'high', grade: '2级', gradeClass: 'mid', markerPos: '70%' },
        { name: '电力系统线损率', current: '4.8', unit: '%', advanced: '3.5', entry: '5.0', limit: '6.5', direction: 'low', grade: '2级', gradeClass: 'mid', markerPos: '58%' },
        { name: '余热回收利用率', current: '62.5', unit: '%', advanced: '78.0', entry: '70.0', limit: '55.0', direction: 'high', grade: '3级', gradeClass: 'bad', markerPos: '32%' }
      ],
      benchmarkAlerts: [
        { level: 'red', levelLabel: '红色预警', source: '燃煤锅炉 BL-02', desc: '热效率当月均值 68.2%，低于国标限值 88.0%（GB 24500）', time: '07-15 09:00' },
        { level: 'orange', levelLabel: '橙色预警', source: '螺杆空压机 AC-02', desc: '比功率 7.8 kW/(m³/min)，达 GB 19153 限定值的 96%', time: '07-14 16:30' },
        { level: 'yellow', levelLabel: '黄色预警', source: '循环水泵组 CP-01', desc: '系统效率 72%，达 GB 19762 限定值的 91%', time: '07-13 10:20' }
      ],
      gapKpiData: [
        { label: '与国内先进差距', value: 12.5, unit: '%', status: 'warning', trend: { value: 3.2, type: 'down' }, tip: '较去年缩小3.2个百分点' },
        { label: '与国际先进差距', value: 25.8, unit: '%', status: 'danger', trend: { value: 1.8, type: 'down' }, tip: '较去年缩小1.8个百分点' },
        { label: '综合达标率', value: 83.3, unit: '%', status: 'success', trend: { value: 5.6, type: 'up' }, tip: '5项指标达到国标要求' },
        { label: '节能潜力', value: 789, unit: 'tce', status: 'default', trend: { value: 8.2, type: 'down' }, tip: '达到行业先进水平可节约' }
      ],
      // ---- 设备能效清单 ----
      deviceGradeFilter: '',
      deviceTypeFilter: '',
      deviceResultFilter: '',
      devices: [
        { name: '离心冷水机组 CH-01', model: '1200kW 离心式', type: '冷水机组', standard: 'GB 19577', gradeLabel: '1级', gradeClass: 'good', result: '达标', resultType: 'success', nameplate: { '额定制冷量': '1200 kW', '额定 COP': '5.2', '制冷剂': 'R134a' }, runtime: { '当前 COP': '5.0', '累计运行': '4200 h', '月均耗电': '18.6万kWh' }, suggestion: '能效优秀，保持冷凝器定期清洗与水质管理即可。' },
        { name: '燃气锅炉 BL-01', model: '6t/h 冷凝式', type: '工业锅炉', standard: 'GB 24500', gradeLabel: '1级', gradeClass: 'good', result: '达标', resultType: 'success', nameplate: { '额定蒸发量': '6 t/h', '额定热效率': '96%', '燃料': '天然气' }, runtime: { '当前热效率': '92.3%', '月用气量': '12.4万m³', '排烟温度': '158°C' }, suggestion: '热效率92.3%达到1级，建议加装烟气余热回收可进一步提升至94%。' },
        { name: '精密磨床 GR-01', model: 'IE4 永磁同步', type: '电动机', standard: 'GB 18613', gradeLabel: '1级', gradeClass: 'good', result: '达标', resultType: 'success', nameplate: { '额定功率': '22 kW', '额定效率': '95.4%', '能效等级': 'IE4' }, runtime: { '运行功率': '14.2 kW', '累计运行': '5200 h', '月耗电': '7.4万kWh' }, suggestion: 'IE4高效电机，运行状态良好。' },
        { name: '逆变器 INV-01', model: '500kW 组串式', type: '光伏设备', standard: '—', gradeLabel: '1级', gradeClass: 'good', result: '达标', resultType: 'success', nameplate: { '额定功率': '500 kW', '转换效率': '98.6%', 'MPPT 路数': '16' }, runtime: { '当前效率': '98.2%', '日发电量': '1850 kWh', '累计发电': '98.6万kWh' }, suggestion: '转换效率优异，保持组件清洁与定期巡检。' },
        { name: '离心空压机 AC-01', model: '250kW 离心式', type: '容积式空压机', standard: 'GB 19153', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定功率': '250 kW', '额定排气量': '42 m³/min', '输入比功率': '6.0' }, runtime: { '运行比功率': '6.2', '加载率': '72%', '月耗电': '11.8万kWh' }, suggestion: '2级能效，建议优化管网压力设定，减少卸载运行。' },
        { name: '螺杆冷水机组 CH-02', model: '800kW 螺杆式', type: '冷水机组', standard: 'GB 19577', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定制冷量': '800 kW', '额定 COP': '4.6', '制冷剂': 'R134a' }, runtime: { '当前 COP': '4.3', '累计运行': '3900 h', '月均耗电': '12.1万kWh' }, suggestion: 'COP 4.3 略低于额定，建议检查冷冻水进出水温差。' },
        { name: 'CNC 加工中心 MC-01', model: 'IE3 伺服驱动', type: '电动机', standard: 'GB 18613', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定功率': '30 kW', '额定效率': '93.6%', '能效等级': 'IE3' }, runtime: { '运行功率': '21.5 kW', '累计运行': '6100 h', '月耗电': '13.1万kWh' }, suggestion: 'IE3电机，待机时长偏高，建议加装自动断电。' },
        { name: '数控车床 LT-01', model: 'IE3 伺服驱动', type: '电动机', standard: 'GB 18613', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定功率': '18 kW', '额定效率': '92.8%', '能效等级': 'IE3' }, runtime: { '运行功率': '11.2 kW', '累计运行': '5600 h', '月耗电': '6.3万kWh' }, suggestion: 'IE3电机，运行正常。' },
        { name: '镗床 BR-01', model: 'IE3 异步', type: '电动机', standard: 'GB 18613', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定功率': '15 kW', '额定效率': '91.5%', '能效等级': 'IE3' }, runtime: { '运行功率': '9.8 kW', '累计运行': '4800 h', '月耗电': '4.7万kWh' }, suggestion: 'IE3电机，运行正常。' },
        { name: '循环水泵组 CP-01', model: '离心泵组', type: '清水离心泵', standard: 'GB 19762', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定流量': '320 m³/h', '额定扬程': '45 m', '额定效率': '78%' }, runtime: { '系统效率': '72%', '累计运行': '7200 h', '月耗电': '9.6万kWh' }, suggestion: '系统效率72%，建议变频改造+叶轮优化，年节电42 tce。' },
        { name: '淬火炉 HT-01', model: '燃气热处理炉', type: '热处理炉', standard: '—', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定温度': '950 °C', '燃料': '天然气', '额定热效率': '82%' }, runtime: { '排烟温度': '192°C', '月用气量': '5.2万m³', '热效率': '78%' }, suggestion: '排烟温度偏高，建议加装预热回收装置。' },
        { name: '回火炉 HT-02', model: '燃气热处理炉', type: '热处理炉', standard: '—', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定温度': '700 °C', '燃料': '天然气', '额定热效率': '80%' }, runtime: { '排烟温度': '168°C', '月用气量': '3.1万m³', '热效率': '76%' }, suggestion: '运行正常，可结合HT-01统一做余热回收。' },
        { name: '冷却塔风机 CT-01/02', model: '轴流风机', type: '通风机', standard: 'GB 19761', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定风量': '8.5万m³/h', '额定功率': '11 kW', '额定效率': '85%' }, runtime: { '运行功率': '9.2 kW', '累计运行': '6500 h', '月耗电': '6.0万kWh' }, suggestion: '2级能效，建议按环境温度调节风量。' },
        { name: '1号车间变压器 T-01', model: 'SCB13-1250kVA', type: '电力变压器', standard: 'GB 20052', gradeLabel: '2级', gradeClass: 'mid', result: '达标', resultType: 'success', nameplate: { '额定容量': '1250 kVA', '空载损耗': '1.2 kW', '负载损耗': '11.5 kW' }, runtime: { '负载率': '68%', '功率因数': '0.92', '月损耗': '1.1万kWh' }, suggestion: '负载率适中，建议关注功率因数治理。' },
        { name: '螺杆空压机 AC-02', model: '132kW 螺杆式', type: '容积式空压机', standard: 'GB 19153', gradeLabel: '3级', gradeClass: 'bad', result: '未达标', resultType: 'danger', nameplate: { '额定功率': '132 kW', '额定排气量': '20 m³/min', '输入比功率': '7.8' }, runtime: { '运行比功率': '7.8', '加载率': '58%', '月耗电': '6.8万kWh' }, suggestion: '比功率7.8超限定值，加载率仅58%，建议变频改造+多机联控，年节电85 tce。' },
        { name: '燃煤锅炉 BL-02', model: '4t/h 层燃炉', type: '工业锅炉', standard: 'GB 24500', gradeLabel: '3级', gradeClass: 'bad', result: '未达标', resultType: 'danger', nameplate: { '额定蒸发量': '4 t/h', '额定热效率': '82%', '燃料': '燃煤' }, runtime: { '当前热效率': '69.5%', '月用煤量': '1500 t', '排烟温度': '185°C' }, suggestion: '热效率69.5%低于限定值88%，建议煤改气或淘汰替代，年节约186 tce。' },
        { name: '给水泵', model: '多级离心泵', type: '清水离心泵', standard: 'GB 19762', gradeLabel: '3级', gradeClass: 'bad', result: '未达标', resultType: 'danger', nameplate: { '额定流量': '90 m³/h', '额定扬程': '160 m', '额定效率': '70%' }, runtime: { '实际扬程': '120 m', '系统效率': '58%', '月耗电': '3.2万kWh' }, suggestion: '扬程过剩25%，建议叶轮切削降扬程+变频，年节电9.7 tce。' },
        { name: '2号车间变压器 T-02', model: 'SCB11-800kVA', type: '电力变压器', standard: 'GB 20052', gradeLabel: '3级', gradeClass: 'bad', result: '未达标', resultType: 'danger', nameplate: { '额定容量': '800 kVA', '空载损耗': '1.0 kW', '负载损耗': '9.0 kW' }, runtime: { '负载率': '41%', '功率因数': '0.89', '月损耗': '0.9万kWh' }, suggestion: '接近3级需关注，建议择机更换SCB13及以上能效。' }
      ],
      // ---- 能效提升路线图 ----
      quarters: ['2026Q1', '2026Q2', '2026Q3', '2026Q4', '2027Q1', '2027Q2', '2027Q3', '2027Q4'],
      roadmapMeasures: [
        { id: 1, name: 'AC-02 螺杆空压机变频改造', dept: '公用工程部', priority: '高优先', start: 0, duration: 2, invest: 28, saving: 85, payback: '1.2年', status: 'done', statusLabel: '已完成', statusType: 'success', progress: '100%', color: '#52C41A', description: '变频改造配合多机联控策略，消除空载运行，比功率降至6.5以下，年节约标煤85 tce。' },
        { id: 2, name: '循环水泵组 CP-01 变频改造', dept: '公用工程部', priority: '高优先', start: 1, duration: 2, invest: 18, saving: 42, payback: '1.5年', status: 'active', statusLabel: '进行中', statusType: 'primary', progress: '60%', color: '#1890FF', description: '叶轮切削降扬程+变频按需供水，年节电42 tce。' },
        { id: 3, name: 'BL-02 燃煤锅炉煤改气', dept: '锅炉房', priority: '中优先', start: 3, duration: 4, invest: 350, saving: 186, payback: '3年', status: 'pending', statusLabel: '未开始', statusType: 'warning', progress: '0%', color: '#FAAD14', description: '淘汰4t/h燃煤锅炉，新建6t/h高效冷凝燃气锅炉，热效率≥96%，年节约186 tce。' },
        { id: 4, name: '余热回收系统升级', dept: '公用工程部', priority: '中优先', start: 5, duration: 4, invest: 120, saving: 96, payback: '2.5年', status: 'pending', statusLabel: '未开始', statusType: 'warning', progress: '0%', color: '#FAAD14', description: '回收淬火/回火炉烟气余热用于预热助燃空气，年节约96 tce。' },
        { id: 5, name: '屋顶光伏扩容 2→3.5MWp', dept: '新能源部', priority: '建议', start: 6, duration: 2, invest: 420, saving: 228, payback: '4.5年', status: 'pending', statusLabel: '未开始', statusType: 'info', progress: '0%', color: '#722ED1', description: '新增1.5MWp屋顶光伏，年增发电150万kWh，减碳228 tCO₂。' },
        { id: 6, name: '能源管理体系持续优化', dept: '能源管理部', priority: '建议', start: 0, duration: 8, invest: 30, saving: 150, payback: '—', status: 'pending', statusLabel: '未开始', statusType: 'info', progress: '0%', color: '#8C8C8C', description: '落实GB/T 23331能源管理体系，开展能源审计与全员节能，年节约150 tce。' }
      ],
      measureVisible: false,
      currentMeasure: {},
      // ---- 节能目标设定 ----
      industryList: [
        { label: '化工行业', value: 'chemical' },
        { label: '钢铁行业', value: 'steel' },
        { label: '建材行业', value: 'building' },
        { label: '有色金属行业', value: 'metal' },
        { label: '机械制造行业', value: 'machinery' }
      ],
      targetForm: {
        intensityTarget: '0.40',
        savingTarget: '500',
        declineRate: '5.0',
        renewableRatio: '40',
        targetYear: '',
        industry: 'machinery'
      },
      targetRules: {
        intensityTarget: [{ required: true, message: '请输入能耗强度目标', trigger: 'blur' }],
        savingTarget: [{ required: true, message: '请输入节能量目标', trigger: 'blur' }],
        declineRate: [{ required: true, message: '请输入下降率目标', trigger: 'blur' }],
        targetYear: [{ required: true, message: '请选择目标年份', trigger: 'change' }],
        industry: [{ required: true, message: '请选择对标行业', trigger: 'change' }]
      },
      // ---- 对标历史记录 ----
      historyYear: '',
      historyGrade: '',
      historyYears: ['2026', '2025', '2024', '2023'],
      benchmarkHistory: [
        { year: '2026', indicator: '单位产品综合能耗', currentValue: '128.5 kgce/件', standardValue: '200.0 kgce/件', gap: '-71.5', gapClass: 'gap-good', grade: '1级', gradeClass: 'good', remark: '优于先进值' },
        { year: '2026', indicator: '单位产值综合能耗', currentValue: '0.38 tce/万元', standardValue: '0.55 tce/万元', gap: '-0.17', gapClass: 'gap-good', grade: '2级', gradeClass: 'mid', remark: '达到准入值' },
        { year: '2026', indicator: '锅炉热效率', currentValue: '92.3%', standardValue: '82.0%', gap: '+10.3', gapClass: 'gap-good', grade: '2级', gradeClass: 'mid', remark: '达到准入值' },
        { year: '2026', indicator: '余热回收利用率', currentValue: '62.5%', standardValue: '55.0%', gap: '+7.5', gapClass: 'gap-bad', grade: '3级', gradeClass: 'bad', remark: '未达准入值' },
        { year: '2025', indicator: '单位产品综合能耗', currentValue: '168.5 kgce/件', standardValue: '200.0 kgce/件', gap: '-31.5', gapClass: 'gap-good', grade: '2级', gradeClass: 'mid', remark: '达到准入值' },
        { year: '2025', indicator: '单位产值综合能耗', currentValue: '0.42 tce/万元', standardValue: '0.55 tce/万元', gap: '-0.13', gapClass: 'gap-good', grade: '2级', gradeClass: 'mid', remark: '达到准入值' },
        { year: '2025', indicator: '余热回收利用率', currentValue: '55.0%', standardValue: '55.0%', gap: '0', gapClass: 'gap-good', grade: '3级', gradeClass: 'bad', remark: '触及限定值' },
        { year: '2024', indicator: '单位产品综合能耗', currentValue: '175.2 kgce/件', standardValue: '200.0 kgce/件', gap: '-24.8', gapClass: 'gap-good', grade: '2级', gradeClass: 'mid', remark: '达到准入值' }
      ]
    }
  },
  computed: {
    deviceTypes() {
      const types = this.devices.map(d => d.type)
      return [...new Set(types)]
    },
    filteredDevices() {
      return this.devices.filter(d => {
        if (this.deviceGradeFilter && d.gradeLabel !== this.deviceGradeFilter + '级') return false
        if (this.deviceTypeFilter && d.type !== this.deviceTypeFilter) return false
        if (this.deviceResultFilter && d.resultType !== (this.deviceResultFilter === 'pass' ? 'success' : 'danger')) return false
        return true
      }).sort((a, b) => {
        // 3级置顶显示，优先暴露不达标设备
        const order = { bad: 1, mid: 2, good: 3 }
        return order[a.gradeClass] - order[b.gradeClass]
      })
    },
    filteredHistory() {
      return this.benchmarkHistory.filter(r => {
        if (this.historyYear && r.year !== this.historyYear) return false
        if (this.historyGrade && r.grade !== this.historyGrade + '级') return false
        return true
      })
    },
    ganttMeasures() {
      const total = this.quarters.length
      return this.roadmapMeasures.map(m => {
        const widthNum = Math.min(m.duration, total - m.start) / total * 100
        return {
          ...m,
          left: (m.start / total * 100) + '%',
          widthNum,
          width: widthNum + '%'
        }
      })
    },
    radarOption() {
      return {
        tooltip: {},
        legend: { data: ['企业当前值', '行业平均值', '行业先进值'], bottom: 0 },
        radar: {
          indicator: [
            { name: '单位产品综合能耗', max: 100 },
            { name: '单位产值综合能耗', max: 100 },
            { name: '万元增加值能耗', max: 100 },
            { name: '单位产品碳排放', max: 100 },
            { name: '可再生能源占比', max: 100 },
            { name: '余热回收利用率', max: 100 },
            { name: '能源综合利用率', max: 100 }
          ],
          radius: '66%',
          center: ['50%', '52%'],
          name: { textStyle: { fontSize: 11, color: '#595959' } },
          splitArea: { areaStyle: { color: ['rgba(24,144,255,0.02)', 'rgba(24,144,255,0.05)'] } },
          axisLine: { lineStyle: { color: '#E8E8E8' } },
          splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        series: [{
          type: 'radar',
          symbolSize: 4,
          data: [
            { name: '企业当前值', value: [86.5, 78.9, 86.5, 80.9, 60.0, 80.1, 88.8], lineStyle: { color: '#1890FF', width: 2 }, itemStyle: { color: '#1890FF' }, areaStyle: { color: 'rgba(24,144,255,0.22)' } },
            { name: '行业平均值', value: [73.2, 71.4, 77.6, 73.3, 40.0, 74.4, 82.5], lineStyle: { color: '#8C8C8C', width: 1.5 }, itemStyle: { color: '#8C8C8C' }, areaStyle: { color: 'rgba(140,140,140,0.12)' } },
            { name: '行业先进值', value: [100, 100, 100, 100, 100, 100, 100], lineStyle: { color: '#52C41A', type: 'dashed', width: 1.5 }, itemStyle: { color: '#52C41A' }, areaStyle: { color: 'rgba(82,196,26,0.04)' } }
          ]
        }]
      }
    },
    industryCompareOption() {
      const categories = ['本园区', '行业平均', '国内先进', '国际先进']
      if (this.compareTab === 'intensity') {
        return {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { containLabel: true, top: 30, right: 20, bottom: 30, left: 60 },
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value', name: 'kgce/件', nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontSize: 11 } },
          series: [{
            type: 'bar',
            barWidth: 36,
            data: [
              { value: 128.5, itemStyle: { color: '#1890FF' } },
              { value: 185.2, itemStyle: { color: '#8C8C8C' } },
              { value: 135.6, itemStyle: { color: '#52C41A' } },
              { value: 118.3, itemStyle: { color: '#FAAD14' } }
            ],
            label: { show: true, position: 'top', fontFamily: 'D-DIN' }
          }]
        }
      }
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { containLabel: true, top: 30, right: 20, bottom: 30, left: 60 },
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value', name: '%', nameTextStyle: { fontSize: 12, color: '#666' }, axisLabel: { fontSize: 11 } },
        series: [{
          type: 'bar',
          barWidth: 36,
          data: [
            { value: 78.5, itemStyle: { color: '#1890FF' } },
            { value: 72.0, itemStyle: { color: '#8C8C8C' } },
            { value: 88.3, itemStyle: { color: '#52C41A' } },
            { value: 92.1, itemStyle: { color: '#FAAD14' } }
          ],
          label: { show: true, position: 'top', formatter: '{c}%', fontFamily: 'D-DIN' }
        }]
      }
    },
    gapAnalysisOption() {
      const indicators = ['单位产品能耗', '单位产值能耗', '锅炉热效率', '电力线损率', '余热回收率']
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['与国内先进差距', '与国际先进差距'], bottom: 0 },
        grid: { containLabel: true, top: 20, right: 40, bottom: 40, left: 100 },
        xAxis: { type: 'value', name: '%' },
        yAxis: { type: 'category', data: indicators },
        series: [
          {
            name: '与国内先进差距',
            type: 'bar',
            barWidth: 16,
            data: [15.7, 15.6, -4.7, -4.0, -10.7],
            itemStyle: { color: '#1890FF' },
            label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
          },
          {
            name: '与国际先进差距',
            type: 'bar',
            barWidth: 16,
            data: [32.5, 28.6, -7.8, 1.6, -24.5],
            itemStyle: { color: '#FAAD14' },
            label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
          }
        ]
      }
    }
  },
  methods: {
    refreshData() {
      this.refreshKey++
      this.$message.success('数据已刷新')
    },
    handleCompareTabChange(key) {
      this.compareTab = key
    },
    openMeasure(m) {
      this.currentMeasure = m
      this.measureVisible = true
    },
    handleSubmitTarget() {
      this.$refs.targetForm.validate(valid => {
        if (valid) {
          this.$message.success('节能目标已提交，并同步至模块2目标考核与强度目标设置')
        }
      })
    },
    handleResetTarget() {
      this.$refs.targetForm.resetFields()
    },
    handlePageChange() {},
    handleExport() {
      this.$message.success('对标历史记录已导出')
    }
  }
}
</script>

<style lang="scss" scoped>
.view-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: $spacing-md; padding: 10px $spacing-md; background: $background-white; border-radius: $card-radius; box-shadow: $card-shadow; }

.benchmark-tabs {
  margin-top: $spacing-md;
  ::v-deep .el-tabs__header { margin-bottom: $spacing-md; }
  ::v-deep .el-tabs__item { font-family: $font-title; font-size: $font-size-14; height: 40px; line-height: 40px; }
}

.section-card { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.section-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.mb-lg { margin-bottom: 16px; }

// 三色统计卡片
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: $gutter; }
.stat-card {
  background: $background-white; border-radius: $card-radius; padding: $spacing-lg; box-shadow: $card-shadow;
  border-left: 4px solid transparent;
  &__value { font-size: $font-size-24; font-weight: 600; }
  &__label { font-size: $font-size-14; color: $text-primary; margin-top: 4px; font-weight: 500; }
  &__desc { font-size: $font-size-12; color: $text-placeholder; margin-top: 4px; }
}

// 国标对标面板
.benchmark-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: $gutter; }
.benchmark-item {
  background: #FAFAFA; border-radius: $radius-md; padding: $spacing-md;
  &__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  &__name { font-size: $font-size-14; color: $text-primary; font-weight: 500; }
  &__value { display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px; }
}
.benchmark-val { font-size: $font-size-24; color: $text-primary; }
.benchmark-unit { font-size: $font-size-12; color: $text-placeholder; }

// 三级限值进度条
.limit-bar {
  &__track { position: relative; height: 10px; border-radius: 5px; background: #F0F0F0; margin-bottom: 6px; }
  &__gradient { position: absolute; inset: 0; border-radius: 5px; }
  &__track--low .limit-bar__gradient { background: linear-gradient(to right, #52C41A 0%, #FAAD14 50%, #FF4D4F 100%); }
  &__track--high .limit-bar__gradient { background: linear-gradient(to right, #FF4D4F 0%, #FAAD14 50%, #52C41A 100%); }
  &__marker { position: absolute; top: -3px; width: 4px; height: 16px; border-radius: 2px; background: #1890FF; transform: translateX(-2px); box-shadow: 0 0 4px rgba(24,144,255,0.6); }
  &__labels { display: flex; justify-content: space-between; font-size: $font-size-12; color: $text-placeholder; }
}

// 雷达图说明
.chart-note { margin-top: $spacing-sm; font-size: $font-size-12; color: $text-placeholder; text-align: center; }

// 等级徽章
.grade-badge { padding: 2px 10px; border-radius: 2px; font-size: $font-size-12; font-weight: 500; white-space: nowrap;
  &--good { color: $success-color; background: rgba($success-color, 0.1); }
  &--mid { color: $warning-color; background: rgba($warning-color, 0.1); }
  &--bad { color: $danger-color; background: rgba($danger-color, 0.1); }
}

.chart-row { display: flex; gap: $gutter; }
.flex-1 { flex: 1; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: $gutter; }

// 对标预警
.alert-list { display: flex; flex-direction: column; gap: 10px; }
.alert-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #FAFAFA; border-radius: 4px;
  &__src { font-size: $font-size-14; color: $text-primary; font-weight: 500; min-width: 150px; }
  &__desc { font-size: $font-size-14; color: $text-secondary; flex: 1; }
  &__time { font-size: $font-size-12; color: $text-placeholder; font-family: $font-d-din; }
}
.alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  &--yellow { background: #FACC14; }
  &--orange { background: #FAAD14; }
  &--red { background: #FF4D4F; }
}
.alert-level { font-size: $font-size-12; font-weight: 500; padding: 2px 8px; border-radius: 2px; white-space: nowrap;
  &--yellow { color: #D48806; background: rgba(250,204,20,0.15); }
  &--orange { color: #D46B08; background: rgba(250,173,20,0.15); }
  &--red { color: $danger-color; background: rgba($danger-color, 0.1); }
}

// 设备清单
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: $spacing-md; }
.filter-count { margin-left: auto; font-size: $font-size-12; color: $text-placeholder; }
.device-detail { display: flex; gap: $spacing-lg; padding: $spacing-md $spacing-lg; background: #FAFAFA;
  &__col { flex: 1; }
  &__col--wide { flex: 1.6; }
  h4 { font-size: $font-size-14; color: $text-primary; margin-bottom: 8px; }
}
.detail-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: $font-size-12; }
.detail-label { color: $text-placeholder; }
.detail-value { color: $text-primary; }
.detail-suggestion { font-size: $font-size-12; color: $text-secondary; line-height: $line-height-relaxed; }

// 甘特图
.gantt { display: flex; flex-direction: column; }
.gantt__header { display: flex; align-items: center; }
.gantt__axis { flex: 1; display: flex;
  &--label { flex: 0 0 280px; }
}
.gantt__quarter { flex: 1; text-align: center; font-size: $font-size-12; color: $text-placeholder; padding: 8px 0; }
.gantt__row { display: flex; align-items: center; margin-bottom: 6px; }
.gantt__task-label { flex: 0 0 280px; display: flex; flex-direction: column; padding-right: 12px;
  .gantt__task-name { font-size: $font-size-12; color: $text-primary; }
  .gantt__task-dept { font-size: $font-size-12; color: $text-placeholder; }
}
.gantt__track { flex: 1; position: relative; height: 30px; background: #FAFAFA; border-radius: 4px; }
.gantt__grid { position: absolute; inset: 0; display: flex;
  .gantt__grid-line { flex: 1; border-right: 1px solid #F0F0F0; }
}
.gantt__bar { position: absolute; top: 6px; height: 18px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all $transition-duration;
  &:hover { opacity: 0.85; }
}
.gantt__bar-text { font-size: $font-size-12; color: #fff; white-space: nowrap; overflow: hidden; padding: 0 6px; }
.gantt__legend { display: flex; gap: 20px; margin-top: $spacing-md; justify-content: flex-end; }
.legend-item { font-size: $font-size-12; color: $text-secondary; display: flex; align-items: center; gap: 6px; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }

.gap-val { font-family: $font-d-din;
  &.gap-good { color: $success-color; }
  &.gap-bad { color: $danger-color; }
}
</style>