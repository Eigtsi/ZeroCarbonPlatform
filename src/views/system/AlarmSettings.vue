<template>
  <div class="alarm-settings">
    <div class="page-bar">
      <span class="page-desc">每种告警类型可设置红色/黄色/蓝色三级阈值，不同等级独立配置。</span>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增告警规则</el-button>
    </div>
    <el-table :data="alarmThresholds" border size="small" style="margin-top:12px;width:100%">
      <el-table-column type="index" label="#" width="40" align="center" />
      <el-table-column label="告警名称" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="检测规则描述" min-width="200">
        <template slot-scope="{ row }"><el-input v-model="row.desc" size="small" /></template>
      </el-table-column>
      <el-table-column label="单位" min-width="80">
        <template slot-scope="{ row }"><el-input v-model="row.unit" size="small" /></template>
      </el-table-column>
      <el-table-column label="🔴 红色阈值" min-width="130" align="center">
        <template slot-scope="{ row }">
          <el-input v-model="row.redThreshold" size="small" style="width:90px"><template slot="append">{{ row.unit || '-' }}</template></el-input>
        </template>
      </el-table-column>
      <el-table-column label="🟡 黄色阈值" min-width="130" align="center">
        <template slot-scope="{ row }">
          <el-input v-model="row.yellowThreshold" size="small" style="width:90px"><template slot="append">{{ row.unit || '-' }}</template></el-input>
        </template>
      </el-table-column>
      <el-table-column label="🔵 蓝色阈值" min-width="130" align="center">
        <template slot-scope="{ row }">
          <el-input v-model="row.blueThreshold" size="small" style="width:90px"><template slot="append">{{ row.unit || '-' }}</template></el-input>
        </template>
      </el-table-column>
      <el-table-column label="启用" width="55" align="center">
        <template slot-scope="{ row }"><el-switch v-model="row.enabled" size="small" /></template>
      </el-table-column>
      <el-table-column label="操作" width="50" align="center">
        <template slot-scope="{ $index }"><el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="handleDelete($index)" /></template>
      </el-table-column>
    </el-table>
    <!-- 新增告警对话框 -->
    <el-dialog :visible.sync="addDialogVisible" title="新增告警规则" width="520px" append-to-body>
      <el-form :model="newAlarm" size="small" label-width="100px">
        <el-form-item label="告警模板">
          <el-select v-model="selectedTemplate" placeholder="选择预置模板或自定义" style="width:100%" @change="applyTemplate">
            <el-option value="custom" label="自定义告警" />
            <el-option-group label="用量异常">
              <el-option value="surge" label="能耗突增（σ检测）" />
              <el-option value="quota" label="能耗超标（限额检测）" />
              <el-option value="standby" label="待机空耗（时段检测）" />
            </el-option-group>
            <el-option-group label="采集异常">
              <el-option value="offline" label="仪表失联（心跳检测）" />
              <el-option value="quality" label="数据质量（范围检测）" />
            </el-option-group>
            <el-option-group label="设备异常">
              <el-option value="power" label="功率因数异常" />
              <el-option value="process" label="工艺参数异常" />
              <el-option value="temp" label="温度/压力异常" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="告警名称" required>
          <el-input v-model="newAlarm.name" placeholder="如：锅炉排烟温度异常" />
        </el-form-item>
        <el-form-item label="检测规则">
          <el-input v-model="newAlarm.desc" type="textarea" :rows="2" placeholder="请描述检测条件和触发逻辑" />
        </el-form-item>
        <el-form-item label="参数单位">
          <el-input v-model="newAlarm.unit" placeholder="σ / % / 分钟 / ℃ / MPa" style="width:160px" />
        </el-form-item>
        <el-divider>三级阈值设置</el-divider>
        <el-form-item label="🔴 红色预警">
          <el-input v-model="newAlarm.redThreshold" style="width:140px" placeholder="最高级别阈值" />
          <span class="form-tip">超过此值立即通知</span>
        </el-form-item>
        <el-form-item label="🟡 黄色提醒">
          <el-input v-model="newAlarm.yellowThreshold" style="width:140px" placeholder="中间级别阈值" />
          <span class="form-tip">超过此值关注处理</span>
        </el-form-item>
        <el-form-item label="🔵 蓝色稳定">
          <el-input v-model="newAlarm.blueThreshold" style="width:140px" placeholder="最低级别阈值" />
          <span class="form-tip">超过此值记录观察</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="addDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="confirmAdd">确认添加</el-button>
      </div>
    </el-dialog>

    <div class="page-actions">
      <el-button size="small" @click="resetAlarmThresholds">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveAlarmThresholds">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlarmSettings',
  data() {
    return {
      alarmThresholds: [
        { key:'surge',name:'能耗突增',desc:'当前值 > 历史同期均值 + N倍标准差',unit:'σ',redThreshold:'3.0',yellowThreshold:'2.0',blueThreshold:'1.0',enabled:true },
        { key:'quota_exceed',name:'能耗超标',desc:'月累计能耗 > 月限额 × N%',unit:'%',redThreshold:'110',yellowThreshold:'100',blueThreshold:'90',enabled:true },
        { key:'meter_offline',name:'仪表失联',desc:'数据采集中断 > N 分钟',unit:'分钟',redThreshold:'30',yellowThreshold:'15',blueThreshold:'5',enabled:true },
        { key:'standby_waste',name:'待机空耗',desc:'非工作时间设备持续运行 > N 小时',unit:'小时',redThreshold:'4',yellowThreshold:'2',blueThreshold:'1',enabled:true },
        { key:'power_factor',name:'功率因数异常',desc:'功率因数 < N',unit:'',redThreshold:'0.85',yellowThreshold:'0.90',blueThreshold:'0.92',enabled:true },
        { key:'process_anomaly',name:'工艺参数异常',desc:'参数偏离均值 > N 倍标准差',unit:'σ',redThreshold:'3.0',yellowThreshold:'2.5',blueThreshold:'2.0',enabled:true }
      ],
      alarmDefaults: null,
      nextId: 7,
      addDialogVisible: false,
      selectedTemplate: '',
      newAlarm: { name:'',desc:'',unit:'',redThreshold:'',yellowThreshold:'',blueThreshold:'' }
    }
  },
  created() { this.alarmDefaults = JSON.parse(JSON.stringify(this.alarmThresholds)) },
  methods: {
    handleAdd() {
      this.selectedTemplate = ''
      this.newAlarm = { name:'',desc:'',unit:'',redThreshold:'',yellowThreshold:'',blueThreshold:'' }
      this.addDialogVisible = true
    },
    applyTemplate(key) {
      const templates = {
        surge: { name:'能耗突增',desc:'监测值超出历史同期均值N倍标准差',unit:'σ',red:'3.0',yellow:'2.0',blue:'1.0' },
        quota: { name:'能耗超标',desc:'月累计能耗超出月度限额百分比',unit:'%',red:'110',yellow:'100',blue:'90' },
        standby: { name:'待机空耗',desc:'非工作时间设备持续运行超过N小时',unit:'小时',red:'4',yellow:'2',blue:'1' },
        offline: { name:'仪表失联',desc:'数据采集中断超过N分钟',unit:'分钟',red:'30',yellow:'15',blue:'5' },
        quality: { name:'数据质量异常',desc:'采集值超出合理范围[N_min, N_max]',unit:'%',red:'200',yellow:'150',blue:'120' },
        power: { name:'功率因数异常',desc:'功率因数低于N',unit:'',red:'0.85',yellow:'0.90',blue:'0.92' },
        process: { name:'工艺参数异常',desc:'参数偏离均值N倍标准差',unit:'σ',red:'3.0',yellow:'2.5',blue:'2.0' },
        temp: { name:'温度/压力异常',desc:'监测值超出设定范围 ±N',unit:'%',red:'15',yellow:'10',blue:'5' }
      }
      const t = templates[key]
      if (t) {
        this.newAlarm = { name:t.name,desc:t.desc,unit:t.unit,redThreshold:t.red,yellowThreshold:t.yellow,blueThreshold:t.blue }
      }
    },
    confirmAdd() {
      if (!this.newAlarm.name.trim()) { this.$message.warning('请输入告警名称'); return }
      this.alarmThresholds.push({
        key: `custom_${this.nextId++}`,
        name: this.newAlarm.name.trim(),
        desc: this.newAlarm.desc.trim(),
        unit: this.newAlarm.unit.trim(),
        redThreshold: this.newAlarm.redThreshold,
        yellowThreshold: this.newAlarm.yellowThreshold,
        blueThreshold: this.newAlarm.blueThreshold,
        enabled: true
      })
      this.addDialogVisible = false
      this.$message.success('已添加告警规则')
    },
    handleDelete(idx) { this.alarmThresholds.splice(idx, 1); this.$message.success('已删除') },
    saveAlarmThresholds() { this.alarmDefaults = JSON.parse(JSON.stringify(this.alarmThresholds)); this.$message.success('已保存') },
    resetAlarmThresholds() { this.alarmThresholds = JSON.parse(JSON.stringify(this.alarmDefaults)); this.$message.info('已恢复默认') }
  }
}
</script>

<style lang="scss" scoped>
.alarm-settings { padding: $spacing-lg; }
.page-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: $text-secondary; }
.form-tip { font-size: 12px; color: $text-placeholder; margin-left: 8px; }
.page-actions { margin-top: 16px; text-align: right; }
</style>
