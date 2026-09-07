<template>
  <div class="report-export">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="预设模板" name="template" />
      <el-tab-pane label="自定义报表" name="custom" />
    </el-tabs>

    <!-- 预设模板 -->
    <div v-if="activeTab === 'template'" class="template-section">
      <div class="template-grid">
        <div v-for="tpl in templates" :key="tpl.key" class="template-card">
          <div class="template-card__icon"><i :class="tpl.icon" /></div>
          <div class="template-card__body">
            <h4>{{ tpl.label }}</h4>
            <p>{{ tpl.desc }}</p>
          </div>
          <div class="template-card__actions">
            <el-button size="small" type="primary" icon="el-icon-view" @click="handlePreview(tpl)">预览</el-button>
            <el-button size="small" icon="el-icon-download" @click="handleExport(tpl)">导出</el-button>
          </div>
        </div>
      </div>

      <!-- 报表预览弹窗：正式报表格式 -->
      <el-dialog :visible.sync="previewVisible" :title="previewTpl?.label + ' - 预览'" width="1000px" top="30px" append-to-body>
        <div class="report-document">
          <!-- 报表头 -->
          <div class="report-hd">
            <h2>某某制造有限公司</h2>
            <h3>{{ previewTpl?.label || '能源报表' }}</h3>
            <div class="report-meta">
              <span>报表期间：2026年7月</span>
              <span>生成时间：{{ nowStr }}</span>
              <span>制表人：能源管理科</span>
            </div>
          </div>

          <!-- 概述 -->
          <div class="report-section">
            <h4>一、用能概况</h4>
            <div class="summary-grid">
              <div class="sum-item"><span class="si-label">综合能耗</span><span class="si-val">1,906.8</span><span class="si-unit">tce</span></div>
              <div class="sum-item"><span class="si-label">外购电力</span><span class="si-val">2,356,800</span><span class="si-unit">kWh</span></div>
              <div class="sum-item"><span class="si-label">天然气</span><span class="si-val">45.8</span><span class="si-unit">万m³</span></div>
              <div class="sum-item"><span class="si-label">原煤</span><span class="si-val">1,256.8</span><span class="si-unit">t</span></div>
              <div class="sum-item"><span class="si-label">蒸汽</span><span class="si-val">8,560</span><span class="si-unit">t</span></div>
              <div class="sum-item"><span class="si-label">柴油</span><span class="si-val">22.5</span><span class="si-unit">t</span></div>
            </div>
          </div>

          <!-- 能耗结构 -->
          <div class="report-section">
            <h4>二、能源消费结构</h4>
            <div class="report-chart-wrap">
              <div class="pie-text">
                <div class="pie-item"><span class="pie-dot" style="background:#4A4A4A"></span> 固体燃料 32.4%</div>
                <div class="pie-item"><span class="pie-dot" style="background:#CD853F"></span> 液体燃料 12.0%</div>
                <div class="pie-item"><span class="pie-dot" style="background:#2FC25B"></span> 气体燃料 18.6%</div>
                <div class="pie-item"><span class="pie-dot" style="background:#1890FF"></span> 电力 25.6%</div>
                <div class="pie-item"><span class="pie-dot" style="background:#FACC14"></span> 热力 8.8%</div>
                <div class="pie-item"><span class="pie-dot" style="background:#722ED1"></span> 其他燃料 2.6%</div>
              </div>
            </div>
          </div>

          <!-- 数据明细表 -->
          <div class="report-section">
            <h4>三、用能数据明细</h4>
            <table class="report-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>用能单元</th>
                  <th>固体燃料(tce)</th>
                  <th>液体燃料(tce)</th>
                  <th>气体燃料(tce)</th>
                  <th>电力(tce)</th>
                  <th>热力(tce)</th>
                  <th>其他(tce)</th>
                  <th>合计(tce)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in reportTableData" :key="i">
                  <td>{{ row.date }}</td>
                  <td>{{ row.section }}</td>
                  <td class="num">{{ row.solid }}</td>
                  <td class="num">{{ row.liquid }}</td>
                  <td class="num">{{ row.gas }}</td>
                  <td class="num">{{ row.electricity }}</td>
                  <td class="num">{{ row.heat }}</td>
                  <td class="num">{{ row.other }}</td>
                  <td class="num sum-col">{{ row.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 同比分析 -->
          <div class="report-section">
            <h4>四、同比分析</h4>
            <table class="report-table">
              <thead>
                <tr><th>指标</th><th>本期</th><th>去年同期</th><th>变化率</th><th>趋势</th></tr>
              </thead>
              <tbody>
                <tr><td>综合能耗(tce)</td><td class="num">1,906.8</td><td class="num">1,842.3</td><td class="num">+3.5%</td><td><span class="trend-up">↑ 增长</span></td></tr>
                <tr><td>单位产值能耗(tce/万元)</td><td class="num">0.38</td><td class="num">0.40</td><td class="num">-5.0%</td><td><span class="trend-down">↓ 下降</span></td></tr>
                <tr><td>清洁能源占比</td><td class="num">35.8%</td><td class="num">32.1%</td><td class="num">+3.7%</td><td><span class="trend-up">↑ 增长</span></td></tr>
              </tbody>
            </table>
          </div>

          <!-- 报表尾 -->
          <div class="report-ft">
            <p>审核：________ &emsp; 批准：________ &emsp; 日期：________</p>
            <p>本报表由能碳数字化管理平台自动生成</p>
          </div>
        </div>
        <div slot="footer">
          <el-button size="small" type="primary" icon="el-icon-download" @click="handleExport(previewTpl)">导出 Excel</el-button>
        </div>
      </el-dialog>
    </div>

    <!-- 自定义报表 -->
    <div v-if="activeTab === 'custom'" class="custom-section">
      <div class="builder-layout">
        <div class="builder-panel builder-left">
          <h4>选择指标</h4>
          <el-checkbox-group v-model="builderConfig.metrics">
            <div v-for="m in builderMetrics" :key="m.key" class="metric-item">
              <el-checkbox :label="m.key">{{ m.label }}</el-checkbox>
            </div>
          </el-checkbox-group>
          <h4 style="margin-top:20px">选择维度</h4>
          <el-checkbox-group v-model="builderConfig.dimensions">
            <div v-for="d in builderDimensions" :key="d.key" class="metric-item">
              <el-checkbox :label="d.key">{{ d.label }}</el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
        <div class="builder-panel builder-center">
          <h4>报表预览</h4>
          <div class="preview-placeholder">
            <el-empty v-if="!builderConfig.metrics.length" description="请在左侧选择指标和维度" />
            <table v-else class="report-table mini">
              <thead><tr><th>指标</th><th v-for="d in selectedDimLabels" :key="d">{{ d }}</th></tr></thead>
              <tbody>
                <tr v-for="m in selectedMetricLabels" :key="m">
                  <td>{{ m }}</td>
                  <td v-for="d in selectedDimLabels" :key="d" class="num">{{ randVal() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="builder-panel builder-right">
          <h4>导出设置</h4>
          <el-form size="small" label-width="70px">
            <el-form-item label="文件格式">
              <el-radio-group v-model="builderConfig.format" size="small">
                <el-radio label="xlsx">Excel</el-radio>
                <el-radio label="pdf">PDF</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="builderConfig.dateRange"
                type="monthrange"
                range-separator="~"
                start-placeholder="起始月"
                end-placeholder="截止月"
                size="small"
                value-format="yyyy-MM"
                style="width:100%"
              />
            </el-form-item>
          </el-form>
          <el-button type="primary" size="small" icon="el-icon-view" :disabled="!builderConfig.metrics.length" style="margin-top:8px;width:100%" @click="handlePreviewCustom">
            预览报表
          </el-button>
          <el-button size="small" icon="el-icon-download" :disabled="!builderConfig.metrics.length" style="margin-top:6px;width:100%" @click="handleExport()">
            导出文件
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { saveAs } from 'file-saver'

export default {
  name: 'ReportExportView',
  data() {
    return {
      activeTab: 'template',
      previewVisible: false,
      previewTpl: null,
      builderConfig: { metrics: [], dimensions: [], format: 'xlsx', dateRange: ['2026-01', '2026-07'] },
      builderMetrics: [
        { key: 'total_tce', label: '综合能耗(tce)' }, { key: 'solid_fuel', label: '固体燃料(tce)' },
        { key: 'liquid_fuel', label: '液体燃料(tce)' }, { key: 'gas_fuel', label: '气体燃料(tce)' },
        { key: 'electricity', label: '电力(tce)' }, { key: 'heat', label: '热力(tce)' },
        { key: 'other_fuel', label: '其他燃料(tce)' }, { key: 'intensity', label: '单位产值能耗' }, { key: 'cost', label: '能源成本(万元)' }
      ],
      builderDimensions: [
        { key: 'time', label: '时间（月）' }, { key: 'workshop', label: '车间' }, { key: 'energy_type', label: '能源品类' }
      ],
      reportTableData: []
    }
  },
  computed: {
    ...mapState('energy', ['reportTemplates']),
    templates() {
      return this.reportTemplates.length ? this.reportTemplates : [
        { key: 'daily', label: '日报', desc: '当日用能概况', icon: 'el-icon-document' },
        { key: 'weekly', label: '周报', desc: '周用能统计 + 同比分析', icon: 'el-icon-data-line' },
        { key: 'monthly', label: '月报', desc: '月用能统计 + 结构图 + 单位产品能耗', icon: 'el-icon-data-analysis' }
      ]
    },
    nowStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    },
    selectedMetricLabels() { return this.builderMetrics.filter(m => this.builderConfig.metrics.includes(m.key)).map(m => m.label) },
    selectedDimLabels() { return this.builderDimensions.filter(d => this.builderConfig.dimensions.includes(d.key)).map(d => d.label) },
    estimatedRows() { return (this.builderConfig.metrics.length || 1) * (this.builderConfig.dimensions.length || 1) * 6 }
  },
  mounted() {
    this.fetchReportTemplates()
    this.buildReportData()
  },
  methods: {
    ...mapActions('energy', ['fetchReportTemplates']),
    randVal() { return (Math.random() * 100 + 20).toFixed(1) },
    handlePreview(tpl) {
      this.previewTpl = tpl
      this.buildReportData()
      this.previewVisible = true
    },
    handlePreviewCustom() {
      this.previewTpl = { key:'custom',label:'自定义报表' }
      this.buildReportData()
      this.previewVisible = true
    },
    buildReportData() {
      const sections = ['一车间A线','一车间B线','二车间C线','二车间D线','空压站','锅炉房','制冷站','综合办公楼']
      const data = sections.map((s, i) => ({
        date: `2026-07-${String((i+1)*3+1).padStart(2,'0')}`, section: s,
        solid: (280+Math.random()*40).toFixed(1), liquid: (80+Math.random()*20).toFixed(1),
        gas: (140+Math.random()*20).toFixed(1), electricity: (200+Math.random()*40).toFixed(1),
        heat: (60+Math.random()*15).toFixed(1), other: (15+Math.random()*8).toFixed(1),
        total: (800+Math.random()*120).toFixed(1)
      }))
      this.$set(this, 'reportTableData', data)
    },
    // 生成 Excel 可打开的 HTML 报表
    generateReportHtml(tpl) {
      const name = tpl?.label || '自定义报表'
      const rows = this.reportTableData.map(r =>
        `<tr><td>${r.date}</td><td>${r.section}</td><td>${r.solid}</td><td>${r.liquid}</td><td>${r.gas}</td><td>${r.electricity}</td><td>${r.heat}</td><td>${r.other}</td><td>${r.total}</td></tr>`
      ).join('')
      return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${name}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><h2>某某制造有限公司 — ${name}</h2><p>报表期间：2026年7月 | 生成时间：${this.nowStr}</p>
<table border="1" cellpadding="4" style="border-collapse:collapse">
<thead><tr><th>日期</th><th>用能单元</th><th>固体燃料(tce)</th><th>液体燃料(tce)</th><th>气体燃料(tce)</th><th>电力(tce)</th><th>热力(tce)</th><th>其他(tce)</th><th>合计(tce)</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`
    },
    handleExport(tpl) {
      if (!this.reportTableData.length) this.buildReportData()
      const format = this.builderConfig.format || 'xlsx'
      const name = tpl?.label || '报表'

      if (format === 'pdf') {
        this.exportPdf(name)
      } else {
        this.exportExcel(tpl || this.previewTpl, name)
      }
    },
    exportExcel(tpl, name) {
      const html = this.generateReportHtml(tpl || this.previewTpl)
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
      saveAs(blob, `${name}_2026年7月.xls`)
      this.$message.success('Excel 下载中...')
    },
    exportPdf(name) {
      // 打开打印预览，用户可在浏览器中选择"另存为PDF"
      const w = window.open('', '_blank', 'width=1000,height=800')
      if (!w) { this.$message.warning('请允许弹出窗口'); return }
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title>
<style>
  body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; color: #333; }
  h2 { text-align: center; font-size: 20px; margin-bottom: 4px; }
  h3 { text-align: center; font-size: 16px; color: #595959; margin-bottom: 16px; }
  .meta { text-align: center; font-size: 12px; color: #999; margin-bottom: 24px; }
  .meta span { margin: 0 16px; }
  h4 { font-size: 14px; border-left: 3px solid #1890FF; padding-left: 8px; margin: 24px 0 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: center; }
  th { background: #f5f5f5; font-weight: 600; }
  .num { font-family: Consolas, monospace; }
  .sum { font-weight: 600; color: #1890FF; }
  .summary-grid { display: flex; gap: 12px; flex-wrap: wrap; }
  .sum-item { flex: 0 0 150px; text-align: center; background: #f9f9f9; padding: 12px; border-radius: 4px; }
  .si-label { font-size: 11px; color: #999; }
  .si-val { font-size: 22px; font-weight: 600; }
  .si-unit { font-size: 11px; color: #999; }
  .ft { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
</style></head><body>
<h2>某某制造有限公司</h2><h3>${name}</h3>
<div class="meta"><span>报表期间：2026年7月</span><span>生成时间：${this.nowStr}</span><span>制表人：能源管理科</span></div>
<h4>一、用能概况</h4>
<div class="summary-grid">
  <div class="sum-item"><span class="si-label">综合能耗</span><span class="si-val">1,906.8</span><span class="si-unit">tce</span></div>
  <div class="sum-item"><span class="si-label">外购电力</span><span class="si-val">2,356,800</span><span class="si-unit">kWh</span></div>
  <div class="sum-item"><span class="si-label">天然气</span><span class="si-val">45.8</span><span class="si-unit">万m³</span></div>
  <div class="sum-item"><span class="si-label">原煤</span><span class="si-val">1,256.8</span><span class="si-unit">t</span></div>
  <div class="sum-item"><span class="si-label">蒸汽</span><span class="si-val">8,560</span><span class="si-unit">t</span></div>
  <div class="sum-item"><span class="si-label">柴油</span><span class="si-val">22.5</span><span class="si-unit">t</span></div>
</div>
<h4>二、用能数据明细</h4>
${this.generateReportTableHtml()}
<h4>三、同比分析</h4>
<table><thead><tr><th>指标</th><th>本期</th><th>去年同期</th><th>变化率</th></tr></thead>
<tbody>
<tr><td>综合能耗(tce)</td><td class="num">1,906.8</td><td class="num">1,842.3</td><td class="num">+3.5%</td></tr>
<tr><td>单位产值能耗(tce/万元)</td><td class="num">0.38</td><td class="num">0.40</td><td class="num">-5.0%</td></tr>
<tr><td>清洁能源占比</td><td class="num">35.8%</td><td class="num">32.1%</td><td class="num">+3.7%</td></tr>
</tbody></table>
<div class="ft"><p>审核：________ &emsp; 批准：________ &emsp; 日期：________</p><p>本报表由能碳数字化管理平台自动生成</p></div>
</body></html>`
      w.document.write(html)
      w.document.close()
      setTimeout(() => w.print(), 500)
    },
    generateReportTableHtml() {
      const rows = this.reportTableData.map(r =>
        `<tr><td>${r.date}</td><td>${r.section}</td><td class="num">${r.solid}</td><td class="num">${r.liquid}</td><td class="num">${r.gas}</td><td class="num">${r.electricity}</td><td class="num">${r.heat}</td><td class="num">${r.other}</td><td class="num sum">${r.total}</td></tr>`
      ).join('')
      return `<table><thead><tr><th>日期</th><th>用能单元</th><th>固体燃料(tce)</th><th>液体燃料(tce)</th><th>气体燃料(tce)</th><th>电力(tce)</th><th>热力(tce)</th><th>其他(tce)</th><th>合计(tce)</th></tr></thead><tbody>${rows}</tbody></table>`
    }
  }
}
</script>

<style lang="scss" scoped>
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: $gutter; margin-top: $spacing-md; }
.template-card {
  background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow;
  display: flex; flex-direction: column; align-items: center; text-align: center; transition: all $transition-duration;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  &__icon { width:64px;height:64px;border-radius:50%;background:rgba($primary-color,0.08);display:flex;align-items:center;justify-content:center;margin-bottom:16px;
    i { font-size:28px;color:$primary-color; }
  }
  &__body { h4 { font-family:$font-title;font-size:$font-size-16;color:$text-primary;margin-bottom:8px; } p { font-size:13px;color:$text-secondary; } }
  &__actions { display:flex;gap:8px;margin-top:16px; }
}

/* ===== 报表文档样式 ===== */
.report-document {
  background: #fff; padding: 32px 40px; font-size: 13px; color: #333; line-height: 1.8;
  max-height: 70vh; overflow-y: auto;
}
.report-hd { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px;
  h2 { font-size: 18px; margin: 0 0 4px; }
  h3 { font-size: 16px; margin: 0 0 12px; color: #595959; }
}
.report-meta { display: flex; justify-content: center; gap: 32px; font-size: 12px; color: #8c8c8c; }
.report-section { margin-bottom: 24px;
  h4 { font-size: 14px; font-weight: 600; margin-bottom: 12px; border-left: 3px solid $primary-color; padding-left: 8px; }
}
.summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.sum-item {
  text-align: center; background: #fafafa; border-radius: 4px; padding: 12px 8px;
  .si-label { display: block; font-size: 11px; color: #8c8c8c; margin-bottom: 4px; }
  .si-val { display: block; font-size: 22px; font-family: $font-d-din; color: #333; }
  .si-unit { font-size: 11px; color: #8c8c8c; }
}
.pie-text { display: flex; flex-wrap: wrap; gap: 12px 24px; padding: 8px 0; }
.pie-item { font-size: 13px; display: flex; align-items: center; gap: 6px; }
.pie-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.report-chart-wrap { background: #fafafa; border-radius: 4px; padding: 16px; }

.report-table { width: 100%; border-collapse: collapse; font-size: 11px;
  th, td { border: 1px solid #e8e8e8; padding: 6px 8px; text-align: center; }
  th { background: #f5f5f5; font-weight: 600; }
  .num { font-family: $font-d-din; }
  .sum-col { font-weight: 600; color: $primary-color; }
}
.report-ft { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e8e8e8; text-align: center; font-size: 12px; color: #8c8c8c; }
.trend-up { color: $danger-color; font-weight: 600; }
.trend-down { color: $success-color; font-weight: 600; }

/* ===== Builder ===== */
.builder-layout { display: flex; gap: $gutter; margin-top: $spacing-md; }
.builder-panel { background: $background-white; border-radius: $card-radius; padding: $card-padding; box-shadow: $card-shadow; }
.builder-left { flex:1; max-width:180px; }
.builder-center { flex:2; min-width: 300px; }
.builder-right { flex:1; max-width:280px; }
.builder-panel h4 { font-family:$font-title;font-size:$font-size-14;color:$text-primary;margin-bottom:12px; }
.metric-item { margin-bottom:6px; }
.preview-placeholder { padding:12px; }
.report-table.mini { font-size: 11px; }
</style>
