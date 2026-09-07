<template>
  <div class="query-filter">
    <div class="filter-row">
      <OrgCascader v-model="filters.orgIds" @change="emitChange" />

      <el-date-picker
        v-model="filters.timeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        value-format="yyyy-MM-dd"
        style="width: 240px"
        @change="emitChange"
      />

      <EnergyTypeSelector v-model="filters.energyTypes" @change="emitChange" />

      <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">查询</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script>
import OrgCascader from './OrgCascader.vue'
import EnergyTypeSelector from './EnergyTypeSelector.vue'

export default {
  name: 'QueryFilter',
  components: { OrgCascader, EnergyTypeSelector },
  props: {
    value: { type: Object, default: () => ({}) }
  },
  data() {
    const today = new Date()
    const monthAgo = new Date(today.getTime() - 30 * 24 * 3600 * 1000)
    return {
      filters: {
        orgIds: this.value.orgIds || [],
        timeRange: this.value.timeRange || [this.formatDate(monthAgo), this.formatDate(today)],
        energyTypes: this.value.energyTypes || []
      }
    }
  },
  watch: {
    value: {
      deep: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          Object.assign(this.filters, val)
        }
      }
    }
  },
  methods: {
    formatDate(d) {
      return d.toISOString().split('T')[0]
    },
    emitChange() {
      const payload = { ...this.filters }
      this.$emit('input', payload)
      this.$emit('change', payload)
      // 筛选条件变更时自动查询
      this.$emit('query', payload)
    },
    handleQuery() {
      this.$emit('query', { ...this.filters })
    },
    handleReset() {
      const today = new Date()
      const monthAgo = new Date(today.getTime() - 30 * 24 * 3600 * 1000)
      this.filters = {
        orgIds: [],
        timeRange: [this.formatDate(monthAgo), this.formatDate(today)],
        energyTypes: []
      }
      this.emitChange()
      this.$emit('query', { ...this.filters })
    }
  }
}
</script>

<style lang="scss" scoped>
.query-filter {
  background: $background-white;
  border-radius: $card-radius;
  padding: 12px $card-padding;
  box-shadow: $card-shadow;
  margin-bottom: $spacing-md;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
