import request from './request'

// 碳排放核算 - Scope 1
export function getScope1Data(params) {
  return request({ url: '/carbon-accounting/scope1', method: 'get', params })
}

// 碳排放核算 - Scope 2
export function getScope2Data(params) {
  return request({ url: '/carbon-accounting/scope2', method: 'get', params })
}

// 碳排放核算 - Scope 3
export function getScope3Data(params) {
  return request({ url: '/carbon-accounting/scope3', method: 'get', params })
}

// 排放汇总
export function getEmissionSummary(params) {
  return request({ url: '/carbon-accounting/summary', method: 'get', params })
}

// 生成碳排放报告
export function generateReport(params) {
  return request({ url: '/carbon-accounting/report', method: 'post', params })
}
