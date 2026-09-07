<template>
  <div class="alarm-monitor">
    <!-- 告警统计 -->
    <div class="alarm-stats-grid mb-lg">
      <div v-for="card in alarmStatCards" :key="card.label" :class="['alarm-stat-card', 'stat-card--' + card.border]" @click="quickFilter(card)">
        <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar mb-lg">
      <el-date-picker v-model="filters.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="handleQuery" />
      <el-select v-model="filters.alarmType" size="small" style="width:130px" placeholder="告警类型" clearable @change="handleQuery">
        <el-option v-for="t in alarmTypes" :key="t.key" :label="t.label" :value="t.key" />
      </el-select>
      <el-select v-model="filters.level" size="small" style="width:110px" placeholder="告警等级" clearable @change="handleQuery">
        <el-option v-for="l in alarmLevels" :key="l.key" :label="l.label" :value="l.key" />
      </el-select>
      <el-select v-model="filters.status" size="small" style="width:110px" placeholder="处理状态" clearable @change="handleQuery">
        <el-option v-for="s in alarmStatuses" :key="s.key" :label="s.label" :value="s.key" />
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">查询</el-button>
    </div>

    <!-- 告警列表 -->
    <DataTable title="告警记录" :data="alarmList" :total="alarmListTotal" :page="currentPage" :size="pageSize" @page-change="handlePageChange">
      <el-table-column prop="time" label="时间" min-width="150" align="center" />
      <el-table-column prop="source" label="来源" min-width="130" align="center" />
      <el-table-column prop="content" label="告警内容" min-width="200" />
      <el-table-column prop="typeLabel" label="告警类型" min-width="110" align="center">
        <template slot-scope="{ row }"><el-tag :type="row.level==='red'?'danger':row.level==='yellow'?'warning':''" size="small">{{ row.typeLabel }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="80" align="center">
        <template slot-scope="{ row }"><AlarmTag :level="row.level" :text="row.levelText" /></template>
      </el-table-column>
      <el-table-column prop="currentValue" label="当前值" min-width="100" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.currentValue }} {{ row.unit }}</span></template>
      </el-table-column>
      <el-table-column prop="threshold" label="阈值" min-width="100" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.threshold }} {{ row.unit }}</span></template>
      </el-table-column>
      <el-table-column prop="statusLabel" label="状态" width="80" align="center">
        <template slot-scope="{ row }"><span :class="['status-dot', statusDotClass(row.status)]"></span>{{ row.statusLabel }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openDialog(row)">{{ row.status === 'closed' ? '查看' : '处理' }}</el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 处理弹窗 -->
    <el-dialog :visible.sync="dlgVisible" :key="dlgKey" :title="'告警处理：' + (dlgAlarm ? dlgAlarm.content : '')" width="580px" top="50px" :close-on-click-modal="false" append-to-body @closed="resetDlg">
      <div v-if="dlgAlarm" class="alarm-flow">
        <div class="alarm-info">
          <div class="info-row"><span class="info-label">告警来源</span><span class="info-value">{{ dlgAlarm.source }}</span></div>
          <div class="info-row"><span class="info-label">告警时间</span><span class="info-value">{{ dlgAlarm.time }}</span></div>
          <div class="info-row"><span class="info-label">告警类型</span><AlarmTag :level="dlgAlarm.level" :text="dlgAlarm.typeLabel || dlgAlarm.levelText" /></div>
          <div class="info-row"><span class="info-label">当前值</span><span class="info-value font-d-din">{{ dlgAlarm.currentValue }} {{ dlgAlarm.unit }}</span></div>
          <div class="info-row"><span class="info-label">阈值</span><span class="info-value font-d-din">{{ dlgAlarm.threshold }} {{ dlgAlarm.unit }}</span></div>
          <div class="info-row"><span class="info-label">状态</span><el-tag size="small" :type="statusTag(dlgAlarm.status)">{{ dlgAlarm.statusLabel }}</el-tag></div>
        </div>

        <!-- 状态流转提示 -->
        <div class="status-flow">{{ statusFlowText }}</div>

        <!-- ---- 已触发 → 开始处理 ---- -->
        <div v-if="dlgAlarm.status === 'triggered'" class="action-area">
          <el-form size="small" label-width="80px">
            <el-form-item label="处理人"><el-input v-model="dlgForm.handler" placeholder="请输入处理人姓名" /></el-form-item>
            <el-form-item label="问题描述"><el-input v-model="dlgForm.remark" type="textarea" :rows="2" placeholder="请描述现场情况和可能原因" /></el-form-item>
            <el-form-item label="问题照片">
              <el-upload action="#" list-type="picture-card" :auto-upload="false" :limit="3"><i class="el-icon-plus" /></el-upload>
            </el-form-item>
          </el-form>
          <div class="action-buttons"><el-button size="small" type="primary" @click="doAction('processing')">开始处理</el-button></div>
        </div>

        <!-- ---- 处理中 → 关闭 ---- -->
        <div v-if="dlgAlarm.status === 'processing'" class="action-area">
          <!-- 上一步的问题描述（只读） -->
          <div v-if="dlgAlarm.problem" class="prev-info">
            <span class="prev-label">📋 已记录的问题描述：</span>
            <span class="prev-text">{{ dlgAlarm.problem }}</span>
          </div>
          <div v-if="dlgAlarm.handler" class="prev-info">
            <span class="prev-label">👤 接手处理人：</span>
            <span class="prev-text">{{ dlgAlarm.handler }}</span>
          </div>
          <div class="prev-info">
            <span class="prev-label">📷 问题照片（已上传 {{ dlgAlarm.beforePhotoCount || 2 }} 张）</span>
          </div>
          <el-divider />
          <el-form size="small" label-width="80px">
            <el-form-item label="处理人"><el-input v-model="dlgForm.handler" :placeholder="dlgAlarm.handler || '处理人'" /></el-form-item>
            <el-form-item label="解决方案"><el-input v-model="dlgForm.measure" type="textarea" :rows="3" placeholder="请描述采取的处理措施和结果" /></el-form-item>
            <el-form-item label="结果照片">
              <el-upload action="#" list-type="picture-card" :auto-upload="false" :limit="3"><i class="el-icon-plus" /></el-upload>
            </el-form-item>
          </el-form>
          <div class="action-buttons"><el-button size="small" type="success" @click="doAction('resolved')">关闭告警</el-button></div>
        </div>

        <!-- ---- 已关闭 → 归档 ---- -->
        <div v-if="dlgAlarm.status === 'resolved'" class="action-area">
          <div class="view-detail">
            <h4 class="vd-title">处理详情</h4>
            <div class="vd-row"><span class="vd-label">处理人</span><span class="vd-value">{{ dlgAlarm.handler || dlgForm.handler || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">问题描述</span><span class="vd-value">{{ dlgAlarm.problem || dlgForm.remark || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">解决方案</span><span class="vd-value">{{ dlgAlarm.solution || dlgForm.measure || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">处理时间</span><span class="vd-value">{{ dlgAlarm.resolveTime || '--' }}</span></div>
            <div class="vd-images">
              <span class="vd-label">问题照片</span>
              <div class="img-placeholder">📷 点击"处理"按钮可上传现场照片</div>
            </div>
            <div class="vd-images">
              <span class="vd-label">结果照片</span>
              <div class="img-placeholder">📷 点击"处理"按钮可上传处理结果照片</div>
            </div>
          </div>
          <div class="action-buttons"><el-button size="small" type="info" @click="doAction('closed')">确认归档</el-button></div>
        </div>

        <!-- ---- 已归档 → 只读查看 ---- -->
        <div v-if="dlgAlarm.status === 'closed'" class="action-area">
          <div class="view-detail">
            <h4 class="vd-title">处理详情</h4>
            <div class="vd-row"><span class="vd-label">处理人</span><span class="vd-value">{{ dlgAlarm.handler || dlgForm.handler || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">问题描述</span><span class="vd-value">{{ dlgAlarm.problem || dlgForm.remark || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">解决方案</span><span class="vd-value">{{ dlgAlarm.solution || dlgForm.measure || '--' }}</span></div>
            <div class="vd-row"><span class="vd-label">处理时间</span><span class="vd-value">{{ dlgAlarm.resolveTime || '--' }}</span></div>
            <div class="vd-images">
              <span class="vd-label">问题照片</span>
              <div class="img-placeholder">📷 问题现场照片（已归档）</div>
            </div>
            <div class="vd-images">
              <span class="vd-label">结果照片</span>
              <div class="img-placeholder">📷 处理完成后照片（已归档）</div>
            </div>
          </div>
          <el-alert title="该告警已完成全部处理流程并归档" type="info" :closable="false" show-icon style="margin-top:12px" />
        </div>

        <!-- 处理记录时间线 -->
        <div class="action-log">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item :timestamp="dlgAlarm.time" type="danger">系统触发告警</el-timeline-item>
            <el-timeline-item v-if="dlgAlarm.status !== 'triggered'" timestamp="--" type="primary">处理人 {{ dlgAlarm.handler || dlgForm.handler || '--' }} 开始处理</el-timeline-item>
            <el-timeline-item v-if="dlgAlarm.status === 'resolved' || dlgAlarm.status === 'closed'" timestamp="--" type="success">处理完成，告警关闭</el-timeline-item>
            <el-timeline-item v-if="dlgAlarm.status === 'closed'" timestamp="--" type="info">归档留存</el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <div slot="footer"><el-button size="small" @click="dlgVisible = false">关闭</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'
import { ALARM_TYPES, ALARM_LEVELS, ALARM_STATUS } from '@/utils/enum'

export default {
  name: 'AlarmMonitorView',
  components: { DataTable, AlarmTag },
  data() {
    return {
      filters: { timeRange: [], alarmType:'', level:'', status:'' },
      currentPage: 1, pageSize: 10,
      alarmTypes: ALARM_TYPES, alarmLevels: ALARM_LEVELS, alarmStatuses: ALARM_STATUS,
      dlgVisible: false, dlgAlarm: null, dlgKey: 0,
      dlgForm: { handler:'', remark:'', measure:'' }
    }
  },
  computed: {
    ...mapState('energy', ['alarms']),
    ...mapGetters('energy', ['alarmStatCards']),
    alarmList() { return this.alarms.list },
    alarmListTotal() { return this.alarms.listTotal },
    statusFlowText() {
      if (!this.dlgAlarm) return ''
      const map = { triggered:'当前状态：已触发 → 下一步：开始处理', processing:'当前状态：处理中 → 下一步：关闭告警', resolved:'当前状态：已关闭 → 下一步：归档留存', closed:'已归档 · 全部流程完成' }
      return map[this.dlgAlarm.status] || ''
    }
  },
  mounted() { this.fetchAlarms({ page:1, size:10 }) },
  methods: {
    ...mapActions('energy', ['fetchAlarms']),
    statusTag(s) { const m = { triggered:'danger', processing:'', resolved:'success', closed:'info' }; return m[s] || '' },
    statusDotClass(s) { if (s==='processing') return 'processing'; if (s==='triggered') return 'pending'; return 'done' },
    handleQuery() { this.currentPage = 1; this.fetchAlarms({ page:1, size:this.pageSize, ...this.filters }) },
    handlePageChange({page,size}) { this.currentPage=page; this.pageSize=size; this.fetchAlarms({page,size,...this.filters}) },
    quickFilter(card) {
      if (card.label==='红色预警') this.filters.level='red'; else if (card.label==='黄色提醒') this.filters.level='yellow'; else if (card.label==='蓝色稳定') this.filters.level='blue'; else this.filters.level=''
      this.handleQuery()
    },
    openDialog(row) {
      this.dlgAlarm = JSON.parse(JSON.stringify(row))
      this.dlgForm = { handler:'', remark:'', measure:'' }
      this.dlgKey++
      this.$nextTick(() => { this.dlgVisible = true })
    },
    doAction(status) {
      const labels = { processing:'处理中', resolved:'已关闭', closed:'已归档' }
      // 直接修改 dlgAlarm 的状态
      if (status === 'processing') {
        this.dlgAlarm.status = 'processing'
        this.dlgAlarm.statusLabel = '处理中'
        if (this.dlgForm.handler) this.dlgAlarm.handler = this.dlgForm.handler
        if (this.dlgForm.remark) this.dlgAlarm.problem = this.dlgForm.remark
      } else if (status === 'resolved') {
        this.dlgAlarm.status = 'resolved'
        this.dlgAlarm.statusLabel = '已关闭'
        if (this.dlgForm.handler) this.dlgAlarm.handler = this.dlgForm.handler
        if (this.dlgForm.measure) this.dlgAlarm.solution = this.dlgForm.measure
      } else if (status === 'closed') {
        this.dlgAlarm.status = 'closed'
        this.dlgAlarm.statusLabel = '已归档'
        this.dlgAlarm.resolveTime = new Date().toLocaleString('zh-CN')
      }
      // 同步更新列表中的对应告警
      const listAlarm = this.alarmList.find(a => a.id === this.dlgAlarm.id)
      if (listAlarm) Object.assign(listAlarm, this.dlgAlarm)
      this.dlgKey++ // 强制弹窗重渲染
      this.$message.success(`告警状态更新：${labels[status]}`)
    },
    resetDlg() { this.dlgAlarm = null; this.dlgForm = { handler:'', remark:'', measure:'' } }
  }
}
</script>

<style lang="scss" scoped>
.alarm-stats-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; }
.alarm-stat-card { background:$background-white; border-radius:$card-radius; padding:$card-padding; box-shadow:$card-shadow; text-align:center; cursor:pointer; transition:all $transition-duration; border-left:3px solid transparent;
  &:hover { box-shadow:0 4px 16px rgba(0,0,0,0.12); }
  .stat-value { font-family:$font-d-din; font-size:$font-size-24; color:$text-primary; line-height:26px; font-weight:400; }
  .stat-label { font-size:$font-size-14; color:$text-secondary; margin-top:8px; }
  &.stat-card--danger { border-left-color:$danger-color; }
  &.stat-card--warning { border-left-color:$warning-color; }
  &.stat-card--success { border-left-color:$success-color; }
  &.stat-card--info { border-left-color:$info-color; }
}
.filter-bar { display:flex;align-items:center;gap:10px;padding:12px $spacing-md;background:$background-white;border-radius:$card-radius;box-shadow:$card-shadow; }
.status-dot { display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:4px; &.processing{background:$primary-color} &.pending{background:$warning-color} &.done{background:$success-color} }
.alarm-flow { padding:0 4px; }
.alarm-info { background:#FAFAFA; border-radius:$radius-md; padding:$spacing-md; }
.info-row { display:flex;align-items:center;gap:12px;margin-bottom:8px; &:last-child{margin-bottom:0} }
.info-label { font-size:13px;color:$text-secondary;min-width:70px; }
.info-value { font-size:$font-size-14;color:$text-primary; }
.status-flow { text-align:center;font-size:13px;color:$primary-color;background:rgba($primary-color,0.06);padding:8px;border-radius:4px;margin:16px 0; }
.action-area { margin:16px 0;padding:$spacing-md;background:#FAFAFA;border-radius:$radius-md; }
.action-buttons { display:flex;gap:8px;margin-top:12px; }
.action-log { margin-top:24px; h4{font-size:$font-size-14;color:$text-primary;margin-bottom:12px;} }
.view-detail { background:#FAFAFA;border-radius:$radius-md;padding:$spacing-md; }
.vd-title { font-size:$font-size-14;color:$text-primary;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid $divider-color; }
.vd-row { display:flex;gap:12px;margin-bottom:10px; &:last-child{margin-bottom:0} }
.vd-label { font-size:13px;color:$text-secondary;min-width:70px;flex-shrink:0; }
.vd-value { font-size:$font-size-14;color:$text-primary;line-height:1.6; }
.prev-info { margin-bottom:8px;padding:8px 12px;background:#fff;border-radius:4px;border:1px solid #e8e8e8; }
.prev-label { font-size:12px;color:$text-secondary; }
.prev-text { font-size:13px;color:$text-primary;display:block;margin-top:2px; }
.vd-images { margin-top:12px; }
.img-placeholder { color:$text-placeholder;font-size:12px;padding:12px;background:#fff;border:1px dashed $border-color-light;border-radius:4px;text-align:center;margin-top:4px; }
.mb-lg { margin-bottom:$spacing-lg; }
::v-deep .el-upload--picture-card { width:80px;height:80px;line-height:86px; }
</style>
