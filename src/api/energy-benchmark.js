import request from './request'

// 能效对标数据
export function getBenchmarkData(params) {
  return request({ url: '/benchmark/data', method: 'get', params })
}

// 行业标杆对比
export function getIndustryBenchmark(params) {
  return request({ url: '/benchmark/industry', method: 'get', params })
}

// 能效等级评定
export function getEfficiencyRating(params) {
  return request({ url: '/benchmark/rating', method: 'get', params })
}

// 差距分析
export function getGapAnalysis(params) {
  return request({ url: '/benchmark/gap', method: 'get', params })
}

// 设定节能目标
export function setEnergyTarget(data) {
  return request({ url: '/benchmark/target', method: 'post', data })
}
