<template>
  <div class="target-settings">
    <p class="section-desc">设置各车间的年度能耗强度目标和节能量目标，用于目标考核和能效对标。</p>

    <h4 style="margin-top:20px">强度目标</h4>
    <el-table :data="intensityTargets" border size="small" style="margin-top:8px;width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column label="指标名称" min-width="160">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="目标值" min-width="120" align="center">
        <template slot-scope="{ row }"><el-input-number v-model="row.target" :precision="2" :step="0.01" size="small" controls-position="right" style="width:130px" /></template>
      </el-table-column>
      <el-table-column label="单位" width="100">
        <template slot-scope="{ row }"><el-input v-model="row.unit" size="small" /></template>
      </el-table-column>
      <el-table-column label="当前值" min-width="120" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.current }}</span></template>
      </el-table-column>
      <el-table-column label="完成率" width="90" align="center">
        <template slot-scope="{ row }"><span class="font-d-din">{{ row.progress }}%</span></template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }"><el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="intensityTargets.splice($index,1)" /></template>
      </el-table-column>
    </el-table>
    <el-button size="small" type="primary" icon="el-icon-plus" style="margin-top:8px" @click="addIntensityTarget">新增强度指标</el-button>

    <h4 style="margin-top:24px">各车间年度能耗强度目标</h4>
    <el-table :data="workshopTargets" border size="small" style="margin-top:8px;width:100%">
      <el-table-column type="index" label="#" width="45" align="center" />
      <el-table-column prop="name" label="车间/产线" min-width="160" />
      <el-table-column label="能耗强度目标(tce/万元)" min-width="200" align="center">
        <template slot-scope="{ row }">
          <el-input-number v-model="row.target" :min="0" :precision="2" :step="0.01" size="small" controls-position="right" style="width:160px" />
        </template>
      </el-table-column>
      <el-table-column label="节能量目标(tce)" min-width="180" align="center">
        <template slot-scope="{ row }">
          <el-input-number v-model="row.saving" :min="0" :precision="1" :step="10" size="small" controls-position="right" style="width:140px" />
        </template>
      </el-table-column>
      <el-table-column label="能效等级" width="110" align="center">
        <template slot-scope="{ row }">
          <el-select v-model="row.level" size="small">
            <el-option v-for="i in 3" :key="i" :value="i" :label="i + '级'" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="{ $index }"><el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="workshopTargets.splice($index,1)" /></template>
      </el-table-column>
    </el-table>
    <el-button size="small" type="primary" icon="el-icon-plus" style="margin-top:8px" @click="addWorkshopTarget">新增车间目标</el-button>

    <div class="page-actions">
      <el-button size="small" @click="resetTargets">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveTargets">保存设置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TargetSettings',
  data() {
    return {
      intensityTargets: [
        { name:'单位产值能耗', target:0.40, unit:'tce/万元', current:'0.38', progress:'95' },
        { name:'单位增加值能耗', target:0.60, unit:'tce/万元', current:'0.52', progress:'87' },
        { name:'单位产品能耗', target:200, unit:'kgce/t', current:'156.8', progress:'78' },
        { name:'清洁能源占比', target:40, unit:'%', current:'35.8', progress:'90' }
      ],
      workshopTargets: [
        { name:'一车间A线（粗加工）', target:0.35, saving:120, level:1 },
        { name:'一车间B线（精加工）', target:0.38, saving:90, level:1 },
        { name:'二车间C线（热处理）', target:0.50, saving:60, level:2 },
        { name:'二车间D线（电镀）', target:0.45, saving:50, level:2 },
        { name:'三车间E线（总装）', target:0.40, saving:80, level:1 },
        { name:'公用工程-空压站', target:0.50, saving:40, level:2 },
        { name:'公用工程-制冷站', target:0.55, saving:35, level:3 },
        { name:'公用工程-锅炉房', target:0.60, saving:30, level:3 }
      ],
      defaults: null
    }
  },
  created() {
    this.defaults = JSON.parse(JSON.stringify({
      intensityTargets: this.intensityTargets,
      workshopTargets: this.workshopTargets
    }))
  },
  methods: {
    saveTargets() {
      this.defaults = JSON.parse(JSON.stringify({
        intensityTargets: this.intensityTargets,
        workshopTargets: this.workshopTargets
      }))
      this.$message.success('目标值已保存')
    },
    addIntensityTarget() {
      this.intensityTargets.push({ name:'新指标', target:100, unit:'', current:'--', progress:'0' })
      this.$message.success('已添加强度指标')
    },
    addWorkshopTarget() {
      this.workshopTargets.push({ name:'新车间', target:0.5, saving:50, level:2 })
      this.$message.success('已添加车间目标')
    },
    resetTargets() {
      this.intensityTargets = JSON.parse(JSON.stringify(this.defaults.intensityTargets))
      this.workshopTargets = JSON.parse(JSON.stringify(this.defaults.workshopTargets))
      this.$message.info('已恢复默认')
    }
  }
}
</script>

<style lang="scss" scoped>
.target-settings { padding: $spacing-lg; }
.section-desc { font-size: 13px; color: $text-secondary; margin: 0; }
.page-actions { margin-top: 24px; text-align: right; }
</style>
