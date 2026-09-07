import request from './request'

// 用能结构分析
export function getEnergyStructure(params) {
  return request({ url: '/energy-analysis/structure', method: 'get', params })
}

// 用能成本分析
export function getEnergyCost(params) {
  return request({ url: '/energy-analysis/cost', method: 'get', params })
}

// 设备能效分析
export function getEquipmentEfficiency(params) {
  return request({ url: '/energy-analysis/equipment-efficiency', method: 'get', params })
}

// 异常诊断列表
export function getAnomalyDiagnosis(params) {
  return request({ url: '/energy-analysis/anomaly', method: 'get', params })
}

// AI策略推荐
export function getStrategyRecommendation(params) {
  return request({ url: '/energy-analysis/strategy', method: 'get', params })
}
