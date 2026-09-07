import request from './request'

// 产品列表
export function getProductList(params) {
  return request({ url: '/carbon-footprint/products', method: 'get', params })
}

// 碳足迹计算
export function calcFootprint(data) {
  return request({ url: '/carbon-footprint/calc', method: 'post', data })
}

// 碳足迹详情
export function getFootprintDetail(params) {
  return request({ url: '/carbon-footprint/detail', method: 'get', params })
}

// 敏感性分析
export function getSensitivityAnalysis(params) {
  return request({ url: '/carbon-footprint/sensitivity', method: 'get', params })
}

// 生成碳足迹报告
export function generateFootprintReport(params) {
  return request({ url: '/carbon-footprint/report', method: 'post', params })
}
