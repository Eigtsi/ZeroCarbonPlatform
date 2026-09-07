import request from './request'

// 配额管理
export function getQuotaBalance(params) {
  return request({ url: '/carbon-asset/quota', method: 'get', params })
}

// CCER资产列表
export function getCCERList(params) {
  return request({ url: '/carbon-asset/ccer', method: 'get', params })
}

// 履约管理
export function getComplianceStatus(params) {
  return request({ url: '/carbon-asset/compliance', method: 'get', params })
}

// 碳排放预测
export function getEmissionForecast(params) {
  return request({ url: '/carbon-asset/forecast', method: 'get', params })
}

// 配额交易记录
export function getQuotaTransactions(params) {
  return request({ url: '/carbon-asset/transactions', method: 'get', params })
}
