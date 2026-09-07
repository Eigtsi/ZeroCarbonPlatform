<template>
  <div class="energy-strategy">
    <!-- 工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="refreshData" />
      <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- Tab 导航 -->
    <el-tabs v-model="activeTab" type="card" class="strategy-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="策略推荐" name="strategy" lazy>
        <StrategyCenter :org="selectedOrg" :date-range="dateRange" :key="`strategy-${refreshKey}`" />
      </el-tab-pane>
      <el-tab-pane label="节能项目管理" name="project" lazy>
        <ProjectManage :org="selectedOrg" :date-range="dateRange" :key="`project-${refreshKey}`" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import OrgCascader from './query/components/OrgCascader.vue'
import StrategyCenter from './analysis/StrategyCenter.vue'
import ProjectManage from './analysis/ProjectManage.vue'

export default {
  name: 'EnergyStrategy',
  components: { OrgCascader, StrategyCenter, ProjectManage },
  data() {
    return {
      selectedOrg: [],
      dateRange: ['2026-07-01', '2026-07-31'],
      activeTab: 'strategy',
      refreshKey: 0
    }
  },
  methods: {
    refreshData() {
      // 通过改变子组件 key 强制重挂载，实现真实数据刷新
      this.refreshKey++
      this.$message.success('数据已刷新')
    },
    handleTabClick(tab) {
      // Tab 切换时可触发埋点或数据预加载
    }
  }
}
</script>

<style lang="scss" scoped>
.view-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: $spacing-md;
  padding: 10px $spacing-md;
  background: $background-white;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
}
.strategy-tabs {
  margin-top: $spacing-md;

  ::v-deep .el-tabs__header {
    margin-bottom: $spacing-md;
  }

  ::v-deep .el-tabs__nav {
    border-radius: $radius-md $radius-md 0 0;
  }

  ::v-deep .el-tabs__item {
    font-size: $font-size-14;
    font-family: $font-title;
    height: 40px;
    line-height: 40px;
  }
}
</style>