<template>
  <div class="supply-chain-carbon">
    

    <!-- 供应链碳 KPI -->
    <div class="kpi-grid mb-lg">
      <KpiCard label="供应商总数" value="86" unit="家" status="default" :trend="{ value: 5.2, type: 'up' }" />
      <KpiCard label="碳评级A/B级占比" value="68.6" unit="%" status="success" :trend="{ value: 8.3, type: 'up' }" tip="A级+B级供应商占已评级供应商比例" />
      <KpiCard label="供应链总碳排放" value="12860" unit="tCO₂e" status="warning" :trend="{ value: 2.4, type: 'down' }" tip="上游供应商排放总量" />
      <KpiCard label="减排项目数" value="12" unit="个" status="default" :trend="{ value: 3, type: 'up' }" />
      <KpiCard label="年减排量" value="2860" unit="tCO₂e" status="success" :trend="{ value: 15.6, type: 'up' }" />
    </div>

    <!-- 供应商碳排放台账 -->
    <div class="section-card mb-lg">
      <div class="card-header">
        <h3 class="section-title" style="margin-bottom:0;">供应商碳排放台账</h3>
        <div class="card-toolbar">
          <el-input v-model="supplierSearch" placeholder="搜索供应商" prefix-icon="el-icon-search" size="small" clearable style="width:200px" />
          <el-select v-model="supplierLevel" placeholder="碳评级" size="small" clearable style="width:120px">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAddSupplier">新增供应商</el-button>
          <el-button size="small" icon="el-icon-upload2" @click="handleImportSupplier">批量导入</el-button>
        </div>
      </div>
      <DataTable :data="filteredSuppliers" :total="86" :exportable="true" @page-change="handlePageChange" @export="handleExport">
        <el-table-column prop="name" label="供应商名称" min-width="180" align="center" />
        <el-table-column prop="category" label="供应类别" min-width="120" align="center" />
        <el-table-column prop="region" label="地区" min-width="100" align="center" />
        <el-table-column prop="emission" label="碳排放量(tCO₂e)" min-width="140" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column prop="intensity" label="碳强度" min-width="110" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.intensity }}</span></template>
        </el-table-column>
        <el-table-column prop="level" label="碳评级" min-width="90" align="center">
          <template slot-scope="{ row }">
            <span :class="['level-badge', `level--${row.level}`]">{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="排放趋势" min-width="100" align="center">
          <template slot-scope="{ row }">
            <span :class="['trend-indicator', `trend--${row.trendDir}`]">
              <i :class="row.trendDir === 'down' ? 'el-icon-bottom' : 'el-icon-top'"></i>
              {{ row.trend }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastAudit" label="最近审核" min-width="120" align="center" />
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handleViewSupplier(row)">详情</el-button>
            <el-button type="text" size="small" @click="handleEditSupplier(row)">编辑</el-button>
            <el-button type="text" size="small" style="color:$danger-color" @click="handleDeleteSupplier(row)">删除</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </div>

    <!-- 供应商评级仪表盘 -->
    <div class="rating-row mb-lg">
      <div class="section-card">
        <h3 class="section-title">供应商碳评级分布</h3>
        <div class="rating-cards">
          <div v-for="rating in ratingData" :key="rating.level" :class="['rating-card', `rating-card--${rating.level}`]">
            <div class="rating-card__level">{{ rating.level }}</div>
            <div class="rating-card__count font-d-din">{{ rating.count }}</div>
            <div class="rating-card__label">家供应商</div>
            <div class="rating-card__pct font-d-din">{{ rating.pct }}%</div>
            <div class="rating-card__bar">
              <div class="rating-card__fill" :style="{ width: rating.pct + '%' }"></div>
            </div>
            <div class="rating-card__desc">{{ rating.desc }}</div>
          </div>
        </div>
      </div>
      <div class="section-card flex-1">
        <h3 class="section-title">排放类别分布</h3>
        <TrendChart :height="280" :option="categoryChartOption" />
      </div>
    </div>

    <!-- 减排项目跟踪 -->
    <div class="section-card mb-lg">
      <h3 class="section-title">减排项目跟踪</h3>
      <div class="timeline-list">
        <div v-for="project in reductionProjects" :key="project.id" class="timeline-item">
          <div class="timeline-dot" :class="`dot--${project.status}`"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-name">{{ project.name }}</span>
              <span :class="['timeline-status', `status--${project.status}`]">{{ project.statusText }}</span>
            </div>
            <div class="timeline-meta">
              <span><i class="el-icon-office-building"></i> {{ project.supplier }}</span>
              <span><i class="el-icon-date"></i> {{ project.period }}</span>
              <span><i class="el-icon-data-line"></i> 目标减排 <span class="font-d-din">{{ project.target }}</span> tCO₂e</span>
              <span><i class="el-icon-finished"></i> 已完成 <span class="font-d-din">{{ project.achieved }}</span> tCO₂e</span>
            </div>
            <el-progress
              :percentage="project.progress"
              :color="project.progress >= 80 ? '#52C41A' : project.progress >= 50 ? '#1890FF' : '#FAAD14'"
              :stroke-width="8"
              style="margin-top: 8px;"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 绿色采购决策面板 -->
    <div class="section-card">
      <h3 class="section-title">绿色采购决策支持</h3>
      <div class="procurement-grid">
        <div v-for="item in procurementItems" :key="item.id" class="procurement-card">
          <div class="procurement-card__header">
            <span class="procurement-card__name">{{ item.material }}</span>
            <AlarmTag v-if="item.risk" :level="item.risk" :text="item.riskText" />
          </div>
          <div class="procurement-card__compare">
            <div class="supplier-opt" v-for="opt in item.suppliers" :key="opt.name" :class="{ 'opt--recommended': opt.recommended }">
              <div class="opt-header">
                <span class="opt-name">{{ opt.name }}</span>
                <span v-if="opt.recommended" class="opt-rec">推荐</span>
              </div>
              <div class="opt-detail">
                <div class="opt-row">
                  <span>报价</span>
                  <span class="font-d-din">{{ opt.price }}</span>
                </div>
                <div class="opt-row">
                  <span>碳评级</span>
                  <span :class="['level-badge', `level--${opt.level}`]">{{ opt.level }}</span>
                </div>
                <div class="opt-row">
                  <span>碳排放</span>
                  <span class="font-d-din">{{ opt.emission }} tCO₂e</span>
                </div>
                <div class="opt-row">
                  <span>综合评分</span>
                  <span class="font-d-din opt-score">{{ opt.score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑供应商弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="supplierDialogVisible" width="600px">
      <el-form ref="supplierForm" :model="supplierForm" :rules="supplierRules" label-width="120px" size="small">
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="supplierForm.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="供应类别" prop="category">
          <el-select v-model="supplierForm.category" placeholder="请选择" style="width:100%">
            <el-option label="原材料" value="原材料" />
            <el-option label="能源" value="能源" />
            <el-option label="包装" value="包装" />
            <el-option label="物流" value="物流" />
            <el-option label="设备" value="设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-input v-model="supplierForm.region" placeholder="请输入所在地区" />
        </el-form-item>
        <el-form-item label="年排放量" prop="emission">
          <el-input-number v-model="supplierForm.emission" :min="0" :precision="1" :step="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="碳评级" prop="level">
          <el-select v-model="supplierForm.level" placeholder="请选择" style="width:100%">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="supplierDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="handleSaveSupplier">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import TrendChart from '@/components/TrendChart.vue'
import DataTable from '@/components/DataTable.vue'
import AlarmTag from '@/components/AlarmTag.vue'

export default {
  name: 'SupplyChainCarbon',
  components: { KpiCard, TrendChart, DataTable, AlarmTag },
  data() {
    return {
      supplierSearch: '',
      supplierLevel: '',
      dialogTitle: '新增供应商',
      supplierDialogVisible: false,
      supplierForm: { name: '', category: '', region: '', emission: 0, level: '' },
      supplierRules: {
        name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择供应类别', trigger: 'change' }],
        level: [{ required: true, message: '请选择碳评级', trigger: 'change' }]
      },
      supplierData: [
        { name: '华新石灰石矿业', category: '原材料', region: '浙江金华', emission: '2,860.0', intensity: '0.032', level: 'A', trend: '5.2', trendDir: 'down', lastAudit: '2026-04-15' },
        { name: '中石化金华分公司', category: '能源', region: '浙江金华', emission: '3,150.0', intensity: '0.068', level: 'B', trend: '2.1', trendDir: 'down', lastAudit: '2026-03-20' },
        { name: '浙能电力集团', category: '能源', region: '浙江杭州', emission: '2,450.0', intensity: '0.045', level: 'A', trend: '8.6', trendDir: 'down', lastAudit: '2026-04-28' },
        { name: '永丰包装材料厂', category: '包装', region: '浙江义乌', emission: '860.0', intensity: '0.018', level: 'B', trend: '1.5', trendDir: 'up', lastAudit: '2026-02-10' },
        { name: '顺达物流有限公司', category: '物流', region: '浙江金华', emission: '1,520.0', intensity: '0.025', level: 'C', trend: '3.8', trendDir: 'up', lastAudit: '2025-12-05' },
        { name: '金泰石膏粉厂', category: '原材料', region: '安徽合肥', emission: '680.0', intensity: '0.022', level: 'B', trend: '4.1', trendDir: 'down', lastAudit: '2026-01-18' },
        { name: '恒达耐火材料公司', category: '设备', region: '河南郑州', emission: '520.0', intensity: '0.015', level: 'C', trend: '0.8', trendDir: 'up', lastAudit: '2025-11-20' },
        { name: '绿源生物质能源', category: '能源', region: '浙江衢州', emission: '380.0', intensity: '0.008', level: 'A', trend: '12.5', trendDir: 'down', lastAudit: '2026-05-02' },
        { name: '长江矿渣微粉公司', category: '原材料', region: '江苏南京', emission: '450.0', intensity: '0.012', level: 'D', trend: '6.2', trendDir: 'up', lastAudit: '2025-09-15' },
        { name: '中远海运物流', category: '物流', region: '上海', emission: '1,050.0', intensity: '0.038', level: 'A', trend: '9.3', trendDir: 'down', lastAudit: '2026-04-05' }
      ],
      ratingData: [
        { level: 'A', count: 22, pct: 25.6, desc: '低碳优秀供应商', color: '#52C41A' },
        { level: 'B', count: 37, pct: 43.0, desc: '达标供应商', color: '#1890FF' },
        { level: 'C', count: 18, pct: 20.9, desc: '需改进供应商', color: '#FAAD14' },
        { level: 'D', count: 9, pct: 10.5, desc: '高风险供应商', color: '#FF4D4F' }
      ],
      reductionProjects: [
        { id: 1, name: '石灰石矿山电动运输改造', supplier: '华新石灰石矿业', period: '2025.09 - 2026.06', target: 520, achieved: 436, progress: 84, status: 'active', statusText: '进行中' },
        { id: 2, name: '绿色电力直购协议', supplier: '浙能电力集团', period: '2026.01 - 2026.12', target: 1200, achieved: 480, progress: 40, status: 'active', statusText: '进行中' },
        { id: 3, name: '包装材料循环利用', supplier: '永丰包装材料厂', period: '2026.03 - 2026.09', target: 280, achieved: 168, progress: 60, status: 'active', statusText: '进行中' },
        { id: 4, name: '新能源车队替换', supplier: '顺达物流有限公司', period: '2026.02 - 2026.08', target: 380, achieved: 152, progress: 40, status: 'delayed', statusText: '延期' },
        { id: 5, name: '光伏分布式并网', supplier: '绿源生物质能源', period: '2025.06 - 2026.03', target: 650, achieved: 650, progress: 100, status: 'done', statusText: '已完成' },
        { id: 6, name: '窑炉余热回收利用', supplier: '金泰石膏粉厂', period: '2026.04 - 2026.12', target: 320, achieved: 64, progress: 20, status: 'active', statusText: '进行中' }
      ],
      procurementItems: [
        {
          id: 1,
          material: '石灰石采购',
          risk: null,
          riskText: '',
          suppliers: [
            { name: '华新石灰石矿业', price: '¥68/t', level: 'A', emission: '286', score: '92.5', recommended: true },
            { name: '金山矿业集团', price: '¥62/t', level: 'B', emission: '380', score: '85.0', recommended: false },
            { name: '大地石料厂', price: '¥58/t', level: 'D', emission: '520', score: '62.3', recommended: false }
          ]
        },
        {
          id: 2,
          material: '包装袋采购',
          risk: 'yellow',
          riskText: '供应集中风险',
          suppliers: [
            { name: '永丰包装材料厂', price: '¥1.2/个', level: 'B', emission: '86', score: '88.0', recommended: true },
            { name: '绿包装科技', price: '¥1.5/个', level: 'A', emission: '52', score: '90.5', recommended: false }
          ]
        }
      ]
    }
  },
  computed: {
    filteredSuppliers() {
      let data = this.supplierData
      if (this.supplierSearch) {
        data = data.filter(s => s.name.includes(this.supplierSearch))
      }
      if (this.supplierLevel) {
        data = data.filter(s => s.level === this.supplierLevel)
      }
      return data
    },
    categoryChartOption() {
      const categories = ['原材料', '能源', '包装', '物流', '设备']
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { top: 20, right: 20, bottom: 30, left: 80 },
        xAxis: { type: 'value', name: 'tCO₂e' },
        yAxis: { type: 'category', data: categories },
        series: [{
          type: 'bar',
          data: [
            { value: 3990, itemStyle: { color: '#1890FF' } },
            { value: 5980, itemStyle: { color: '#FF6B6B' } },
            { value: 860, itemStyle: { color: '#4ECDC4' } },
            { value: 2570, itemStyle: { color: '#FAAD14' } },
            { value: 520, itemStyle: { color: '#722ED1' } }
          ],
          barWidth: 20,
          label: { show: true, position: 'right', formatter: '{c}', fontSize: 11, fontFamily: 'D-DIN' }
        }]
      }
    }
  },
  methods: {
    handleAddSupplier() {
      this.dialogTitle = '新增供应商'
      this.supplierForm = { name: '', category: '', region: '', emission: 0, level: '' }
      this.supplierDialogVisible = true
    },
    handleEditSupplier(row) {
      this.dialogTitle = '编辑供应商'
      this.supplierForm = { name: row.name, category: row.category, region: row.region, emission: parseFloat(row.emission.replace(/,/g, '')), level: row.level }
      this.supplierDialogVisible = true
    },
    handleDeleteSupplier(row) {
      this.$confirm(`确认删除供应商"${row.name}"？`, '提示', { type: 'warning' }).then(() => {
        const idx = this.supplierData.findIndex(s => s.name === row.name)
        if (idx > -1) this.supplierData.splice(idx, 1)
        this.$message.success('已删除')
      }).catch(() => {})
    },
    handleViewSupplier(row) {
      this.$message.info(`查看供应商详情：${row.name}`)
    },
    handleSaveSupplier() {
      this.$refs.supplierForm.validate(valid => {
        if (valid) {
          this.$message.success('供应商信息已保存')
          this.supplierDialogVisible = false
        }
      })
    },
    handleImportSupplier() {
      this.$message.info('请上传供应商数据文件')
    },
    handlePageChange() {},
    handleExport() {}
  }
}
</script>

<style lang="scss" scoped>
.section-card {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.section-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.card-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 2px;
  font-size: $font-size-12;
  font-family: $font-d-din;
  font-weight: 600;

  &.level--A { color: $success-color; background: rgba($success-color, 0.1); }
  &.level--B { color: $primary-color; background: rgba($primary-color, 0.1); }
  &.level--C { color: $warning-color; background: rgba($warning-color, 0.1); }
  &.level--D { color: $danger-color; background: rgba($danger-color, 0.1); }
}

.trend-indicator {
  font-size: $font-size-12;
  font-family: $font-d-din;
  display: inline-flex;
  align-items: center;
  gap: 2px;

  &.trend--down { color: $success-color; }
  &.trend--up { color: $danger-color; }
}

.rating-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gutter;
}

.rating-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gutter;
}

.rating-card {
  padding: $spacing-md;
  border-radius: $radius-md;
  text-align: center;

  &--A { background: rgba($success-color, 0.06); border: 1px solid rgba($success-color, 0.2); }
  &--B { background: rgba($primary-color, 0.06); border: 1px solid rgba($primary-color, 0.2); }
  &--C { background: rgba($warning-color, 0.06); border: 1px solid rgba($warning-color, 0.2); }
  &--D { background: rgba($danger-color, 0.06); border: 1px solid rgba($danger-color, 0.2); }

  &__level {
    font-size: $font-size-24;
    font-weight: 700;
    margin-bottom: 4px;

    .rating-card--A & { color: $success-color; }
    .rating-card--B & { color: $primary-color; }
    .rating-card--C & { color: $warning-color; }
    .rating-card--D & { color: $danger-color; }
  }

  &__count {
    font-size: $font-size-20;
    color: $text-primary;
  }

  &__label {
    font-size: $font-size-12;
    color: $text-placeholder;
  }

  &__pct {
    font-size: $font-size-14;
    color: $text-secondary;
    margin-top: 8px;
  }

  &__bar {
    height: 4px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 2px;
    transition: width $transition-duration;

    .rating-card--A & { background: $success-color; }
    .rating-card--B & { background: $primary-color; }
    .rating-card--C & { background: $warning-color; }
    .rating-card--D & { background: $danger-color; }
  }

  &__desc {
    font-size: $font-size-10;
    color: $text-placeholder;
    margin-top: 6px;
  }
}

.timeline-list {
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: $divider-color;
  }
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;

  &:last-child { padding-bottom: 0; }
}

.timeline-dot {
  position: absolute;
  left: -21px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid;

  &.dot--active { background: $primary-color; border-color: $primary-color; }
  &.dot--done { background: $success-color; border-color: $success-color; }
  &.dot--delayed { background: $warning-color; border-color: $warning-color; }
}

.timeline-content {
  background: #FAFAFA;
  border-radius: $radius-md;
  padding: $spacing-md;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timeline-name {
  font-size: $font-size-14;
  color: $text-primary;
  font-weight: 600;
}

.timeline-status {
  font-size: $font-size-12;
  padding: 2px 8px;
  border-radius: 2px;

  &.status--active { color: $primary-color; background: rgba($primary-color, 0.1); }
  &.status--done { color: $success-color; background: rgba($success-color, 0.1); }
  &.status--delayed { color: $warning-color; background: rgba($warning-color, 0.1); }
}

.timeline-meta {
  display: flex;
  gap: 16px;
  font-size: $font-size-12;
  color: $text-secondary;

  i { margin-right: 4px; }
}

.procurement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $gutter;
}

.procurement-card {
  background: #FAFAFA;
  border-radius: $radius-md;
  padding: $spacing-md;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__name {
    font-size: $font-size-16;
    color: $text-primary;
    font-weight: 600;
  }

  &__compare {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
}

.supplier-opt {
  background: $background-white;
  border-radius: $radius-md;
  padding: $spacing-md;
  border: 1px solid $divider-color;
  transition: all $transition-duration;

  &--recommended {
    border-color: $primary-color;
    box-shadow: 0 0 0 1px rgba($primary-color, 0.1);
  }

  .opt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .opt-name {
    font-size: $font-size-14;
    color: $text-primary;
    font-weight: 600;
  }

  .opt-rec {
    font-size: $font-size-10;
    color: $background-white;
    background: $primary-color;
    padding: 1px 6px;
    border-radius: 2px;
  }

  .opt-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .opt-row {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-12;
    color: $text-secondary;
  }

  .opt-score {
    color: $primary-color;
    font-weight: 600;
  }
}
</style>
