<template>
  <div class="carbon-verification">
    <!-- 顶部筛选栏 -->
    <div class="view-toolbar">
      <el-select v-model="selectedYear" size="small" style="width:110px">
        <el-option v-for="y in yearOptions" :key="y" :label="y + '年'" :value="y" />
      </el-select>
      <el-select v-model="selectedBatch" size="small" style="width:160px" placeholder="核查批次">
        <el-option v-for="b in batchOptions" :key="b" :label="b" :value="b" />
      </el-select>
      <el-button size="small" icon="el-icon-refresh" @click="handleRefresh">刷新</el-button>
    </div>

    <!-- Tab 导航 -->
    <el-tabs v-model="activeTab" type="card" class="verification-tabs">
      <!-- Tab 1：核查概览 -->
      <el-tab-pane label="核查概览" name="overview" lazy>
        <div class="kpi-grid mb-md">
          <KpiCard label="应核查排放源" value="86" unit="个" status="default" :trend="{ value: 3.6, type: 'up' }" />
          <KpiCard label="已核查排放源" value="82" unit="个" status="success" :trend="{ value: 5.1, type: 'up' }" />
          <KpiCard label="原始凭证完整率" value="96.5" unit="%" status="success" :trend="{ value: 1.2, type: 'up' }" />
          <KpiCard label="过程数据可溯源率" value="100" unit="%" status="success" :trend="{ value: 0, type: 'stable' }" />
          <KpiCard label="待核查排放源" value="4" unit="个" status="warning" :trend="{ value: 2.4, type: 'down' }" />
          <KpiCard label="材料汇集进度" value="92" unit="%" status="warning" :trend="{ value: 8.0, type: 'up' }" />
        </div>

        <div class="section-card mb-md">
          <h3 class="section-title">核查流程</h3>
          <el-steps :active="3" align-center finish-status="success" class="verify-steps">
            <el-step title="数据采集" description="过程数据与原始凭证" />
            <el-step title="排放核算" description="范围一/二/三核算" />
            <el-step title="报告生成" description="在线自动生成报告" />
            <el-step title="材料汇集" description="核查材料完整性核查" />
            <el-step title="核查完成" description="第三方机构核查" />
          </el-steps>
        </div>

        <DataTable title="核查批次记录" :data="batchData" :total="batchData.length" :pagination="false">
          <el-table-column prop="year" label="核查年度" min-width="100" align="center" />
          <el-table-column prop="agency" label="核查机构" min-width="180" align="center" />
          <el-table-column prop="scope" label="核查范围" min-width="160" align="center" />
          <el-table-column prop="status" label="核查状态" width="100" align="center">
            <template slot-scope="{ row }">
              <span :class="['status-tag', `status--${row.statusClass}`]">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="conclusion" label="核查结论" min-width="140" align="center" />
          <el-table-column prop="reportNo" label="报告编号" min-width="180" align="center" />
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" @click="handleViewReport(row)">查看报告</el-button>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- Tab 2：过程数据溯源 -->
      <el-tab-pane label="过程数据溯源" name="trace" lazy>
        <DataTable title="排放活动溯源清单" :data="traceData" :total="traceData.length" :pagination="false">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="活动名称" min-width="120" align="center" />
          <el-table-column prop="source" label="排放源" min-width="120" align="center" />
          <el-table-column prop="dataFrom" label="数据来源" min-width="110" align="center" />
          <el-table-column prop="amount" label="活动数据(数量)" min-width="130" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.amount }}</span></template>
          </el-table-column>
          <el-table-column prop="unit" label="计量单位" min-width="90" align="center" />
          <el-table-column prop="emission" label="核算结果(tCO₂e)" min-width="130" align="center">
            <template slot-scope="{ row }"><span class="font-d-din emission-val">{{ row.emission }}</span></template>
          </el-table-column>
          <el-table-column prop="voucherCount" label="关联凭证数" width="100" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.voucherCount }}</span></template>
          </el-table-column>
          <el-table-column prop="traceStatus" label="溯源状态" width="90" align="center">
            <template slot-scope="{ row }">
              <span :class="['status-tag', `status--${row.traceStatusClass}`]">{{ row.traceStatus }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" @click="handleTrace(row)">溯源</el-button>
              <el-button type="text" size="mini" @click="handleViewVoucher(row)">查看凭证</el-button>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- Tab 3：原始凭证 -->
      <el-tab-pane label="原始凭证" name="voucher" lazy>
        <div class="tab-toolbar mb-md">
          <el-select v-model="voucherTypeFilter" size="small" style="width:140px" placeholder="全部凭证类型" clearable>
            <el-option v-for="t in voucherTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
          <el-button size="small" type="primary" icon="el-icon-upload2" @click="uploadDialogVisible = true">上传凭证</el-button>
        </div>

        <DataTable title="原始凭证清单" :data="filteredVoucherData" :total="filteredVoucherData.length" :pagination="false">
          <el-table-column prop="name" label="凭证名称" min-width="180" align="center" />
          <el-table-column prop="type" label="凭证类型" min-width="110" align="center">
            <template slot-scope="{ row }"><span class="voucher-type">{{ row.type }}</span></template>
          </el-table-column>
          <el-table-column prop="source" label="关联排放源" min-width="120" align="center" />
          <el-table-column prop="date" label="凭证日期" min-width="110" align="center" />
          <el-table-column prop="uploader" label="上传人" width="90" align="center" />
          <el-table-column prop="uploadTime" label="上传时间" min-width="150" align="center" />
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template slot-scope="{ row }">
              <span :class="['status-tag', `status--${row.statusClass}`]">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" @click="handlePreview(row)">查看</el-button>
              <el-button type="text" size="mini" @click="handleDownload(row)">下载</el-button>
              <el-button type="text" size="mini" style="color:#FF4D4F" @click="handleDeleteVoucher(row)">删除</el-button>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- Tab 4：报告生成 -->
      <el-tab-pane label="报告生成" name="report" lazy>
        <div class="section-card mb-md">
          <h3 class="section-title">碳排放报告在线生成</h3>
          <div class="gen-panel">
            <el-form :inline="true" size="small" class="gen-form">
              <el-form-item label="报告年度">
                <el-select v-model="genForm.year" style="width:110px">
                  <el-option v-for="y in yearOptions" :key="y" :label="y + '年'" :value="y" />
                </el-select>
              </el-form-item>
              <el-form-item label="报告类型">
                <el-select v-model="genForm.type" style="width:200px">
                  <el-option v-for="t in reportTypeOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
              <el-form-item label="报告模板">
                <el-select v-model="genForm.template" style="width:220px">
                  <el-option v-for="t in templateOptions" :key="t.value" :label="t.label" :value="t.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-magic-stick" :loading="generating" @click="handleGenerateReport">生成报告</el-button>
              </el-form-item>
            </el-form>
            <p class="gen-tip">基于碳排放核算的过程数据与原始凭证，自动生成符合规范的碳排放报告。</p>
          </div>
        </div>

        <DataTable title="已生成报告" :data="reportData" :total="reportData.length" :pagination="false">
          <el-table-column prop="name" label="报告名称" min-width="220" align="center" />
          <el-table-column prop="year" label="报告年度" width="100" align="center" />
          <el-table-column prop="type" label="报告类型" min-width="160" align="center" />
          <el-table-column prop="genTime" label="生成时间" min-width="150" align="center" />
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template slot-scope="{ row }">
              <span :class="['status-tag', `status--${row.statusClass}`]">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" @click="handlePreview(row)">预览</el-button>
              <el-button type="text" size="mini" @click="handleDownload(row)">下载</el-button>
              <el-button type="text" size="mini" @click="handleRegenerate(row)">重新生成</el-button>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>

      <!-- Tab 5：材料汇集与导出 -->
      <el-tab-pane label="材料汇集与导出" name="material" lazy>
        <div class="section-card mb-md">
          <div class="material-summary">
            <div class="material-summary__info">
              <h3 class="section-title">核查材料汇集进度</h3>
              <span class="material-summary__percent font-d-din">{{ materialProgress }}%</span>
            </div>
            <el-button type="primary" icon="el-icon-download" @click="handleExportPackage">一键导出核查材料包</el-button>
          </div>
          <el-progress :percentage="materialProgress" :stroke-width="12" color="#1890FF" />
        </div>

        <DataTable title="核查材料清单" :data="materialData" :total="materialData.length" :pagination="false">
          <el-table-column prop="category" label="材料类别" min-width="140" align="center" />
          <el-table-column prop="name" label="材料名称" min-width="200" align="center" />
          <el-table-column prop="count" label="数量" width="80" align="center">
            <template slot-scope="{ row }"><span class="font-d-din">{{ row.count }}</span></template>
          </el-table-column>
          <el-table-column label="是否齐备" width="90" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row.ready" @change="handleReadyChange" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template slot-scope="{ row }">
              <span :class="['status-tag', `status--${row.statusClass}`]">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="{ row }">
              <el-button type="text" size="mini" @click="handleExportItem(row)">导出</el-button>
            </template>
          </el-table-column>
        </DataTable>
      </el-tab-pane>
    </el-tabs>

    <!-- 溯源对话框 -->
    <el-dialog :title="'过程数据溯源 — ' + (traceRow.name || '')" :visible.sync="traceDialogVisible" width="680px" append-to-body>
      <el-steps direction="vertical" :active="4" finish-status="success" class="trace-chain">
        <el-step title="原始数据" :description="traceChain[0]" />
        <el-step title="折标系数" :description="traceChain[1]" />
        <el-step title="活动数据" :description="traceChain[2]" />
        <el-step title="排放因子" :description="traceChain[3]" />
        <el-step title="核算结果" :description="traceChain[4]" />
      </el-steps>
      <div slot="footer">
        <el-button size="small" @click="traceDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 上传凭证对话框 -->
    <el-dialog title="上传原始凭证" :visible.sync="uploadDialogVisible" width="560px" append-to-body>
      <el-form :model="uploadForm" label-width="100px" size="small">
        <el-form-item label="凭证名称" required>
          <el-input v-model="uploadForm.name" placeholder="请输入凭证名称" />
        </el-form-item>
        <el-form-item label="凭证类型" required>
          <el-select v-model="uploadForm.type" placeholder="请选择" style="width:100%">
            <el-option v-for="t in voucherTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联排放源" required>
          <el-select v-model="uploadForm.source" placeholder="请选择" style="width:100%">
            <el-option v-for="s in emissionSourceOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="凭证日期">
          <el-date-picker v-model="uploadForm.date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="上传文件" required>
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="uploadForm.fileList"
          >
            <el-button size="small" icon="el-icon-upload2">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="uploadDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleSaveUpload">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import KpiCard from '@/components/KpiCard.vue'
import DataTable from '@/components/DataTable.vue'

export default {
  name: 'CarbonVerification',
  components: { KpiCard, DataTable },
  data() {
    const currentYear = new Date().getFullYear()
    return {
      activeTab: 'overview',
      selectedYear: currentYear,
      selectedBatch: '2025年度核查',
      yearOptions: [currentYear, currentYear - 1, currentYear - 2, currentYear - 3],
      batchOptions: ['2025年度核查', '2024年度核查', '2023年度核查'],

      // 核查批次
      batchData: [
        { year: '2025', agency: '中环联合认证中心', scope: '范围一、范围二', status: '核查中', statusClass: 'pending', conclusion: '—', reportNo: 'HJ-2025-012' },
        { year: '2024', agency: '中国质量认证中心', scope: '范围一、范围二、范围三', status: '已完成', statusClass: 'done', conclusion: '通过', reportNo: 'HJ-2024-098' },
        { year: '2023', agency: '华测检测认证集团', scope: '范围一、范围二', status: '已完成', statusClass: 'done', conclusion: '通过', reportNo: 'HJ-2023-076' },
        { year: '2022', agency: '华测检测认证集团', scope: '范围一、范围二', status: '已完成', statusClass: 'done', conclusion: '通过', reportNo: 'HJ-2022-054' }
      ],

      // 过程数据溯源
      traceData: [
        { name: '天然气锅炉燃烧', source: '燃气锅炉', dataFrom: '自动采集', amount: '40000', unit: '升', emission: '82.08', voucherCount: 6, traceStatus: '可溯源', traceStatusClass: 'done' },
        { name: '卡车运输燃料', source: '卡车', dataFrom: '手动录入', amount: '22', unit: '吨', emission: '0.00', voucherCount: 2, traceStatus: '可溯源', traceStatusClass: 'done' },
        { name: '班车通勤燃料', source: '班车', dataFrom: '手动录入', amount: '1500', unit: '升', emission: '0.00', voucherCount: 1, traceStatus: '待补充', traceStatusClass: 'pending' },
        { name: '外购电力消耗', source: '电力', dataFrom: '自动采集', amount: '90000', unit: 'kwh', emission: '64.08', voucherCount: 4, traceStatus: '可溯源', traceStatusClass: 'done' },
        { name: '蒸汽外购', source: '蒸汽', dataFrom: '手动录入', amount: '8560', unit: '吨', emission: '11.04', voucherCount: 3, traceStatus: '可溯源', traceStatusClass: 'done' }
      ],

      // 原始凭证
      voucherTypeFilter: '',
      voucherTypeOptions: ['电费发票', '燃气账单', '计量表记录', '采购单据', '监测报告'],
      voucherData: [
        { name: '电费发票-2026年5月', type: '电费发票', source: '外购电力', date: '2026-05-31', uploader: '张三', uploadTime: '2026-06-02 10:20', status: '已核对', statusClass: 'done' },
        { name: '燃气账单-2026年5月', type: '燃气账单', source: '燃气锅炉', date: '2026-05-31', uploader: '李四', uploadTime: '2026-06-02 11:05', status: '已核对', statusClass: 'done' },
        { name: '锅炉燃气表读数-2026年5月', type: '计量表记录', source: '燃气锅炉', date: '2026-05-31', uploader: '王五', uploadTime: '2026-06-01 09:40', status: '已核对', statusClass: 'done' },
        { name: '柴油采购单-2026年4月', type: '采购单据', source: '卡车', date: '2026-04-25', uploader: '张三', uploadTime: '2026-05-03 15:12', status: '待核对', statusClass: 'pending' },
        { name: '班车加油发票-2026年4月', type: '采购单据', source: '班车', date: '2026-04-18', uploader: '李四', uploadTime: '2026-05-05 08:30', status: '待核对', statusClass: 'pending' },
        { name: '外购蒸汽结算单-2026年5月', type: '采购单据', source: '蒸汽', date: '2026-05-31', uploader: '王五', uploadTime: '2026-06-03 14:00', status: '已核对', statusClass: 'done' },
        { name: '温室气体排放监测报告-2025', type: '监测报告', source: '全厂', date: '2025-12-31', uploader: '赵六', uploadTime: '2026-01-10 10:00', status: '已核对', statusClass: 'done' }
      ],

      // 报告生成
      generating: false,
      genForm: { year: currentYear - 1, type: '碳排放核查报告', template: 'tpl-ndrc' },
      reportTypeOptions: ['碳排放核查报告', '温室气体排放报告', '企业年度碳排放报告'],
      templateOptions: [
        { label: '国家发改委行业核算指南模板', value: 'tpl-ndrc' },
        { label: 'ISO 14064-1 报告模板', value: 'tpl-iso' },
        { label: 'GHG Protocol 报告模板', value: 'tpl-ghg' }
      ],
      reportData: [
        { name: '2025年度碳排放核查报告', year: '2025', type: '碳排放核查报告', genTime: '2026-03-15 14:30', status: '已生成', statusClass: 'done' },
        { name: '2024年度温室气体排放报告', year: '2024', type: '温室气体排放报告', genTime: '2025-02-20 09:15', status: '已生成', statusClass: 'done' },
        { name: '2023年度企业碳排放报告', year: '2023', type: '企业年度碳排放报告', genTime: '2024-01-25 16:40', status: '已生成', statusClass: 'done' }
      ],

      // 材料汇集与导出
      materialData: [
        { category: '核算报告', name: '企业碳排放核算报告', count: 1, ready: true, status: '齐备', statusClass: 'done' },
        { category: '原始凭证', name: '能源消费原始凭证', count: 23, ready: true, status: '齐备', statusClass: 'done' },
        { category: '监测计划', name: '年度排放监测计划', count: 1, ready: true, status: '齐备', statusClass: 'done' },
        { category: '排放因子来源', name: '排放因子取值依据', count: 12, ready: true, status: '齐备', statusClass: 'done' },
        { category: '质量控制记录', name: '数据质量控制记录', count: 3, ready: false, status: '缺失', statusClass: 'fail' },
        { category: '核查计划', name: '第三方核查计划书', count: 0, ready: false, status: '待补充', statusClass: 'pending' }
      ],

      // 溯源对话框
      traceDialogVisible: false,
      traceRow: {},

      // 上传凭证对话框
      uploadDialogVisible: false,
      uploadForm: { name: '', type: '', source: '', date: '', fileList: [] },
      emissionSourceOptions: ['燃气锅炉', '卡车', '班车', '外购电力', '蒸汽', '全厂']
    }
  },
  computed: {
    filteredVoucherData() {
      if (!this.voucherTypeFilter) return this.voucherData
      return this.voucherData.filter(v => v.type === this.voucherTypeFilter)
    },
    materialProgress() {
      const readyCount = this.materialData.filter(m => m.ready).length
      return Math.round((readyCount / this.materialData.length) * 100)
    },
    traceChain() {
      const r = this.traceRow
      const factorMap = {
        '升': { factor: '0.00000216 tCO₂/升', source: '国家发改委行业指南' },
        '吨': { factor: '0.00216 tCO₂/kg', source: '国家发改委行业指南' },
        'kwh': { factor: '0.000712 tCO₂/kWh', source: '全国电网平均排放因子' }
      }
      const f = factorMap[r.unit] || { factor: '0.00216 tCO₂/kg', source: '国家发改委行业指南' }
      return [
        `数值：${r.amount} ${r.unit} ｜ 来源：${r.dataFrom} ｜ 凭证：${r.voucherCount} 份`,
        `系数：1.33 kgce/${r.unit === 'kwh' ? '万kWh' : r.unit} ｜ 来源：国家标准 GB/T 2589`,
        `活动数据：${r.amount} ${r.unit} ｜ 由原始数据×折标系数计算`,
        `因子：${f.factor} ｜ 来源：${f.source}`,
        `结果：${r.emission} tCO₂e ｜ 活动数据 × 排放因子`
      ]
    }
  },
  methods: {
    handleRefresh() {
      this.$message.success('数据已刷新')
    },
    handleViewReport(row) {
      this.$message.info(`正在打开 ${row.year} 年度核查报告`)
    },
    handleTrace(row) {
      this.traceRow = row
      this.traceDialogVisible = true
    },
    handleViewVoucher(row) {
      this.$message.info(`查看「${row.name}」的 ${row.voucherCount} 份关联凭证`)
    },
    handlePreview(row) {
      this.$message.info(`预览：${row.name}`)
    },
    handleDownload(row) {
      this.$message.success(`开始下载：${row.name}`)
    },
    handleDeleteVoucher(row) {
      this.$confirm(`确认删除凭证「${row.name}」？`, '提示', { type: 'warning' }).then(() => {
        const idx = this.voucherData.indexOf(row)
        if (idx > -1) this.voucherData.splice(idx, 1)
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    handleFileChange(file) {
      this.uploadForm.fileList = [file]
    },
    handleSaveUpload() {
      if (!this.uploadForm.name || !this.uploadForm.type || !this.uploadForm.source || this.uploadForm.fileList.length === 0) {
        this.$message.warning('请填写必填项并选择文件')
        return
      }
      const now = new Date()
      const pad = n => (n < 10 ? '0' + n : n)
      const uploadTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
      this.voucherData.unshift({
        name: this.uploadForm.name,
        type: this.uploadForm.type,
        source: this.uploadForm.source,
        date: this.uploadForm.date || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        uploader: '当前用户',
        uploadTime,
        status: '待核对',
        statusClass: 'pending'
      })
      this.uploadDialogVisible = false
      this.uploadForm = { name: '', type: '', source: '', date: '', fileList: [] }
      this.$message.success('凭证上传成功')
    },
    handleGenerateReport() {
      this.generating = true
      const year = this.genForm.year
      const type = this.genForm.type
      setTimeout(() => {
        const now = new Date()
        const pad = n => (n < 10 ? '0' + n : n)
        const genTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        this.reportData.unshift({
          name: `${year}年度${type}`,
          year: String(year),
          type,
          genTime,
          status: '已生成',
          statusClass: 'done'
        })
        this.generating = false
        this.$message.success('报告生成成功')
      }, 1200)
    },
    handleRegenerate(row) {
      this.$message.success(`正在重新生成：${row.name}`)
    },
    handleReadyChange() {
      // 勾选状态变化时自动更新汇集进度
    },
    handleExportItem(row) {
      this.$message.success(`导出材料：${row.name}`)
    },
    handleExportPackage() {
      this.$message.success('正在打包导出核查材料，请稍候…')
      setTimeout(() => this.$message.success('核查材料包已导出（碳核查支撑材料_2025年度.zip）'), 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.carbon-verification {
  display: flex;
  flex-direction: column;
}

.view-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $background-white;
  border-radius: $card-radius;
  padding: 12px $card-padding;
  box-shadow: $card-shadow;
  margin-bottom: $spacing-md;
}

.verification-tabs {
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $gutter;
}

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

.mb-md {
  margin-bottom: $spacing-md;
}

.verify-steps {
  ::v-deep .el-step__title {
    font-size: $font-size-14;
  }

  ::v-deep .el-step__description {
    font-size: $font-size-12;
    color: $text-secondary;
  }
}

.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $background-white;
  border-radius: $card-radius;
  padding: 12px $card-padding;
  box-shadow: $card-shadow;
}

.gen-panel {
  .gen-form {
    margin-bottom: $spacing-sm;
  }

  .gen-tip {
    font-size: $font-size-12;
    color: $text-placeholder;
    margin: 0;
  }
}

.material-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;

  &__info {
    display: flex;
    align-items: baseline;
    gap: 12px;

    .section-title {
      margin-bottom: 0;
    }
  }

  &__percent {
    font-size: $font-size-24;
    color: $primary-color;
  }
}

.font-d-din {
  font-family: $font-d-din;
}

.emission-val {
  color: $primary-color;
  font-weight: 600;
}

.voucher-type {
  font-size: $font-size-12;
  padding: 2px 8px;
  border-radius: 2px;
  color: $primary-color;
  background: rgba($primary-color, 0.08);
}

.status-tag {
  font-size: $font-size-12;
  padding: 2px 8px;
  border-radius: 2px;

  &.status--done { color: $success-color; background: rgba($success-color, 0.1); }
  &.status--pending { color: $warning-color; background: rgba($warning-color, 0.1); }
  &.status--fail { color: $danger-color; background: rgba($danger-color, 0.1); }
}

.trace-chain {
  ::v-deep .el-step__title {
    font-size: $font-size-14;
    color: $text-primary;
  }

  ::v-deep .el-step__description {
    font-size: 13px;
    color: $text-regular;
  }
}
</style>
