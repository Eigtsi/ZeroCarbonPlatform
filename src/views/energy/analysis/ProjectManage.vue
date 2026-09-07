<template>
  <div class="project-manage">
    <!-- 项目统计卡片 -->
    <div class="project-stats-grid mb-lg">
      <div v-for="stat in projectStats" :key="stat.label" class="project-stat-card">
        <div class="stat-icon" :style="{ color: stat.color }"><i :class="stat.icon"></i></div>
        <div class="stat-info">
          <div class="stat-value font-d-din" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选工具 -->
    <div class="section-card mb-lg">
      <div class="toolbar-row">
        <el-input v-model="searchKey" placeholder="搜索项目名称" size="small" clearable prefix-icon="el-icon-search" style="width:240px" />
        <el-select v-model="filterStage" placeholder="项目阶段" size="small" clearable style="width:140px;margin-left:8px">
          <el-option label="全部" value="" />
          <el-option v-for="s in stages" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" size="small" clearable style="width:120px;margin-left:8px">
          <el-option label="全部" value="" />
          <el-option label="进行中" value="active" />
          <el-option label="已完成" value="done" />
          <el-option label="已延期" value="delayed" />
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-plus" style="margin-left:auto" @click="handleAddProject">新建项目</el-button>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="section-card mb-lg">
      <el-table :data="filteredProjects" size="small" stripe>
        <el-table-column prop="name" label="项目名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="stageLabel" label="当前阶段" width="100" align="center">
          <template slot-scope="{ row }">
            <span :class="['stage-tag', `stage--${row.stage}`]">{{ row.stageLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedSaving" label="预计节能量(tce/年)" width="150" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.estimatedSaving }}</span></template>
        </el-table-column>
        <el-table-column prop="investment" label="投资额(万元)" width="120" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.investment }}</span></template>
        </el-table-column>
        <el-table-column prop="responsible" label="负责人" width="90" align="center" />
        <el-table-column prop="statusLabel" label="状态" width="90" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="viewProject(row)">详情</el-button>
            <el-button v-if="row.stage === 'propose'" type="text" size="small" @click="advanceStage(row)">推进</el-button>
            <el-button type="text" size="small" @click="exportReport(row)">报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- PDCA 流程看板 -->
    <div class="section-card">
      <h3 class="section-title">PDCA 节能项目管理看板</h3>
      <div class="pdca-board">
        <div v-for="s in stages" :key="s.value" :class="['pdca-column', `pdca--${s.value}`]">
          <div class="pdca-column__header">
            <span :class="['pdca-icon', `pdca-icon--${s.value}`]">{{ s.icon }}</span>
            <span class="pdca-title">{{ s.label }}</span>
            <span class="pdca-count">{{ getStageCount(s.value) }}</span>
          </div>
          <div class="pdca-column__body">
            <div v-for="project in getStageProjects(s.value)" :key="project.id" class="pdca-card" @click="viewProject(project)">
              <div class="pdca-card__title">{{ project.name }}</div>
              <div class="pdca-card__meta">
                <span>预计节能 {{ project.estimatedSaving }} tce/年</span>
                <span>{{ project.responsible }}</span>
              </div>
              <el-progress :percentage="project.progress" :stroke-width="4" :show-text="false" :color="project.progress >= 80 ? '#52C41A' : '#1890FF'" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <el-dialog :title="viewProjectData ? viewProjectData.name : ''" :visible.sync="detailVisible" width="750px" top="5vh">
      <div v-if="viewProjectData" class="project-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="项目名称" :span="2">{{ viewProjectData.name }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ viewProjectData.source }}</el-descriptions-item>
          <el-descriptions-item label="当前阶段">{{ viewProjectData.stageLabel }}</el-descriptions-item>
          <el-descriptions-item label="发起时间">{{ viewProjectData.startDate }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ viewProjectData.responsible }}</el-descriptions-item>
          <el-descriptions-item label="预计节能量">{{ viewProjectData.estimatedSaving }} tce/年</el-descriptions-item>
          <el-descriptions-item label="投资额">{{ viewProjectData.investment }} 万元</el-descriptions-item>
          <el-descriptions-item label="预计回收期">{{ viewProjectData.payback }}</el-descriptions-item>
          <el-descriptions-item label="减碳量">{{ viewProjectData.carbonReduction }}</el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">{{ viewProjectData.description }}</el-descriptions-item>
        </el-descriptions>
        <!-- 阶段流转记录 -->
        <h4 class="subsection-title mt-md">阶段流转记录</h4>
        <el-timeline>
          <el-timeline-item v-for="(log, idx) in viewProjectData.stageLog" :key="idx"
            :timestamp="log.time" :type="log.type" placement="top">
            <p>{{ log.content }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
      <span slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="viewProjectData && viewProjectData.stage !== 'completed'" type="primary" @click="advanceStage(viewProjectData); detailVisible = false">推进至下一阶段</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProjectManage',
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] }
  },
  data() {
    return {
      searchKey: '',
      filterStage: '',
      filterStatus: '',
      detailVisible: false,
      viewProjectData: null,
      stages: [
        { value: 'propose', label: '提议', icon: '💡' },
        { value: 'evaluate', label: '评估', icon: '📊' },
        { value: 'approve', label: '立项', icon: '📋' },
        { value: 'implement', label: '实施', icon: '🔧' },
        { value: 'accept', label: '验收', icon: '✅' },
        { value: 'tracking', label: '效果跟踪', icon: '📈' }
      ],
      projectStats: [
        { label: '项目总数', value: 12, color: '#595959', icon: 'el-icon-folder' },
        { label: '进行中', value: 5, color: '#1890FF', icon: 'el-icon-loading' },
        { label: '已完成', value: 4, color: '#52C41A', icon: 'el-icon-circle-check' },
        { label: '累计节能(tce)', value: 428, color: '#52C41A', icon: 'el-icon-data-line' },
        { label: '累计投资(万元)', value: 556, color: '#FAAD14', icon: 'el-icon-money' },
        { label: '待审批', value: 2, color: '#FF4D4F', icon: 'el-icon-bell' }
      ],
      projects: [
        { id: 1, name: 'BL-02燃煤锅炉淘汰替代（煤改气+高效冷凝锅炉）', stage: 'evaluate', stageLabel: '评估', status: 'active', statusLabel: '进行中', statusType: '', estimatedSaving: 186, investment: 120, payback: '1.8年', carbonReduction: '142 tCO₂/年', responsible: '张工', startDate: '2026-07-15', progress: 30, source: 'AI策略推荐',
          description: '淘汰现有4t/h燃煤锅炉，新建6t/h高效冷凝燃气锅炉。改造后年节约标煤186 tce，减排142 tCO₂。',
          stageLog: [{ time:'2026-07-15', content:'策略推荐引擎自动提议——BL-02效率仅69.5%，建议淘汰替代', type:'primary' },{ time:'2026-07-20', content:'能源管理员采纳方案，进入可行性评估阶段', type:'warning' }] },
        { id: 2, name: 'AC-02螺杆空压机变频改造+群控策略', stage: 'implement', stageLabel: '实施', status: 'active', statusLabel: '进行中', statusType: '', estimatedSaving: 85, investment: 45, payback: '1.2年', carbonReduction: '62 tCO₂/年', responsible: '李工', startDate: '2026-06-01', progress: 65, source: 'AI策略推荐',
          description: '对AC-02工频空压机实施变频改造，配合多机联控策略消除空载运行。',
          stageLog: [{ time:'2026-06-01', content:'项目立项审批通过，进入实施阶段', type:'success' },{ time:'2026-06-15', content:'变频器到货并安装完成', type:'primary' },{ time:'2026-07-10', content:'群控PLC编程调试中——预计8月底完成', type:'warning' }] },
        { id: 3, name: '屋顶分布式光伏扩容（2MWp→3.5MWp）', stage: 'evaluate', stageLabel: '评估', status: 'active', statusLabel: '进行中', statusType: '', estimatedSaving: 310, investment: 420, payback: '4.5年', carbonReduction: '228 tCO₂/年', responsible: '王工', startDate: '2026-07-01', progress: 15, source: '手动提议',
          description: '利用未充分利用的厂房屋顶面积（约3,200m²），新增1.5MWp光伏组件。',
          stageLog: [{ time:'2026-07-01', content:'能源管理员手动提议光伏扩容项目', type:'primary' },{ time:'2026-07-10', content:'屋顶荷载评估中——设计院现场勘察', type:'warning' }] },
        { id: 4, name: '峰谷用电时段优化调度', stage: 'tracking', stageLabel: '效果跟踪', status: 'done', statusLabel: '已完成', statusType: 'success', estimatedSaving: '降低电费60万/年', investment: 5, payback: '即时', carbonReduction: '—', responsible: '赵工', startDate: '2026-02-01', progress: 100, source: 'AI策略推荐',
          description: '将非连续性生产负荷转移至谷电时段，优化用能时段分布。',
          stageLog: [{ time:'2026-02-01', content:'方案采纳并立项', type:'success' },{ time:'2026-03-31', content:'实施完成——排产调整+设备启停自动化', type:'success' },{ time:'2026-04-01', content:'进入6个月效果跟踪期', type:'primary' }] },
        { id: 5, name: '循环水泵组(CP-01/给水泵)变频改造', stage: 'approve', stageLabel: '立项', status: 'active', statusLabel: '待审批', statusType: 'warning', estimatedSaving: 42, investment: 28, payback: '1.5年', carbonReduction: '31 tCO₂/年', responsible: '李工', startDate: '2026-07-20', progress: 10, source: 'AI策略推荐',
          description: 'CP-01变频改造+给水泵叶轮切削降低扬程25%。',
          stageLog: [{ time:'2026-07-20', content:'AI策略推荐产生方案', type:'primary' },{ time:'2026-07-25', content:'提交立项申请——待管理层审批', type:'warning' }] },
        { id: 6, name: '蒸汽管网保温全面升级+疏水阀更换', stage: 'propose', stageLabel: '提议', status: 'active', statusLabel: '进行中', statusType: '', estimatedSaving: 32, investment: 18, payback: '1.1年', carbonReduction: '24 tCO₂/年', responsible: '张工', startDate: '2026-08-01', progress: 5, source: 'AI策略推荐',
          description: '分汽缸M14出口5路蒸汽管道保温层升级+全厂疏水阀更换为节能型。',
          stageLog: [{ time:'2026-07-13', content:'AI策略推荐——蒸汽管道散热损失~210GJ/年，回收期仅1.1年', type:'primary' },{ time:'2026-08-01', content:'用户采纳方案并提议立项', type:'success' }] }
      ]
    }
  },
  computed: {
    filteredProjects() {
      let list = this.projects
      if (this.searchKey) { const kw = this.searchKey.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(kw) || p.responsible.includes(kw)) }
      if (this.filterStage) list = list.filter(p => p.stage === this.filterStage)
      if (this.filterStatus) list = list.filter(p => p.status === this.filterStatus)
      return list
    }
  },
  methods: {
    getStageCount(stage) { return this.projects.filter(p => p.stage === stage).length },
    getStageProjects(stage) { return this.projects.filter(p => p.stage === stage) },
    viewProject(row) { this.viewProjectData = row; this.detailVisible = true },
    handleAddProject() { this.$message.info('打开新建项目表单...') },
    advanceStage(row) {
      const stageOrder = ['propose','evaluate','approve','implement','accept','tracking']
      const idx = stageOrder.indexOf(row.stage)
      if (idx < stageOrder.length - 1) {
        row.stage = stageOrder[idx + 1]
        row.stageLabel = this.stages.find(s => s.value === row.stage).label
        row.progress = Math.min(100, row.progress + 20)
        row.stageLog.push({ time: new Date().toISOString().slice(0,10), content: `阶段推进至: ${row.stageLabel}`, type: 'success' })
        this.$message.success(`项目已推进至: ${row.stageLabel}`)
      }
    },
    exportReport(row) { this.$message.success(`正在导出报告: ${row.name}`) }
  }
}
</script>

<style lang="scss" scoped>
.project-stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: $gutter; }
.project-stat-card {
  background: $background-white; border-radius: $card-radius; padding: 16px 14px;
  box-shadow: $card-shadow; display: flex; align-items: center; gap: 12px;
  .stat-icon { font-size: 28px; }
  .stat-value { font-size: 22px; font-weight: 700; }
  .stat-label { font-size: $font-size-12; color: $text-secondary; }
}
.section-card { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.section-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.toolbar-row { display: flex; align-items: center; }
.subsection-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-sm; }
.stage-tag {
  display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: $font-size-12; font-weight: 500;
  &.stage--propose { color: #722ED1; background: rgba(114,46,209,0.1); }
  &.stage--evaluate { color: #FAAD14; background: rgba(250,173,20,0.1); }
  &.stage--approve { color: #FF4D4F; background: rgba(255,77,79,0.1); }
  &.stage--implement { color: #1890FF; background: rgba(24,144,255,0.1); }
  &.stage--accept { color: #52C41A; background: rgba(82,196,26,0.1); }
  &.stage--tracking { color: #13C2C2; background: rgba(19,194,194,0.1); }
}
// PDCA 看板
.pdca-board { display: grid; grid-template-columns: repeat(6, 1fr); gap: $gutter; min-height: 300px; }
.pdca-column {
  background: $background-color; border-radius: $card-radius; padding: 10px;
  &__header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid $divider-color; }
  &__body { display: flex; flex-direction: column; gap: 8px; }
}
.pdca-icon { font-size: 18px; }
.pdca-title { font-size: $font-size-14; font-weight: 600; color: $text-primary; }
.pdca-count { margin-left: auto; font-size: $font-size-12; color: $text-placeholder; background: $background-white; padding: 1px 6px; border-radius: 10px; }
.pdca-card {
  background: $background-white; border-radius: 4px; padding: 8px 10px; cursor: pointer;
  border: 1px solid $border-color-light; transition: all .2s;
  &:hover { border-color: $primary-color; box-shadow: 0 1px 4px rgba(24,144,255,0.15); }
  &__title { font-size: $font-size-14; color: $text-primary; font-weight: 500; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__meta { display: flex; justify-content: space-between; font-size: 11px; color: $text-placeholder; margin-bottom: 4px; }
}
</style>
