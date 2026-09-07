import request from './request'

// 预算列表
export function getBudgetList(params) {
  return request({ url: '/budget/list', method: 'get', params })
}

// 创建预算
export function createBudget(data) {
  return request({ url: '/budget/create', method: 'post', data })
}

// 更新预算
export function updateBudget(id, data) {
  return request({ url: `/budget/${id}`, method: 'put', data })
}

// 预算执行进度
export function getBudgetProgress(params) {
  return request({ url: '/budget/progress', method: 'get', params })
}

// 预算预测预警
export function getBudgetForecast(params) {
  return request({ url: '/budget/forecast', method: 'get', params })
}
