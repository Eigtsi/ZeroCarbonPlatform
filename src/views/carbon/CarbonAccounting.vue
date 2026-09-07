<template>
  <div class="carbon-accounting">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="selectedYear" size="small" style="width:110px">
          <el-option v-for="y in yearOptions" :key="y" :label="y + '年'" :value="y" />
        </el-select>
        <el-select v-model="selectedEnergyUnit" size="small" style="width:120px" placeholder="用能单元">
          <el-option v-for="u in energyUnitOptions" :key="u" :label="u" :value="u" />
        </el-select>
        <el-button size="small" icon="el-icon-connection" @click="modelDialogVisible = true">选择模型</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
        <el-button size="small" icon="el-icon-document" @click="handleGenReport">碳排放报告</el-button>
      </div>
      <div class="filter-right">
        <el-button size="small" type="success" icon="el-icon-magic-stick" @click="handleAiAnalysis">AI智能分析</el-button>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="overview-section">
      <div class="overview-indicators">
        <div class="indicator-card">
          <div class="indicator-title">数据概览</div>
          <div class="indicator-list">
            <div class="indicator-row">
              <span class="ind-label">碳排放总量</span>
              <span class="ind-value">{{ overviewData.total }}</span>
              <span class="ind-unit">tCO₂e</span>
            </div>
            <div class="indicator-row">
              <span class="ind-label">范围一(直接排放)</span>
              <span class="ind-value">{{ overviewData.scope1 }}</span>
              <span class="ind-unit">tCO₂e</span>
            </div>
            <div class="indicator-row">
              <span class="ind-label">范围二(间接排放)</span>
              <span class="ind-value">{{ overviewData.scope2 }}</span>
              <span class="ind-unit">tCO₂e</span>
            </div>
            <div class="indicator-row">
              <span class="ind-label">范围三(其他间接)</span>
              <span class="ind-value">{{ overviewData.scope3 }}</span>
              <span class="ind-unit">tCO₂e</span>
            </div>
          </div>
        </div>
      </div>
      <div class="overview-chart">
        <TrendChart title="排放分布" :height="260" :option="pieChartOption" />
      </div>
      <div class="overview-chart">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">排放趋势</span>
            <el-select v-model="trendFilter" size="mini" style="width:140px" @change="handleTrendFilterChange">
              <el-option label="碳排总量" value="total" />
              <el-option label="范围一" value="scope1" />
              <el-option label="范围二" value="scope2" />
              <el-option label="范围三" value="scope3" />
            </el-select>
          </div>
          <div ref="trendChart" style="height:220px;width:100%"></div>
        </div>
      </div>
    </div>

    <!-- 类别一：直接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别一：直接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope1')">新增活动</el-button>
      </div>
      <el-table :data="scope1Data" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：直接温室气体排放</span>
        <span class="font-d-din subtotal-num">{{ overviewData.scope1 }} tCO₂e</span>
      </div>
    </div>

    <!-- 类别二：输入能源的间接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别二：输入能源的间接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope2')">新增活动</el-button>
      </div>
      <el-table :data="scope2Data" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：输入能源的间接温室气体排放</span>
        <span class="font-d-din subtotal-num">{{ overviewData.scope2 }} tCO₂e</span>
      </div>
    </div>

    <!-- 类别三：员工通勤产生的间接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别三：员工通勤产生的间接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope3_commute')">新增活动</el-button>
      </div>
      <el-table :data="scope3CommuteData" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：员工通勤产生的间接温室气体排放</span>
        <span class="font-d-din subtotal-num">0 tCO₂e</span>
      </div>
    </div>

    <!-- 类别四：产品使用产生的间接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别四：产品使用产生的间接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope3_product')">新增活动</el-button>
      </div>
      <el-table :data="scope3ProductData" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：产品使用产生的间接温室气体排放</span>
        <span class="font-d-din subtotal-num">0 tCO₂e</span>
      </div>
    </div>

    <!-- 类别五：废弃物处理产生的间接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别五：废弃物处理产生的间接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope3_waste')">新增活动</el-button>
      </div>
      <el-table :data="scope3WasteData" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：废弃物处理产生的间接温室气体排放</span>
        <span class="font-d-din subtotal-num">0 tCO₂e</span>
      </div>
    </div>

    <!-- 类别六：其他间接温室气体排放 -->
    <div class="category-section">
      <div class="category-header">
        <span class="category-title">类别六：其他间接温室气体排放</span>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAddActivity('scope3_other')">新增活动</el-button>
      </div>
      <el-table :data="scope3OtherData" border size="small" style="width:100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activity" label="活动" min-width="110" align="center" />
        <el-table-column prop="source" label="排放源" min-width="110" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
        <el-table-column prop="dataFrom" label="数据来源" min-width="100" align="center" />
        <el-table-column prop="operator" label="运算符" width="80" align="center" />
        <el-table-column prop="indicator" label="关联指标" min-width="110" align="center" />
        <el-table-column prop="amount" label="活动水平(数量)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
        </el-table-column>
        <el-table-column prop="unit" label="计量单位" min-width="100" align="center" />
        <el-table-column prop="emission" label="排放量(tCO₂e)" min-width="130" align="center">
          <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="category-subtotal">
        <span>小计：其他间接温室气体排放</span>
        <span class="font-d-din subtotal-num">0 tCO₂e</span>
      </div>
    </div>

    <!-- 新增/编辑活动对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="720px" append-to-body>
      <el-form :model="activityForm" label-width="120px" size="small">
        <el-form-item label="范围">
          <el-select v-model="activityForm.scope" placeholder="范围一" style="width:100%">
            <el-option label="范围一" value="范围一" />
            <el-option label="范围二" value="范围二" />
            <el-option label="范围三" value="范围三" />
          </el-select>
        </el-form-item>
        <el-form-item label="范畴">
          <el-input v-model="activityForm.category" placeholder="类别一：直接温室气体排放" />
        </el-form-item>
        <el-form-item label="活动设施" required>
          <el-input v-model="activityForm.facility" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="能源品种">
          <el-select v-model="activityForm.energyType" placeholder="请选择" style="width:100%">
            <el-option v-for="item in energyTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="排放源" required>
          <el-select v-model="activityForm.emissionSource" placeholder="请选择" style="width:100%">
            <el-option-group label="因子名称">
              <el-option label="固定燃烧" value="固定燃烧" />
              <el-option label="移动燃烧" value="移动燃烧" />
            </el-option-group>
            <el-option-group label="因子">
              <el-option label="工业过程排放" value="工业过程排放" />
            </el-option-group>
            <el-option-group label="数据来源">
              <el-option label="逸散排放" value="逸散排放" />
            </el-option-group>
            <el-option-group label="选择指标">
              <el-option label="土地利用" value="土地利用" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="activityForm.unit" placeholder="请输入计量单位" />
        </el-form-item>
        <el-form-item label="因子名称">
          <el-select v-model="activityForm.factorName" placeholder="请选择" style="width:100%">
            <el-option v-for="item in factorNameOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="因子">
          <el-input v-model="activityForm.factor" />
        </el-form-item>
        <el-form-item label="因子单位">
          <el-input v-model="activityForm.factorUnit" placeholder="请输入因子单位" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-select v-model="activityForm.dataFrom" placeholder="计算" style="width:100%">
            <el-option label="计算" value="计算" />
            <el-option label="录入" value="录入" />
          </el-select>
        </el-form-item>
        <el-form-item label="运算符" required>
          <el-select v-model="activityForm.operator" placeholder="请选择" style="width:100%">
            <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择指标">
          <el-input v-model="activityForm.indicator" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleSaveActivity">确定</el-button>
      </div>
    </el-dialog>

    <!-- 选择模型对话框 -->
    <el-dialog title="选择模型" :visible.sync="modelDialogVisible" width="520px" append-to-body>
      <el-radio-group v-model="selectedModel" style="width:100%">
        <div class="model-list">
          <el-radio v-for="m in modelOptions" :key="m.value" :label="m.value" border style="width:100%;margin:0 0 10px 0">
            <div class="model-item">
              <span class="model-name">{{ m.label }}</span>
              <span class="model-desc">{{ m.desc }}</span>
            </div>
          </el-radio>
        </div>
      </el-radio-group>
      <div slot="footer">
        <el-button size="small" @click="modelDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirmModel">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TrendChart from '@/components/TrendChart.vue'
import * as echarts from 'echarts'

export default {
  name: 'CarbonAccounting',
  components: { TrendChart },
  data() {
    const currentYear = new Date().getFullYear()
    return {
      selectedYear: currentYear,
      selectedEnergyUnit: '全厂',
      energyUnitOptions: ['全厂', '一分厂', '二分厂', '三分厂'],
      yearOptions: [currentYear, currentYear - 1, currentYear - 2, currentYear - 3],
      modelDialogVisible: false,
      selectedModel: '',
      modelOptions: [
        { label: 'ISO 14064-1', value: 'iso14064', desc: '组织层面温室气体排放和清除的量化与报告' },
        { label: 'GHG Protocol', value: 'ghg', desc: '温室气体核算体系企业标准' },
        { label: '国家发改委指南', value: 'ndrc', desc: '中国行业企业温室气体排放核算方法与报告指南' },
        { label: '省级指南', value: 'provincial', desc: '省级温室气体排放核算指南' }
      ],
      dialogVisible: false,
      dialogTitle: '新增活动',
      currentScope: '',
      editingRow: null,
      activityForm: {
        scope: '',
        category: '',
        facility: '',
        energyType: '',
        emissionSource: '',
        unit: '',
        factorName: '',
        factor: '',
        factorUnit: '',
        dataFrom: '',
        operator: '',
        indicator: ''
      },
      energyTypeOptions: ['电力', '天然气', '蒸汽', '自来水', '清洗煤', '原煤', '风力/光伏发电', '焦炉煤气'],
      factorNameOptions: ['二氧化碳', '甲烷', '氧化亚氮', '氢氟碳化物', '全氟化碳', '六氟化硫'],
      operatorOptions: [
        { label: '加', value: '+' },
        { label: '减', value: '-' }
      ],
      overviewData: {
        total: '146.16',
        scope1: '82.08',
        scope2: '64.08',
        scope3: '0'
      },
      scope1Data: [
        { activity: '固定燃烧', source: '燃气锅炉', name: '天然气', dataFrom: '自动采集', operator: '×', indicator: '排放因子', amount: '40000', unit: '升', emission: '82.08' },
        { activity: '移动燃烧', source: '卡车', name: '天然气', dataFrom: '手动录入', operator: '×', indicator: '排放因子', amount: '22', unit: '吨', emission: '0.00' },
        { activity: '移动燃烧', source: '班车', name: '汽油', dataFrom: '手动录入', operator: '×', indicator: '排放因子', amount: '1500', unit: '升', emission: '0.00' }
      ],
      scope2Data: [
        { activity: '外购电力', source: '电力', name: '外购电力', dataFrom: '自动采集', operator: '×', indicator: '排放因子', amount: '90000', unit: 'kwh', emission: '64.08' },
        { activity: '外购电力', source: '电力', name: '外购电力', dataFrom: '自动采集', operator: '×', indicator: '排放因子', amount: '0', unit: 'kwh', emission: '0.00' }
      ],
      scope3CommuteData: [],
      scope3ProductData: [],
      scope3WasteData: [],
      scope3OtherData: [],
      trendFilter: 'total',
      trendData: {
        total: [11.7, 12.8, 12.2, 12.1, 13.3, 12.2, 11.3, 12.3, 12.8, 11.8, 11.5, 12.0],
        scope1: [6.5, 7.2, 6.8, 7.0, 7.5, 6.9, 6.3, 6.8, 7.1, 6.6, 6.4, 6.9],
        scope2: [5.2, 5.6, 5.4, 5.1, 5.8, 5.3, 5.0, 5.5, 5.7, 5.2, 5.1, 5.1],
        scope3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      trendChart: null
    }
  },
  computed: {
    pieChartOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂e ({d}%)' },
        legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
          data: [
            { value: 82.08, name: '范围一(直接)', itemStyle: { color: '#1890FF' } },
            { value: 64.08, name: '范围二(间接)', itemStyle: { color: '#52C41A' } },
            { value: 0, name: '范围三(其他)', itemStyle: { color: '#FAAD14' } }
          ]
        }]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initTrendChart()
    })
    window.addEventListener('resize', this.handleTrendResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleTrendResize)
    if (this.trendChart) {
      this.trendChart.dispose()
    }
  },
  methods: {
    initTrendChart() {
      const el = this.$refs.trendChart
      if (!el) return
      this.trendChart = echarts.init(el)
      this.renderTrendChart()
    },
    renderTrendChart() {
      if (!this.trendChart) return
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const filter = this.trendFilter
      const data = this.trendData[filter]
      const labelMap = { total: '碳排总量', scope1: '范围一', scope2: '范围二', scope3: '范围三' }
      const colorMap = { total: '#1890FF', scope1: '#1890FF', scope2: '#52C41A', scope3: '#FAAD14' }
      const maxVal = Math.max(...data)
      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>' + labelMap[filter] + '：{c} tCO₂e' },
        grid: { top: 30, right: 20, bottom: 30, left: 80 },
        xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
        yAxis: {
          type: 'value',
          name: 'tCO₂e',
          nameTextStyle: { fontSize: 12, padding: [0, 40, 0, 0] },
          max: Math.ceil(maxVal * 1.2),
          axisLabel: { fontSize: 11, formatter: '{value}' },
          splitLine: { lineStyle: { type: 'dashed' } }
        },
        series: [{
          name: labelMap[filter],
          type: 'bar',
          barWidth: '50%',
          data: data,
          itemStyle: { color: colorMap[filter], borderRadius: [3, 3, 0, 0] },
          label: { show: true, position: 'top', fontSize: 10, formatter: '{c}' }
        }]
      }
      this.trendChart.setOption(option, true)
    },
    handleTrendFilterChange() {
      this.renderTrendChart()
    },
    handleTrendResize() {
      if (this.trendChart) this.trendChart.resize()
    },
    handleRefresh() {
      this.$message.success('数据已刷新')
    },
    handleGenReport() {
      this.$message.info('正在生成碳排放报告...')
    },
    handleAiAnalysis() {
      this.$message.success('AI智能分析功能启动中...')
    },
    handleConfirmModel() {
      if (!this.selectedModel) {
        this.$message.warning('请选择一个模型')
        return
      }
      this.modelDialogVisible = false
      const model = this.modelOptions.find(m => m.value === this.selectedModel)
      this.$message.success(`已选择模型：${model.label}`)
    },
    handleAddActivity(scope) {
      this.currentScope = scope
      this.editingRow = null
      this.dialogTitle = '新增活动'
      this.activityForm = {
        scope: '', category: '', facility: '', energyType: '', emissionSource: '',
        unit: '', factorName: '', factor: '', factorUnit: '', dataFrom: '',
        operator: '', indicator: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.editingRow = row
      this.dialogTitle = '编辑活动'
      this.activityForm = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该条记录？', '提示', { type: 'warning' }).then(() => {
        const listMap = {
          scope1: this.scope1Data,
          scope2: this.scope2Data,
          scope3_commute: this.scope3CommuteData,
          scope3_product: this.scope3ProductData,
          scope3_waste: this.scope3WasteData,
          scope3_other: this.scope3OtherData
        }
        const list = listMap[this.currentScope]
        if (list) {
          const idx = list.indexOf(row)
          if (idx > -1) list.splice(idx, 1)
        }
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleSaveActivity() {
      if (!this.activityForm.facility || !this.activityForm.emissionSource || !this.activityForm.operator) {
        this.$message.warning('请填写必填项')
        return
      }
      const emission = this.activityForm.emission || '0.00'
      const newRecord = { ...this.activityForm, emission }
      const listMap = {
        scope1: this.scope1Data,
        scope2: this.scope2Data,
        scope3_commute: this.scope3CommuteData,
        scope3_product: this.scope3ProductData,
        scope3_waste: this.scope3WasteData,
        scope3_other: this.scope3OtherData
      }
      const list = listMap[this.currentScope]
      if (list) {
        if (this.editingRow) {
          Object.assign(this.editingRow, newRecord)
        } else {
          list.push(newRecord)
        }
      }
      this.dialogVisible = false
      this.$message.success(this.editingRow ? '编辑成功' : '新增成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.carbon-accounting {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $background-white;
  border-radius: $card-radius;
  padding: 12px $card-padding;
  box-shadow: $card-shadow;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// 数据概览
.overview-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $spacing-md;
}

.overview-indicators {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.indicator-card {
  .indicator-title {
    font-size: $font-size-14;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 16px;
  }
}

.indicator-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.indicator-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid $divider-color;

  &:last-child {
    border-bottom: none;
  }

  .ind-label {
    flex: 1;
    font-size: 13px;
    color: $text-regular;
  }

  .ind-value {
    font-family: $font-d-din;
    font-size: $font-size-18;
    font-weight: 600;
    color: $text-primary;
    margin-right: 4px;
  }

  .ind-unit {
    font-size: $font-size-12;
    color: $text-secondary;
  }
}

.overview-chart {
  background: $background-white;
  border-radius: $card-radius;
  box-shadow: $card-shadow;
  overflow: hidden;

  .chart-card {
    padding: $card-padding;
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .chart-title {
    font-family: $font-title;
    font-size: $font-size-16;
    color: $text-primary;
  }

  ::v-deep .trend-chart {
    box-shadow: none;
    border-radius: 0;
  }
}

// 类别区域
.category-section {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $divider-color;
}

.category-title {
  font-size: $font-size-14;
  font-weight: 600;
  color: #00a67d;
}

.category-subtotal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding: 10px $spacing-md;
  background: rgba($primary-color, 0.04);
  border-radius: $radius-md;
  font-size: 13px;
  color: $text-regular;

  .subtotal-num {
    font-size: $font-size-16;
    font-weight: 600;
    color: $primary-color;
  }
}

.emission-val {
  color: $primary-color;
  font-weight: 600;
}

.font-d-din {
  font-family: $font-d-din;
}

.model-list {
  .el-radio.is-bordered {
    padding: 12px 16px;
    height: auto;
    border-radius: 6px;
  }

  .model-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .model-name {
      font-size: $font-size-14;
      font-weight: 500;
      color: $text-primary;
    }

    .model-desc {
      font-size: $font-size-12;
      color: $text-secondary;
    }
  }
}
</style>
