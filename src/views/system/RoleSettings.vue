<template>
  <div class="role-settings">
    <div class="page-bar">
      <span class="page-desc">管理角色及其对应的模块访问权限。</span>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增角色</el-button>
    </div>
    <el-table :data="roles" border size="small" style="margin-top:12px;width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column label="角色名称" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="角色编码" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.code" size="small" /></template>
      </el-table-column>
      <el-table-column label="描述" min-width="140">
        <template slot-scope="{ row }"><el-input v-model="row.desc" size="small" /></template>
      </el-table-column>
      <el-table-column label="权限" min-width="360">
        <template slot-scope="{ row }">
          <el-checkbox-group v-model="row.permissions" size="small">
            <el-checkbox label="energy_query">能耗查询</el-checkbox>
            <el-checkbox label="energy_intensity">能源强度</el-checkbox>
            <el-checkbox label="energy_analysis">能源分析</el-checkbox>
            <el-checkbox label="energy_benchmark">能效对标</el-checkbox>
            <el-checkbox label="energy_flow">能流分析</el-checkbox>
            <el-checkbox label="energy_balance">能效平衡</el-checkbox>
            <el-checkbox label="energy_budget">用能预算</el-checkbox>
            <el-checkbox label="carbon_accounting">碳排放核算</el-checkbox>
            <el-checkbox label="carbon_footprint">碳足迹</el-checkbox>
            <el-checkbox label="carbon_supply">供应链碳</el-checkbox>
            <el-checkbox label="carbon_asset">碳资产</el-checkbox>
            <el-checkbox label="system_settings">系统设置</el-checkbox>
          </el-checkbox-group>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }">
          <el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="roles.splice($index,1)" />
        </template>
      </el-table-column>
    </el-table>
    <div class="page-actions">
      <el-button size="small" @click="resetRoles">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveRoles">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleSettings',
  data() {
    return {
      roles: [
        { name:'系统管理员', code:'admin', desc:'拥有全部模块的访问和配置权限',
          permissions:['energy_query','energy_intensity','energy_analysis','energy_benchmark','energy_flow','energy_balance','energy_budget','carbon_accounting','carbon_footprint','carbon_supply','carbon_asset','system_settings'] },
        { name:'能源管理员', code:'energy_mgr', desc:'负责能源管理模块的日常运营',
          permissions:['energy_query','energy_intensity','energy_analysis','energy_benchmark','energy_flow','energy_balance','energy_budget'] },
        { name:'碳管理员', code:'carbon_mgr', desc:'负责碳管理模块的核算与报告',
          permissions:['carbon_accounting','carbon_footprint','carbon_supply','carbon_asset'] },
        { name:'设备工程师', code:'engineer', desc:'查看能耗数据，处理告警',
          permissions:['energy_query','energy_intensity','energy_flow'] },
        { name:'只读用户', code:'viewer', desc:'仅查看，无编辑权限',
          permissions:['energy_query','carbon_accounting'] }
      ],
      defaults: null
    }
  },
  created() { this.defaults = JSON.parse(JSON.stringify(this.roles)) },
  methods: {
    handleAdd() { this.roles.push({ name:'',code:'',desc:'',permissions:[] }); this.$message.success('已添加角色，请编辑后保存') },
    saveRoles() { this.defaults = JSON.parse(JSON.stringify(this.roles)); this.$message.success('角色已保存') },
    resetRoles() { this.roles = JSON.parse(JSON.stringify(this.defaults)); this.$message.info('已恢复默认') }
  }
}
</script>

<style lang="scss" scoped>
.role-settings { padding: $spacing-lg; }
.page-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: $text-secondary; }
.page-actions { margin-top: 16px; text-align: right; }
</style>
