// Mock 数据入口
// 开发阶段通过此文件提供模拟数据，生产环境移除
import energyQueryMock from './data/energy-query'

const mockData = {
  // 实时能耗（旧接口兼容）
  '/energy/realtime': {
    code: 200,
    data: {
      todayEnergy: 156.82,
      monthEnergy: 3856.45,
      yearEnergy: 42568.30,
      todayTrend: { value: 3.2, type: 'up' },
      monthTrend: { value: 2.1, type: 'down' },
      yearTrend: { value: 5.6, type: 'down' },
      byType: {
        coal: { today: 45.60, month: 1256.80, unit: 't', trend: { value: 2.3, type: 'up' } },
        gas: { today: 3200, month: 96000, unit: 'm³', trend: { value: 1.5, type: 'down' } },
        electricity: { today: 12580, month: 376000, unit: 'kWh', trend: { value: 3.1, type: 'up' } },
        steam: { today: 18.50, month: 556, unit: 't', trend: { value: 0.8, type: 'down' } }
      }
    }
  },

  // 综合能耗计算
  '/energy-consumption/calc': {
    code: 200,
    data: {
      items: [
        { label: '煤炭', consumption: '1,256.80', rawUnit: 't', factor: 0.7143, tce: '897.92', color: '#8B572A' },
        { label: '天然气', consumption: '458,000', rawUnit: 'm³', factor: 1.33, tce: '609.14', color: '#2FC25B' },
        { label: '电力', consumption: '2,356,800', rawUnit: 'kWh', factor: 0.1229, tce: '289.68', color: '#1890FF' },
        { label: '蒸汽', consumption: '8,560', rawUnit: 't', factor: 0.1286, tce: '110.04', color: '#FACC14' }
      ],
      totalTce: '1,906.78'
    }
  },

  // 碳排放汇总
  '/carbon-accounting/summary': {
    code: 200,
    data: {
      total: 12856.50,
      scope1: 5240.00,
      scope2: 4860.50,
      scope3: 2756.00
    }
  },

  // 预算执行进度
  '/budget/progress': {
    code: 200,
    data: [
      { name: '用能预算', budget: 5000, used: 3400, percent: 68 },
      { name: '碳排放预算', budget: 10000, used: 7200, percent: 72 },
      { name: '煤炭配额', budget: 2000, used: 1700, percent: 85 },
      { name: '电力预算', budget: 3000000, used: 1620000, percent: 54 }
    ]
  },

  // 配额管理
  '/carbon-asset/quota': {
    code: 200,
    data: {
      totalQuota: 15000,
      usedQuota: 10000,
      remainQuota: 2340,
      bankedQuota: 2660,
      complianceYear: '2026'
    }
  }
}

// 合并 energy-query mock 数据
const allMocks = { ...mockData, ...energyQueryMock }

// Mock 拦截器（开发模式下使用）
// 通过 axios 请求拦截器为每个匹配的请求注入 mock adapter
export function setupMock(axiosInstance) {
  if (process.env.NODE_ENV !== 'development') return

  axiosInstance.interceptors.request.use(function (config) {
    const url = config.url || ''
    const mockKey = url.replace(/^\/api/, '') || url

    if ((config.method || 'get').toLowerCase() !== 'get') return config

    const mockItem = allMocks[mockKey]
    if (!mockItem) return config

    // 为匹配的请求注入自定义 adapter，阻止真实 HTTP 请求
    config.adapter = function () {
      const response = typeof mockItem === 'function'
        ? mockItem(config.params)
        : { code: 200, data: mockItem.data !== undefined ? mockItem.data : mockItem }
      return Promise.resolve({
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
        request: {}
      })
    }

    return config
  })
}

export default mockData
