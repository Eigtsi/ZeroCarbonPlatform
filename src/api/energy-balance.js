import request from './request'

// 能量平衡计算
export function getBalanceCalc(params) {
  return request({ url: '/energy-balance/calc', method: 'get', params })
}

// 热效率计算
export function getThermalEfficiency(params) {
  return request({ url: '/energy-balance/thermal-efficiency', method: 'get', params })
}

// 平衡校验
export function verifyBalance(data) {
  return request({ url: '/energy-balance/verify', method: 'post', data })
}
