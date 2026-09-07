<template>
  <div class="notify-settings">
    <p class="section-desc">配置告警通知渠道、接收人和通知规则。</p>

    <h4 style="margin-top:20px">通知渠道</h4>
    <el-form :model="notifyConfig" size="small" label-width="110px">
      <el-form-item label="站内通知">
        <el-switch v-model="notifyConfig.inApp" />
        <span class="form-tip">铃铛角标 + 站内消息</span>
      </el-form-item>
      <el-form-item label="邮件通知">
        <el-switch v-model="notifyConfig.email" />
        <el-input v-if="notifyConfig.email" v-model="notifyConfig.emailAddr" size="small" style="width:200px;margin-left:8px" />
      </el-form-item>
      <el-form-item label="短信通知">
        <el-switch v-model="notifyConfig.sms" />
        <span class="form-tip">仅红色预警</span>
      </el-form-item>
      <el-form-item label="企业微信">
        <el-switch v-model="notifyConfig.wecom" />
        <el-input v-if="notifyConfig.wecom" v-model="notifyConfig.wecomHook" size="small" style="width:240px;margin-left:8px" />
      </el-form-item>
    </el-form>

    <h4 style="margin-top:24px">接收人配置</h4>
    <el-button size="small" type="primary" icon="el-icon-plus" style="margin-bottom:8px" @click="receivers.push({name:'',phone:'',email:'',level:'all'})">新增接收人</el-button>
    <el-table :data="receivers" border size="small" style="width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column label="姓名" min-width="80">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="手机号" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.phone" size="small" /></template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="150">
        <template slot-scope="{ row }"><el-input v-model="row.email" size="small" /></template>
      </el-table-column>
      <el-table-column label="通知级别" min-width="120" align="center">
        <template slot-scope="{ row }">
          <el-select v-model="row.level" size="small">
            <el-option value="all" label="全部" />
            <el-option value="red" label="仅红色" />
            <el-option value="red_yellow" label="红+黄" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }">
          <el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="receivers.splice($index,1)" />
        </template>
      </el-table-column>
    </el-table>

    <div class="page-actions">
      <el-button size="small" @click="resetNotifyConfig">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveNotifyConfig">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotifySettings',
  data() {
    return {
      notifyConfig: { inApp: true, email: true, emailAddr: 'energy-alert@company.com', sms: false, wecom: false, wecomHook: '' },
      receivers: [
        { name:'张工', phone:'138****6789', email:'zhang@company.com', level:'all' },
        { name:'李工', phone:'139****8901', email:'li@company.com', level:'red_yellow' }
      ],
      defaults: null
    }
  },
  created() { this.defaults = JSON.parse(JSON.stringify({ config: this.notifyConfig, receivers: this.receivers })) },
  methods: {
    saveNotifyConfig() { this.$message.success('通知配置已保存') },
    resetNotifyConfig() {
      this.notifyConfig = JSON.parse(JSON.stringify(this.defaults.config))
      this.receivers = JSON.parse(JSON.stringify(this.defaults.receivers))
      this.$message.info('已恢复默认')
    }
  }
}
</script>

<style lang="scss" scoped>
.notify-settings { padding: $spacing-lg; }
.section-desc { font-size: 13px; color: $text-secondary; margin: 0 0 8px; }
.form-tip { font-size: 12px; color: $text-placeholder; margin-left: 8px; }
.page-actions { margin-top: 24px; text-align: right; }
</style>
