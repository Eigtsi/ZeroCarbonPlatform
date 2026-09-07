<template>
  <div class="user-settings">
    <div class="page-bar">
      <span class="page-desc">管理系统用户账号、角色分配和状态。</span>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增用户</el-button>
    </div>
    <el-table :data="users" border size="small" style="margin-top:12px;width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column label="用户名" min-width="100">
        <template slot-scope="{ row }"><el-input v-model="row.username" size="small" /></template>
      </el-table-column>
      <el-table-column label="姓名" min-width="80">
        <template slot-scope="{ row }"><el-input v-model="row.realName" size="small" /></template>
      </el-table-column>
      <el-table-column label="角色" min-width="120">
        <template slot-scope="{ row }">
          <el-select v-model="row.role" size="small">
            <el-option value="admin" label="系统管理员" />
            <el-option value="energy_mgr" label="能源管理员" />
            <el-option value="carbon_mgr" label="碳管理员" />
            <el-option value="engineer" label="设备工程师" />
            <el-option value="viewer" label="只读用户" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.phone" size="small" /></template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="140">
        <template slot-scope="{ row }"><el-input v-model="row.email" size="small" /></template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="{ row }">
          <el-switch v-model="row.enabled" size="small" active-text="" inactive-text="" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }">
          <el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="users.splice($index,1)" />
        </template>
      </el-table-column>
    </el-table>
    <div class="page-actions">
      <el-button size="small" @click="resetUsers">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveUsers">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserSettings',
  data() {
    return {
      users: [
        { username:'admin', realName:'系统管理员', role:'admin', phone:'138****0001', email:'admin@company.com', enabled:true },
        { username:'zhang', realName:'张工', role:'energy_mgr', phone:'138****6789', email:'zhang@company.com', enabled:true },
        { username:'li', realName:'李工', role:'engineer', phone:'139****8901', email:'li@company.com', enabled:true },
        { username:'wang', realName:'王工', role:'viewer', phone:'137****4567', email:'wang@company.com', enabled:true }
      ],
      defaults: null
    }
  },
  created() { this.defaults = JSON.parse(JSON.stringify(this.users)) },
  methods: {
    handleAdd() { this.users.push({ username:'',realName:'',role:'viewer',phone:'',email:'',enabled:true }); this.$message.success('已添加用户，请编辑后保存') },
    saveUsers() { this.defaults = JSON.parse(JSON.stringify(this.users)); this.$message.success('用户已保存') },
    resetUsers() { this.users = JSON.parse(JSON.stringify(this.defaults)); this.$message.info('已恢复默认') }
  }
}
</script>

<style lang="scss" scoped>
.user-settings { padding: $spacing-lg; }
.page-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: $text-secondary; }
.page-actions { margin-top: 16px; text-align: right; }
</style>
