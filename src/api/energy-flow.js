import request from './request'

// 能流图数据（桑基图）
export function getFlowData(params) {
  return request({ url: '/energy-flow/data', method: 'get', params })
}

// 能量平衡数据
export function getEnergyBalance(params) {
  return request({ url: '/energy-flow/balance', method: 'get', params })
}

// 损失分析
export function getLossAnalysis(params) {
  return request({ url: '/energy-flow/loss', method: 'get', params })
}
