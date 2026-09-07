<template>
  <div class="collect-settings">
    <p class="section-desc">配置各采集优先级的参数、超时与重试策略。</p>
    <el-table :data="collectItems" border size="small" style="margin-top:12px;width:100%">
      <el-table-column prop="level" label="优先级" width="70" align="center" />
      <el-table-column label="说明" width="140">
        <template slot-scope="{ row }"><el-input v-model="row.desc" size="small" /></template>
      </el-table-column>
      <el-table-column label="采集间隔" width="150">
        <template slot-scope="{ row }">
          <el-input-number v-model="row.interval" :min="5" :max="3600" :step="5" size="small" controls-position="right" style="width:110px" />
          <span style="font-size:11px;color:#999;margin-left:4px">秒</span>
        </template>
      </el-table-column>
      <el-table-column label="超时(秒)" width="130">
        <template slot-scope="{ row }"><el-input-number v-model="row.timeout" :min="5" :max="300" :step="5" size="small" controls-position="right" style="width:100px" /></template>
      </el-table-column>
      <el-table-column label="重试次数" width="110">
        <template slot-scope="{ row }"><el-input-number v-model="row.retry" :min="0" :max="5" size="small" controls-position="right" style="width:80px" /></template>
      </el-table-column>
      <el-table-column label="数据来源" min-width="200">
        <template slot-scope="{ row }"><el-input v-model="row.sources" size="small" /></template>
      </el-table-column>
    </el-table>
    <el-divider />
    <el-form :model="globalConfig" size="small" label-width="140px" style="max-width:500px">
      <el-form-item label="全局缓存天数">
        <el-input-number v-model="globalConfig.cacheDays" :min="7" :max="365" :step="7" size="small" />
        <span class="form-tip">原始采集数据本地保留天数</span>
      </el-form-item>
      <el-form-item label="磁盘告警阈值(GB)">
        <el-input-number v-model="globalConfig.diskAlert" :min="1" :max="500" size="small" />
        <span class="form-tip">剩余空间低于此值触发告警</span>
      </el-form-item>
    </el-form>
    <div class="page-actions">
      <el-button size="small" @click="resetCollectConfig">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveCollectConfig">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectSettings',
  data() {
    return {
      collectItems: [
        { level:'P0', desc:'仪表自动采集', interval:60, timeout:30, retry:3, sources:'智能电表(Modbus/DL/T645)、气体流量计(NB-IoT)、热计量表(4-20mA)' },
        { level:'P1', desc:'系统API对接', interval:300, timeout:60, retry:2, sources:'MES(产量/设备数据)、ERP(采购量/库存)' },
        { level:'P2', desc:'地磅/物位计', interval:600, timeout:90, retry:1, sources:'地磅(煤/液体燃料)、物位计(储罐液位)' },
        { level:'P3', desc:'人工填报', interval:3600, timeout:300, retry:0, sources:'无自动采集的能源、外购瓶装气体、移动源燃料' },
        { level:'P4', desc:'离线实测', interval:7200, timeout:600, retry:0, sources:'碳排放监测(烟气分析)、燃料热值实测' }
      ],
      globalConfig: { cacheDays: 90, diskAlert: 10 },
      defaults: null
    }
  },
  created() { this.defaults = JSON.parse(JSON.stringify({ items: this.collectItems, global: this.globalConfig })) },
  methods: {
    saveCollectConfig() { this.$message.success('采集参数已保存') },
    resetCollectConfig() {
      this.collectItems = JSON.parse(JSON.stringify(this.defaults.items))
      this.globalConfig = JSON.parse(JSON.stringify(this.defaults.global))
      this.$message.info('已恢复默认')
    }
  }
}
</script>

<style lang="scss" scoped>
.collect-settings { padding: $spacing-lg; }
.section-desc { font-size: 13px; color: $text-secondary; margin: 0; }
.form-tip { font-size: 12px; color: $text-placeholder; margin-left: 8px; }
.page-actions { margin-top: 16px; text-align: right; }
</style>
