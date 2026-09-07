import request from './request'

// 综合能耗计算
export function getConsumptionCalc(params) {
  return request({ url: '/energy-consumption/calc', method: 'get', params })
}

// 能耗强度计算
export function getIntensityCalc(params) {
  return request({ url: '/energy-consumption/intensity', method: 'get', params })
}

// 能效排名
export function getEfficiencyRanking(params) {
  return request({ url: '/energy-consumption/ranking', method: 'get', params })
}

// 能耗强度趋势
export function getIntensityTrend(params) {
  return request({ url: '/energy-consumption/intensity-trend', method: 'get', params })
}

// 目标考核数据
export function getTargetAssessment(params) {
  return request({ url: '/energy-consumption/target', method: 'get', params })
}
