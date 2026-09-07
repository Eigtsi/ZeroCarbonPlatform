<template>
  <div class="strategy-center">
    <!-- 筛选 + 排序工具栏 -->
    <div class="strategy-toolbar mb-lg">
      <div class="filter-group">
        <el-radio-group v-model="filterPriority" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="high">高优先</el-radio-button>
          <el-radio-button label="medium">中优先</el-radio-button>
          <el-radio-button label="low">建议</el-radio-button>
        </el-radio-group>
        <el-select v-model="filterCategory" placeholder="策略分类" size="small" clearable style="width:140px;margin-left:12px">
          <el-option label="全部" value="" />
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" size="small" clearable style="width:120px;margin-left:8px">
          <el-option label="全部" value="" />
          <el-option label="待评估" value="pending" />
          <el-option label="已采纳" value="adopted" />
          <el-option label="已忽略" value="ignored" />
          <el-option label="已实施" value="implemented" />
        </el-select>
      </div>
      <div class="sort-group">
        <span class="sort-label">排序：</span>
        <el-radio-group v-model="sortBy" size="small">
          <el-radio-button label="score">综合评分</el-radio-button>
          <el-radio-button label="saving">节能量</el-radio-button>
          <el-radio-button label="payback">投资回收期</el-radio-button>
          <el-radio-button label="carbon">减碳量</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="primary" icon="el-icon-refresh" style="margin-left:12px" @click="regenerateStrategies">重新分析</el-button>
      </div>
    </div>

    <!-- 策略卡片网格 -->
    <div class="strategy-card-grid mb-lg">
      <div v-for="(card, idx) in filteredStrategies" :key="idx"
        :class="['strategy-card', `strategy-card--${card.status}`]">
        <!-- 状态覆盖层 -->
        <div v-if="card.status === 'ignored'" class="strategy-overlay strategy-overlay--ignored">
          <span>已忽略</span>
        </div>
        <div class="strategy-card__header">
          <span :class="['priority-badge', `priority-badge--${card.priority}`]">{{ card.priorityLabel }}</span>
          <span class="category-tag">{{ card.category }}</span>
          <span v-if="card.status === 'adopted'" class="status-adopted"><i class="el-icon-check"></i> 已采纳</span>
          <span v-if="card.status === 'implemented'" class="status-implemented"><i class="el-icon-circle-check"></i> 已实施</span>
        </div>
        <h4 class="strategy-card__title">{{ card.title }}</h4>
        <p class="strategy-card__desc">{{ card.description }}</p>
        <!-- 三指标 -->
        <div class="strategy-card__metrics">
          <div class="s-metric">
            <span class="s-metric__label">预计节能</span>
            <span class="s-metric__value font-d-din">{{ card.saving }}</span>
          </div>
          <div class="s-metric">
            <span class="s-metric__label">投资回收期</span>
            <span class="s-metric__value font-d-din">{{ card.payback }}</span>
          </div>
          <div class="s-metric">
            <span class="s-metric__label">减碳量</span>
            <span class="s-metric__value font-d-din">{{ card.carbonReduction }}</span>
          </div>
        </div>
        <!-- 评分条 -->
        <div class="score-bar mb-sm">
          <span class="score-label">综合评分</span>
          <el-progress :percentage="card.score" :color="card.score >= 80 ? '#52C41A' : card.score >= 60 ? '#FAAD14' : '#FF4D4F'" :stroke-width="6" :show-text="false" />
          <span class="score-value font-d-din">{{ card.score }}分</span>
        </div>
        <!-- 底部操作 -->
        <div class="strategy-card__footer">
          <span class="confidence">置信度 <strong :style="{ color: card.confidence >= 90 ? '#52C41A' : card.confidence >= 80 ? '#FAAD14' : '#8C8C8C' }" class="font-d-din">{{ card.confidence }}%</strong></span>
          <div v-if="card.status === 'pending'" class="action-btns">
            <el-button type="primary" size="mini" @click="adoptStrategy(card)">采纳方案</el-button>
            <el-button size="mini" @click="ignoreStrategy(card)">忽略</el-button>
            <el-button size="mini" @click="deferStrategy(card)">稍后再说</el-button>
          </div>
          <div v-else-if="card.status === 'adopted'" class="action-btns">
            <el-button size="mini" type="success" @click="viewProgress(card)">查看进度</el-button>
          </div>
          <div v-else-if="card.status === 'ignored'" class="action-btns">
            <el-button size="mini" type="text" @click="reconsider(card)">重新考虑</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已采纳策略进度甘特图 -->
    <div class="section-card" v-if="adoptedStrategies.length">
      <h3 class="section-title">已采纳策略 · 实施进度</h3>
      <div class="gantt-chart">
        <div v-for="(s, idx) in adoptedStrategies" :key="idx" class="gantt-row">
          <div class="gantt-label">{{ s.title }}</div>
          <div class="gantt-bar-wrap">
            <div class="gantt-bar" :style="{ width: s.progress + '%', background: s.progress >= 80 ? '#52C41A' : s.progress >= 40 ? '#1890FF' : '#FAAD14' }">
              <span class="gantt-progress-text">{{ s.progress }}%</span>
            </div>
          </div>
          <span class="gantt-date">{{ s.startDate }} ~ {{ s.endDate }}</span>
        </div>
      </div>
    </div>

    <!-- 效果复盘面板 -->
    <div class="section-card" v-if="implementedStrategies.length">
      <h3 class="section-title">效果复盘 · 实施后6个月对比</h3>
      <div v-for="(s, idx) in implementedStrategies" :key="idx" class="review-item mb-md">
        <h4 class="review-title">{{ s.title }}</h4>
        <div class="review-grid">
          <div class="review-kpi">
            <span class="review-kpi__label">预估节能量</span>
            <span class="review-kpi__value font-d-din">{{ s.estimatedSaving }}</span>
          </div>
          <div class="review-kpi">
            <span class="review-kpi__label">实际节能量</span>
            <span class="review-kpi__value font-d-din" :style="{ color: s.actualSaving >= s.estimatedValue ? '#52C41A' : '#FF4D4F' }">{{ s.actualSaving }}</span>
          </div>
          <div class="review-kpi">
            <span class="review-kpi__label">偏差</span>
            <span class="review-kpi__value font-d-din" :style="{ color: Math.abs(s.deviation) <= 30 ? '#52C41A' : '#FAAD14' }">{{ s.deviation }}%</span>
          </div>
          <div class="review-kpi">
            <span class="review-kpi__label">实际ROI</span>
            <span class="review-kpi__value font-d-din">{{ s.actualROI }}%</span>
          </div>
        </div>
        <div class="review-comment" v-if="s.deviation > 30">
          <el-tag type="warning" size="small">偏差>30%，需复盘分析：{{ s.reviewNote }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StrategyCenter',
  props: {
    org: { type: Array, default: () => [] },
    dateRange: { type: Array, default: () => ['2026-07-01', '2026-07-31'] }
  },
  data() {
    return {
      filterPriority: '',
      filterCategory: '',
      filterStatus: '',
      sortBy: 'score',
      categories: ['锅炉优化', '空压系统', '水泵系统', '能源替代', '管理优化', '智慧运维'],
      strategies: [
        { id: 1, priority: 'high', priorityLabel: '高优先', category: '锅炉优化', title: 'BL-02 燃煤锅炉淘汰替代（煤改气+高效冷凝锅炉）',
          description: '当前热效率仅69.5%，远低于GB 24500限定值88%。建议淘汰4t/h燃煤锅炉，新建6t/h高效冷凝燃气锅炉（设计效率≥96%）。改造后月均用煤125t归零，年节约标煤186 tce。',
          saving: '186 tce/年', payback: '1.8年', carbonReduction: '142 tCO₂/年', investment: '120万元', difficulty: 3,
          score: 95, confidence: 95, status: 'pending', progress: 0, startDate: '', endDate: '' },
        { id: 2, priority: 'high', priorityLabel: '高优先', category: '空压系统', title: 'AC-02 螺杆空压机变频改造+群控策略',
          description: '当前比功率7.8，加载率58%，非生产时段空载3h/天。变频改造配合多机联控策略，消除空载运行，比功率降至6.5以下。',
          saving: '85 tce/年', payback: '1.2年', carbonReduction: '62 tCO₂/年', investment: '45万元', difficulty: 2,
          score: 92, confidence: 92, status: 'adopted', progress: 65, startDate: '2026-06-01', endDate: '2026-09-30' },
        { id: 3, priority: 'medium', priorityLabel: '中优先', category: '水泵系统', title: '循环水泵组(CP-01/给水泵)变频改造+叶轮优化',
          description: 'CP-01系统效率72%低于GB 19762标准，给水泵扬程过剩25%。叶轮切削降扬程+变频按需供水。',
          saving: '42 tce/年', payback: '1.5年', carbonReduction: '31 tCO₂/年', investment: '28万元', difficulty: 2,
          score: 88, confidence: 88, status: 'pending', progress: 0, startDate: '', endDate: '' },
        { id: 4, priority: 'medium', priorityLabel: '中优先', category: '能源替代', title: '屋顶分布式光伏扩容（现有2MWp→3.5MWp）',
          description: '当前光伏年发电200万kWh，消纳比98%。厂房屋顶可用面积约8,000m²，现状仅利用60%。扩容后新增年发电150万kWh。',
          saving: '310 tce/年', payback: '4.5年', carbonReduction: '228 tCO₂/年', investment: '420万元', difficulty: 3,
          score: 82, confidence: 82, status: 'pending', progress: 0, startDate: '', endDate: '' },
        { id: 5, priority: 'low', priorityLabel: '建议', category: '管理优化', title: '峰谷用电时段优化调度',
          description: '当前峰时段用电占35%，谷时段仅18%。可转移负荷约400kW(DR-01/AC-02/PW-01等可错峰设备)。转移至谷电时段可降低电费。',
          saving: '降低电费64万/年', payback: '即时', carbonReduction: '—(降费不降碳)', investment: '5万元', difficulty: 1,
          score: 93, confidence: 93, status: 'implemented', progress: 100, startDate: '2026-02-01', endDate: '2026-03-31',
          estimatedSaving: '降低电费60万/年', actualSaving: '降低电费58万/年', estimatedValue: 60, actualValue: 58, deviation: 3.3, actualROI: 1160, reviewNote: '' },
        { id: 6, priority: 'low', priorityLabel: '建议', category: '智慧运维', title: '蒸汽管网保温全面升级+疏水阀更换',
          description: '分汽缸M14出口→5路支管温差3-8℃，管道表面温度45-65℃（环境30℃），估算年散热损失约210 GJ。',
          saving: '32 tce/年', payback: '1.1年', carbonReduction: '24 tCO₂/年', investment: '18万元', difficulty: 1,
          score: 87, confidence: 87, status: 'pending', progress: 0, startDate: '', endDate: '' },
        { id: 7, priority: 'medium', priorityLabel: '中优先', category: '管理优化', title: '设备预测性维护体系建设',
          description: '部署设备状态在线监测与故障预警模型，实现从定期维护向按需维护转变，减少非计划停机和性能衰减。',
          saving: '降低运维成本25%', payback: '1.5年', carbonReduction: '15 tCO₂/年', investment: '35万元', difficulty: 2,
          score: 78, confidence: 82, status: 'pending', progress: 0, startDate: '', endDate: '' },
        { id: 8, priority: 'high', priorityLabel: '高优先', category: '锅炉优化', title: '锅炉燃烧参数智能调优（BL-01+BL-02联合优化）',
          description: '基于历史运行数据与负荷预测模型，动态调整空燃比和给煤/给气量。优先投用高效BL-01(92.3%)，BL-02仅补充缺口。',
          saving: '126 tce/年', payback: '0.7年', carbonReduction: '89 tCO₂/年', investment: '15万元', difficulty: 1,
          score: 91, confidence: 91, status: 'pending', progress: 0, startDate: '', endDate: '' }
      ]
    }
  },
  computed: {
    filteredStrategies() {
      let list = this.strategies
      if (this.filterPriority) list = list.filter(s => s.priority === this.filterPriority)
      if (this.filterCategory) list = list.filter(s => s.category === this.filterCategory)
      if (this.filterStatus) list = list.filter(s => s.status === this.filterStatus)
      if (this.sortBy === 'saving') list = [...list].sort((a, b) => parseFloat(b.saving) - parseFloat(a.saving))
      else if (this.sortBy === 'payback') list = [...list].sort((a, b) => parseFloat(a.payback) - parseFloat(b.payback))
      else if (this.sortBy === 'carbon') list = [...list].sort((a, b) => parseFloat(b.carbonReduction) - parseFloat(a.carbonReduction))
      else list = [...list].sort((a, b) => b.score - a.score)
      return list
    },
    adoptedStrategies() {
      return this.strategies.filter(s => s.status === 'adopted')
    },
    implementedStrategies() {
      return this.strategies.filter(s => s.status === 'implemented' && s.deviation !== undefined)
    }
  },
  methods: {
    adoptStrategy(card) {
      card.status = 'adopted'
      card.progress = 5
      card.startDate = '2026-08-01'
      card.endDate = '2026-12-31'
      this.$message.success(`已采纳方案: ${card.title}，系统已自动创建项目管理工单`)
    },
    ignoreStrategy(card) {
      card.status = 'ignored'
      this.$message.info(`已忽略方案: ${card.title}`)
    },
    deferStrategy(card) {
      this.$message.info(`已标记"稍后再说": ${card.title}`)
    },
    reconsider(card) {
      card.status = 'pending'
      this.$message.success(`已重新考虑方案: ${card.title}`)
    },
    viewProgress(card) {
      this.$message.info(`跳转至项目管理查看: ${card.title}`)
    },
    regenerateStrategies() {
      this.$message.success('策略重新分析已触发，约需30秒...')
    }
  }
}
</script>

<style lang="scss" scoped>
.strategy-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  background: $background-white; border-radius: $card-radius; padding: 12px $spacing-md;
  box-shadow: $card-shadow; flex-wrap: wrap; gap: 8px;
}
.filter-group, .sort-group { display: flex; align-items: center; }
.sort-label { font-size: $font-size-14; color: $text-secondary; margin-right: 8px; }
.strategy-card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: $gutter; }
.strategy-card {
  background: $background-white; border-radius: $card-radius; padding: $spacing-md;
  box-shadow: $card-shadow; border: 1px solid $border-color-light; position: relative;
  transition: all $transition-duration; display: flex; flex-direction: column;
  &:hover { border-color: rgba($primary-color,0.3); box-shadow: 0 2px 12px rgba(24,144,255,0.1); }
  &--ignored { opacity: 0.65; }
  &__header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  &__title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: 8px; line-height: $line-height-tight; }
  &__desc { font-size: $font-size-14; color: $text-secondary; line-height: $line-height-relaxed; margin-bottom: $spacing-md; flex: 1; }
  &__metrics { display: flex; gap: $spacing-lg; padding: $spacing-sm 0; margin-bottom: $spacing-sm; border-top: 1px solid $divider-color; border-bottom: 1px solid $divider-color; }
  &__footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
}
.priority-badge {
  display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: $font-size-12; font-weight: 500;
  &--high { color: #FF4D4F; background: rgba(255,77,79,0.1); border: 1px solid rgba(255,77,79,0.3); }
  &--medium { color: #FAAD14; background: rgba(250,173,20,0.1); border: 1px solid rgba(250,173,20,0.3); }
  &--low { color: #1890FF; background: rgba(24,144,255,0.08); border: 1px solid rgba(24,144,255,0.2); }
}
.category-tag { font-size: $font-size-12; color: $text-placeholder; }
.status-adopted { font-size: $font-size-12; color: #52C41A; margin-left: auto; }
.status-implemented { font-size: $font-size-12; color: #1890FF; margin-left: auto; }
.strategy-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.7); border-radius: $card-radius; z-index: 1; font-size: 18px; color: #8C8C8C;
}
.s-metric { display: flex; flex-direction: column; gap: 4px; &__label { font-size: $font-size-12; color: $text-placeholder; } &__value { font-size: $font-size-14; color: $text-primary; font-weight: 600; } }
.score-bar { display: flex; align-items: center; gap: 8px; .score-label { font-size: $font-size-12; color: $text-placeholder; width: 56px; } .score-value { font-size: $font-size-14; font-weight: 600; } ::v-deep .el-progress-bar { flex: 1; } }
.confidence { font-size: $font-size-12; color: $text-secondary; }
.action-btns { display: flex; gap: 4px; }
.section-card { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.section-title { font-family: $font-title; font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-md; }
.gantt-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid $border-color-light; }
.gantt-label { width: 280px; font-size: $font-size-14; color: $text-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gantt-bar-wrap { flex: 1; height: 22px; background: $background-color; border-radius: 4px; overflow: hidden; }
.gantt-bar { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: width 0.5s; min-width: 50px; }
.gantt-progress-text { font-size: 11px; color: #fff; font-weight: 500; }
.gantt-date { font-size: $font-size-12; color: $text-placeholder; width: 200px; text-align: right; }
.review-item { padding: $spacing-md; background: $background-color; border-radius: $card-radius; }
.review-title { font-size: $font-size-16; color: $text-primary; margin-bottom: $spacing-sm; }
.review-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
.review-kpi { text-align: center; &__label { font-size: $font-size-12; color: $text-placeholder; } &__value { font-size: $font-size-18; font-weight: 600; } }
.review-comment { margin-top: $spacing-sm; }
</style>
