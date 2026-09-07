<template>
  <div class="energy-analysis">
    <!-- 工具栏 -->
    <div class="view-toolbar">
      <OrgCascader v-model="selectedOrg" />
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="small" value-format="yyyy-MM-dd" style="width:260px" @change="refreshData" />
      <el-select v-model="timeDimension" placeholder="统计维度" size="small" style="width:100px" @change="refreshData">
        <el-option v-for="d in timeDimensions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <el-select v-model="energyCategory" placeholder="能源品类" size="small" style="width:130px" @change="refreshData">
        <el-option v-for="c in energyCategories" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="compareBase" placeholder="对比口径" size="small" style="width:110px" @change="refreshData">
        <el-option v-for="b in compareBases" :key="b.value" :label="b.label" :value="b.value" />
      </el-select>
      <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
    </div>

    <!-- Tab 导航 -->
    <el-tabs v-model="activeTab" type="card" class="analysis-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="分析仪表板" name="dashboard" lazy>
        <Dashboard :org="selectedOrg" :date-range="dateRange" :time-dimension="timeDimension" :energy-category="energyCategory" :compare-base="compareBase" :key="`dashboard-${refreshKey}`" @switch-tab="handleSwitchTab" />
      </el-tab-pane>
      <el-tab-pane label="设备能效诊断" name="device" lazy>
        <DeviceDiagnosis :org="selectedOrg" :date-range="dateRange" :key="`device-${refreshKey}`" />
      </el-tab-pane>
      <el-tab-pane label="成本分析" name="cost" lazy>
        <CostAnalysis :org="selectedOrg" :date-range="dateRange" :key="`cost-${refreshKey}`" />
      </el-tab-pane>
      <el-tab-pane label="异常诊断" name="anomaly" lazy>
        <AnomalyDiagnosis :org="selectedOrg" :date-range="dateRange" :key="`anomaly-${refreshKey}`" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import OrgCascader from './query/components/OrgCascader.vue'
import Dashboard from './analysis/Dashboard.vue'
import DeviceDiagnosis from './analysis/DeviceDiagnosis.vue'
import CostAnalysis from './analysis/CostAnalysis.vue'
import AnomalyDiagnosis from './analysis/AnomalyDiagnosis.vue'

export default {
  name: 'EnergyAnalysis',
  components: { OrgCascader, Dashboard, DeviceDiagnosis, CostAnalysis, AnomalyDiagnosis },
  data() {
    return {
      selectedOrg: [],
      dateRange: ['2026-07-01', '2026-07-31'],
      activeTab: 'dashboard',
      refreshKey: 0,
      timeDimension: 'month',
      energyCategory: 'all',
      compareBase: 'yoy',
      timeDimensions: [
        { label: '日', value: 'day' },
        { label: '月', value: 'month' },
        { label: '季', value: 'quarter' },
        { label: '年', value: 'year' }
      ],
      energyCategories: [
        { label: '全部品类', value: 'all' },
        { label: '固体燃料', value: 'solid_fuel' },
        { label: '液体燃料', value: 'liquid_fuel' },
        { label: '气体燃料', value: 'gas_fuel' },
        { label: '电力', value: 'electricity' },
        { label: '热力', value: 'heat' },
        { label: '其他燃料', value: 'other_fuel' }
      ],
      compareBases: [
        { label: '同比', value: 'yoy' },
        { label: '环比', value: 'mom' },
        { label: '定基', value: 'fixed' }
      ]
    }
  },
  methods: {
    refreshData() {
      // 通过改变子组件 key 强制重挂载，实现真实数据刷新
      this.refreshKey++
      this.$message.success('数据已刷新')
    },
    handleSwitchTab(name) {
      // 供仪表板等子组件跳转（如「查看全部策略」「查看全部异常」）
      if (name === 'strategy') {
        this.$router.push('/energy/strategy')
      } else {
        this.activeTab = name
      }
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
.analysis-tabs {
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
