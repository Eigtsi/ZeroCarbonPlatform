import request from './request'

// ===== 基础数据 =====
// 获取组织架构树
export function getOrgTree() {
  return request({ url: '/energy/org-tree', method: 'get' })
}

// ===== 实时看板 =====
// 获取看板KPI数据
export function getDashboardKpis() {
  return request({ url: '/energy/dashboard/kpis', method: 'get' })
}

// 获取24h负荷曲线
export function getLoadCurve() {
  return request({ url: '/energy/dashboard/load-curve', method: 'get' })
}

// 获取Top5能耗排名
export function getTopConsumers() {
  return request({ url: '/energy/dashboard/top-consumers', method: 'get' })
}

// 获取能耗趋势数据
export function getEnergyTrend(params) {
  return request({ url: '/energy/dashboard/energy-trend', method: 'get', params })
}

// 获取能源结构饼图数据
export function getEnergyPie() {
  return request({ url: '/energy/dashboard/energy-pie', method: 'get' })
}

// ===== 数据查询 =====
// 统一查询接口
export function queryEnergyData(params) {
  return request({ url: '/energy/query/results', method: 'get', params })
}

// 同比环比数据
export function getCompareData(params) {
  return request({ url: '/energy/query/compare', method: 'get', params })
}

// 原始仪表数据追溯
export function getMeterSource(meterId) {
  return request({ url: '/energy/query/meter-source', method: 'get', params: { meterId } })
}

// ===== 实时能耗（兼容旧接口）=====
export function getRealtimeData() {
  return request({ url: '/energy/realtime', method: 'get' })
}

// 历史能耗数据查询（兼容旧接口）
export function getHistoryData(params) {
  return request({ url: '/energy/history', method: 'get', params })
}

// 能耗趋势数据（兼容旧接口）
export function getTrendData(params) {
  return request({ url: '/energy/trend', method: 'get', params })
}

// ===== 告警 =====
// 告警列表
export function getAlarmList(params) {
  return request({ url: '/energy/alarm/list', method: 'get', params })
}

// 告警统计
export function getAlarmStats() {
  return request({ url: '/energy/alarm/stats', method: 'get' })
}

// 处理告警
export function handleAlarm(id) {
  return request({ url: `/energy/alarm/${id}/handle`, method: 'post' })
}

// ===== 报表 =====
// 获取报表模板
export function getReportTemplates() {
  return request({ url: '/energy/report/templates', method: 'get' })
}

// 导出能耗数据
export function exportEnergyData(params) {
  return request({ url: '/energy/export', method: 'get', params, responseType: 'blob' })
}
