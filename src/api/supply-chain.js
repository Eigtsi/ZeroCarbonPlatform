import request from './request'

// 供应商列表
export function getSupplierList(params) {
  return request({ url: '/supply-chain/suppliers', method: 'get', params })
}

// 供应商碳排放数据
export function getSupplierEmission(id) {
  return request({ url: `/supply-chain/suppliers/${id}/emission`, method: 'get' })
}

// 添加供应商
export function addSupplier(data) {
  return request({ url: '/supply-chain/suppliers', method: 'post', data })
}

// 更新供应商
export function updateSupplier(id, data) {
  return request({ url: `/supply-chain/suppliers/${id}`, method: 'put', data })
}

// 供应商评级
export function getSupplierRating(params) {
  return request({ url: '/supply-chain/rating', method: 'get', params })
}

// 减排项目列表
export function getReductionProjects(params) {
  return request({ url: '/supply-chain/projects', method: 'get', params })
}
