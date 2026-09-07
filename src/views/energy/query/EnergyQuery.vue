<template>
  <div class="energy-query-shell">
    <!-- 模块标题和操作栏 -->

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane name="dashboard">
        <span slot="label">
          <i class="el-icon-odometer"></i> 实时看板
        </span>
        <DashboardView ref="dashboard" @drill-down="handleDrillDown" />
      </el-tab-pane>

      <el-tab-pane name="query">
        <span slot="label">
          <i class="el-icon-search"></i> 数据查询
        </span>
        <DataQueryView ref="dataQuery" />
      </el-tab-pane>

      <el-tab-pane name="alarm">
        <span slot="label">
          <i class="el-icon-bell"></i> 异常告警
          <el-badge v-if="alarmCount" :value="alarmCount" :max="99" class="tab-badge" />
        </span>
        <AlarmMonitorView ref="alarmMonitor" />
      </el-tab-pane>

      <el-tab-pane name="report">
        <span slot="label">
          <i class="el-icon-document"></i> 报表导出
        </span>
        <ReportExportView ref="reportExport" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DashboardView from './Dashboard.vue'
import DataQueryView from './DataQuery.vue'
import AlarmMonitorView from './AlarmMonitor.vue'
import ReportExportView from './ReportExport.vue'

export default {
  name: 'EnergyQuery',
  components: { DashboardView, DataQueryView, AlarmMonitorView, ReportExportView },
  data() {
    return {
      activeTab: this.$route.query?.tab || 'dashboard'
    }
  },
  computed: {
    ...mapState('energy', ['alarms']),
    alarmCount() {
      return this.alarms?.stats?.triggered || 0
    }
  },
  mounted() {
    // 初始化基础数据
    this.fetchOrgTree()
    this.fetchAlarms({ page: 1, size: 10 })
  },
  methods: {
    ...mapActions('energy', ['fetchOrgTree', 'fetchAlarms']),
    handleTabClick(tab) {
      // URL 参数同步
      if (this.$route.query?.tab !== tab.name) {
        this.$router.replace({ query: { tab: tab.name } }).catch(() => {})
      }
      // 修复 ECharts 在隐藏 Tab 中初始化为零尺寸的问题
      // 需要两次 nextTick：一次等 Element UI 更新 tab 可见性，一次等浏览器布局完成
      this.$nextTick(() => {
        this.$nextTick(() => {
          window.dispatchEvent(new Event('resize'))
        })
      })
    },
    handleDrillDown(item) {
      // 从看板钻取到数据查询
      this.activeTab = 'query'
      this.$router.replace({ query: { tab: 'query' } }).catch(() => {})
    },
  },
  watch: {
    '$route.query.tab'(val) {
      if (val && val !== this.activeTab) {
        this.activeTab = val
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-query-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

::v-deep .el-tabs--border-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: $card-radius;
  overflow: hidden;
  box-shadow: $card-shadow;

  .el-tabs__content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;

    .el-tab-pane {
      height: 100%;
    }
  }
}

.tab-badge {
  margin-left: 4px;
  vertical-align: top;
}
</style>
