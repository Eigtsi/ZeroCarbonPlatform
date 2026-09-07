<template>
  <div class="factor-settings">
    <div class="page-bar">
      <span class="page-desc">管理各能源品种的标准煤折算系数（参考 GB/T 2589），用于 tce 计算。</span>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增能源品种</el-button>
    </div>
    <el-table :data="coalFactors" border size="small" style="margin-top:12px;width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column label="能源品类" min-width="90">
        <template slot-scope="{ row }"><el-input v-model="row.category" size="small" /></template>
      </el-table-column>
      <el-table-column label="能源品种" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="单位" min-width="80" align="center">
        <template slot-scope="{ row }"><el-input v-model="row.unit" size="small" /></template>
      </el-table-column>
      <el-table-column label="折标系数" min-width="160" align="center">
        <template slot-scope="{ row }">
          <el-input-number v-model="row.factor" :precision="4" :step="0.01" size="small" controls-position="right" style="width:140px" />
        </template>
      </el-table-column>
      <el-table-column label="数据来源" min-width="120">
        <template slot-scope="{ row }"><el-input v-model="row.source" size="small" /></template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }"><el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="handleDelete($index)" /></template>
      </el-table-column>
    </el-table>
    <div class="page-actions">
      <el-button size="small" @click="resetCoalFactors">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveCoalFactors">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FactorSettings',
  data() {
    return {
      coalFactors: [
        { category:'固体燃料',name:'原煤',unit:'t',factor:0.7143,source:'GB/T 2589' },
        { category:'固体燃料',name:'洗精煤',unit:'t',factor:0.9000,source:'GB/T 2589' },
        { category:'固体燃料',name:'焦炭',unit:'t',factor:0.9714,source:'GB/T 2589' },
        { category:'液体燃料',name:'柴油',unit:'t',factor:1.4571,source:'GB/T 2589' },
        { category:'液体燃料',name:'汽油',unit:'t',factor:1.4714,source:'GB/T 2589' },
        { category:'液体燃料',name:'燃料油',unit:'t',factor:1.4286,source:'GB/T 2589' },
        { category:'气体燃料',name:'天然气',unit:'万m³',factor:12.143,source:'GB/T 2589' },
        { category:'气体燃料',name:'焦炉煤气',unit:'万m³',factor:5.714,source:'GB/T 2589' },
        { category:'电力',name:'外购电力',unit:'万kWh',factor:1.229,source:'GB/T 2589(当量值)' },
        { category:'热力',name:'低压蒸汽',unit:'t',factor:0.090,source:'焓值计算' },
        { category:'热力',name:'高压蒸汽',unit:'t',factor:0.1286,source:'焓值计算' },
        { category:'其他燃料',name:'甲醇',unit:'t',factor:0.7714,source:'GB/T 2589' }
      ],
      coalDefaults: null
    }
  },
  created() { this.coalDefaults = JSON.parse(JSON.stringify(this.coalFactors)) },
  methods: {
    handleAdd() {
      this.coalFactors.push({ category:'',name:'新能源品种',unit:'',factor:0.5,source:'' })
      this.$message.success('已添加新能源品种，请编辑后保存')
    },
    handleDelete(idx) { this.coalFactors.splice(idx, 1); this.$message.success('已删除') },
    saveCoalFactors() { this.coalDefaults = JSON.parse(JSON.stringify(this.coalFactors)); this.$message.success('折标系数已保存') },
    resetCoalFactors() { this.coalFactors = JSON.parse(JSON.stringify(this.coalDefaults)); this.$message.info('已恢复默认') }
  }
}
</script>

<style lang="scss" scoped>
.factor-settings { padding: $spacing-lg; }
.page-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: $text-secondary; }
.page-actions { margin-top: 16px; text-align: right; }
</style>
