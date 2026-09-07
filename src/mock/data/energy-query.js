// ===== 能耗查询模块 Mock 数据 =====
// 基于完整工厂数据模型V3：39个计量点、5级组织架构、15种能源品种

// ---- 5级组织架构树 ----
const orgTree = [
  {
    id: 'group_01', label: '某某控股集团', level: 1,
    children: [
      {
        id: 'company_01', label: '某某制造有限公司', level: 2,
        children: [
          {
            id: 'workshop_01', label: '一车间（机加工）', level: 3,
            children: [
              {
                id: 'line_a', label: 'A线（精加工）', level: 4,
                children: [
                  { id: 'eq_mc01', label: 'CNC加工中心 MC-01', level: 5, meterId: 'M05' },
                  { id: 'eq_lt01', label: '数控车床 LT-01', level: 5, meterId: 'M06' },
                  { id: 'eq_ml01', label: '铣床 ML-01', level: 5 }
                ]
              },
              {
                id: 'line_b', label: 'B线（粗加工）', level: 4,
                children: [
                  { id: 'eq_gr01', label: '磨床 GR-01', level: 5 },
                  { id: 'eq_br01', label: '镗床 BR-01', level: 5 },
                  { id: 'eq_cl01', label: '清洗机 CL-01', level: 5 }
                ]
              }
            ]
          },
          {
            id: 'workshop_02', label: '二车间（热处理+表面处理）', level: 3,
            children: [
              {
                id: 'line_c', label: 'C线（热处理）', level: 4,
                children: [
                  { id: 'eq_ht01', label: '淬火炉 HT-01', level: 5, meterId: 'M07' },
                  { id: 'eq_ht02', label: '回火炉 HT-02', level: 5, meterId: 'M07b' },
                  { id: 'eq_qc01', label: '质检台 QC-01', level: 5 }
                ]
              },
              {
                id: 'line_d', label: 'D线（电镀）', level: 4,
                children: [
                  { id: 'eq_ep01', label: '电镀槽 EP-01', level: 5, meterId: 'M08b' },
                  { id: 'eq_re01', label: '整流器 RE-01', level: 5 },
                  { id: 'eq_dr01', label: '干燥炉 DR-01', level: 5 }
                ]
              }
            ]
          },
          {
            id: 'workshop_03', label: '三车间（装配+包装）', level: 3,
            children: [
              {
                id: 'line_e', label: 'E线（装配包装）', level: 4,
                children: [
                  { id: 'eq_rb01', label: '装配机器人 RB-01', level: 5 },
                  { id: 'eq_tr01', label: '自动码垛机 TR-01', level: 5 },
                  { id: 'eq_pk01', label: '包装机 PK-01', level: 5 }
                ]
              }
            ]
          },
          {
            id: 'utility_01', label: '公用工程区', level: 3,
            children: [
              {
                id: 'util_comp', label: '空压站', level: 4,
                children: [
                  { id: 'eq_ac01', label: '离心式空压机 AC-01(250kW)', level: 5, meterId: 'M16' },
                  { id: 'eq_ac02', label: '螺杆式空压机 AC-02(132kW)', level: 5, meterId: 'M17' },
                  { id: 'eq_ad01', label: '冷冻式干燥机 AD-01', level: 5 }
                ]
              },
              {
                id: 'util_chiller', label: '冷冻站', level: 4,
                children: [
                  { id: 'eq_ch01', label: '离心式冷水机组 CH-01(1200kW)', level: 5, meterId: 'M21' },
                  { id: 'eq_ch02', label: '螺杆式冷水机组 CH-02(800kW)', level: 5, meterId: 'M22' },
                  { id: 'eq_ct01', label: '冷却塔 CT-01', level: 5 },
                  { id: 'eq_ct02', label: '冷却塔 CT-02', level: 5 }
                ]
              },
              {
                id: 'util_boiler', label: '锅炉房', level: 4,
                children: [
                  { id: 'eq_bl01', label: '燃气锅炉 BL-01(6t/h)', level: 5, meterId: 'M10' },
                  { id: 'eq_bl02', label: '燃煤锅炉 BL-02(4t/h)', level: 5, meterId: 'M12' }
                ]
              },
              {
                id: 'util_water', label: '水处理站', level: 4,
                children: [
                  { id: 'eq_pw01', label: '纯水机组 PW-01', level: 5, meterId: 'M25' },
                  { id: 'eq_cp01', label: '循环水泵 CP-01', level: 5, meterId: 'M24' }
                ]
              },
              {
                id: 'util_env', label: '环保设施', level: 4,
                children: [
                  { id: 'eq_rt01', label: 'RTO蓄热式焚烧炉 RT-01', level: 5, meterId: 'M26' },
                  { id: 'eq_ww01', label: '污水处理站 WW-01', level: 5, meterId: 'M27' }
                ]
              }
            ]
          },
          {
            id: 'renewable_01', label: '新能源区', level: 3,
            children: [
              {
                id: 'renew_pv', label: '光伏系统(2MWp)', level: 4,
                children: [
                  { id: 'eq_inv01', label: '逆变器 INV-01(500kW)', level: 5, meterId: 'M31' },
                  { id: 'eq_inv02', label: '逆变器 INV-02(500kW)', level: 5 },
                  { id: 'eq_cb01', label: '汇流箱 CB-01', level: 5, meterId: 'M32' }
                ]
              },
              {
                id: 'renew_bess', label: '储能系统(500kW/1MWh)', level: 4,
                children: [
                  { id: 'eq_pcs01', label: '储能变流器 PCS-01(500kW)', level: 5, meterId: 'M33' },
                  { id: 'eq_bat01', label: '电池柜 BAT-01', level: 5, meterId: 'M34' }
                ]
              }
            ]
          },
          {
            id: 'auxiliary_01', label: '办公生活区', level: 3,
            children: [
              { id: 'aux_office', label: '综合办公楼', level: 4, children: [], meterId: 'M28' },
              { id: 'aux_canteen', label: '员工食堂', level: 4, children: [], meterId: 'M29' },
              { id: 'aux_dorm', label: '员工宿舍', level: 4, children: [], meterId: 'M30' }
            ]
          }
        ]
      }
    ]
  }
]

// ---- 模拟数据生成器 ----
let _kpiSeed = 0
function generateDashboardKpis() {
  _kpiSeed++
  const jitter = (base, pct) => (base * (1 + (Math.random() - 0.5) * pct / 100)).toFixed(2)
  return {
    totalEnergy: { value: jitter(156.82, 2), unit: 'tce', trend: { value: (2.5 + Math.random() * 2).toFixed(1), type: 'up' } },
    realtimePower: { value: jitter(2450, 5), unit: 'kW' },
    cleanEnergyRatio: { value: jitter(35.8, 7), unit: '%', trend: { value: (1.0 + Math.random()).toFixed(1), type: 'up' } },
    activeAlarms: { value: Math.floor(5 + Math.random() * 5), unit: '条' },
    monthEnergy: { value: jitter(3856.45, 1), unit: 'tce', trend: { value: (2.1).toFixed(1), type: 'down' } },
    yearEnergy: { value: jitter(28568.30, 1), unit: 'tce', trend: { value: (4.5 + Math.random()).toFixed(1), type: 'down' } }
  }
}

function generateLoadCurve() {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  // 模拟工厂日负荷曲线：白天高，夜间低
  const baseLoad = [0.3, 0.25, 0.2, 0.2, 0.25, 0.35, 0.55, 0.75, 0.9, 0.95, 1.0, 0.95, 0.85, 0.9, 0.95, 0.9, 0.8, 0.7, 0.75, 0.8, 0.7, 0.55, 0.45, 0.35]
  return {
    xAxis: hours,
    series: [
      { name: '电网', type: 'line', data: baseLoad.map(v => (v * 2000 + Math.random() * 200).toFixed(0)), areaStyle: { color: 'rgba(24,144,255,0.15)' }, itemStyle: { color: '#1890FF' } },
      { name: '光伏', type: 'line', data: baseLoad.map((v, i) => i >= 6 && i <= 18 ? (v * 500 + Math.random() * 100).toFixed(0) : 0), areaStyle: { color: 'rgba(250,204,20,0.15)' }, itemStyle: { color: '#FACC14' } }
    ]
  }
}

function generateTopConsumers() {
  const depts = [
    { name: '一车间A线', value: 325.6, percent: 22.8, color: '#1890FF' },
    { name: '一车间B线', value: 268.4, percent: 18.8, color: '#2FC25B' },
    { name: '二车间C线', value: 245.2, percent: 17.2, color: '#FACC14' },
    { name: '空压站', value: 198.7, percent: 13.9, color: '#FA8C16' },
    { name: '冷冻站', value: 156.3, percent: 10.9, color: '#722ED1' }
  ]
  return depts.map(d => ({ ...d, value: (d.value + (Math.random() - 0.5) * 10).toFixed(1) }))
}

function generateEnergyTrend(dimension) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
  const xAxis = dimension === 'month' ? months : dimension === 'day' ? days : ['Q1', 'Q2', 'Q3', 'Q4']
  const len = xAxis.length
  return {
    xAxis,
    legend: ['煤炭', '天然气', '电力', '蒸汽'],
    series: [
      { name: '煤炭', type: 'line', smooth: true, data: Array.from({ length: len }, () => (280 + Math.random() * 80).toFixed(0)), itemStyle: { color: '#8B572A' } },
      { name: '天然气', type: 'line', smooth: true, data: Array.from({ length: len }, () => (100 + Math.random() * 50).toFixed(0)), itemStyle: { color: '#2FC25B' } },
      { name: '电力', type: 'line', smooth: true, data: Array.from({ length: len }, () => (200 + Math.random() * 60).toFixed(0)), itemStyle: { color: '#1890FF' } },
      { name: '蒸汽', type: 'line', smooth: true, data: Array.from({ length: len }, () => (60 + Math.random() * 30).toFixed(0)), itemStyle: { color: '#FACC14' } }
    ]
  }
}

function generateEnergyPie() {
  return [
    { value: 3240, name: '煤炭', itemStyle: { color: '#8B572A' } },
    { value: 1860, name: '天然气', itemStyle: { color: '#2FC25B' } },
    { value: 2560, name: '电力', itemStyle: { color: '#1890FF' } },
    { value: 880, name: '蒸汽', itemStyle: { color: '#FACC14' } },
    { value: 120, name: '柴油', itemStyle: { color: '#CD853F' } }
  ]
}

function generateQueryResults(params) {
  const page = params?.page || 1
  const size = params?.size || 20
  const total = 156
  const list = []
  const startIdx = (page - 1) * size
  const endIdx = Math.min(startIdx + size, total)

  const sections = ['一车间A线', '一车间B线', '二车间C线', '二车间D线', '三车间E线', '空压站', '冷冻站', '锅炉房']
  const energyItems = [
    { type: 'raw_coal', label: '原煤', unit: 't', factor: 0.7143, color: '#4A4A4A' },
    { type: 'natural_gas', label: '天然气', unit: '万m³', factor: 12.143, color: '#2FC25B' },
    { type: 'grid_power', label: '电网购电', unit: '万kWh', factor: 1.229, color: '#1890FF' },
    { type: 'steam_low', label: '低压蒸汽', unit: 't', factor: 0.09, color: '#FFE88C' },
    { type: 'diesel', label: '柴油', unit: 't', factor: 1.4571, color: '#CD853F' }
  ]

  for (let i = startIdx; i < endIdx; i++) {
    const item = energyItems[i % energyItems.length]
    const amount = (Math.random() * 500 + 10).toFixed(2)
    const tce = (amount * item.factor).toFixed(2)
    const date = new Date(2026, 6, Math.floor(Math.random() * 31) + 1)
    list.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      section: sections[i % sections.length],
      energyType: item.type,
      energyLabel: item.label,
      amount: amount,
      unit: item.unit,
      factor: item.factor,
      tce: tce,
      color: item.color,
      meterId: `M${String(Math.floor(Math.random() * 34) + 1).padStart(2, '0')}`,
      collectionPriority: ['P0', 'P1', 'P2', 'P3'][Math.floor(Math.random() * 4)]
    })
  }
  return { list, total, page, size }
}

function generateCompareData() {
  return [
    { label: '综合能耗同比', current: 156.82, compare: 162.30, unit: 'tce', compareLabel: '去年同期' },
    { label: '煤炭消耗同比', current: 45.60, compare: 42.80, unit: 't', compareLabel: '去年同期' },
    { label: '电力消耗同比', current: 12580, compare: 11800, unit: 'kWh', compareLabel: '去年同期' },
    { label: '综合能耗环比', current: 156.82, compare: 148.50, unit: 'tce', compareLabel: '上月同期' }
  ]
}

function generateAlarms(params) {
  const page = params?.page || 1
  const size = params?.size || 10
  const sources = ['锅炉房BL-01', '空压站AC-01', '配电室', '一车间A线', '冷冻站CH-01', '淬火炉HT-01', '污水处理站']
  const types = ['surge', 'meter_offline', 'quota_exceed', 'standby_waste', 'power_factor', 'process_anomaly']
  const levels = { surge: 'red', meter_offline: 'red', quota_exceed: 'yellow', standby_waste: 'yellow', power_factor: 'blue', process_anomaly: 'blue' }
  const levelTexts = { red: '预警', yellow: '提醒', blue: '稳定' }
  const typeLabels = { surge: '能耗突增', meter_offline: '仪表失联', quota_exceed: '能耗超标', standby_waste: '待机空耗', power_factor: '功率因数异常', process_anomaly: '工艺参数异常' }
  const statuses = ['triggered', 'confirmed', 'processing', 'processing', 'resolved', 'resolved', 'resolved', 'closed']
  const statusLabels = { triggered: '已触发', confirmed: '已确认', processing: '处理中', resolved: '已关闭', closed: '已归档' }

  const list = []
  const total = 37
  for (let i = 0; i < Math.min(size, total - (page - 1) * size); i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const date = new Date(2026, 6, Math.floor(Math.random() * 31) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
    list.push({
      id: i + 1 + (page - 1) * size,
      time: date.toISOString().replace('T', ' ').substring(0, 16),
      source: sources[Math.floor(Math.random() * sources.length)],
      content: `${typeLabels[type]}：${['当前值超出阈值', '连续3次检测异常', '设备运行异常'][Math.floor(Math.random() * 3)]}`,
      level: levels[type],
      levelText: levelTexts[levels[type]],
      type: type,
      typeLabel: typeLabels[type],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      statusLabel: statusLabels[statuses[Math.floor(Math.random() * statuses.length)]],
      currentValue: (Math.random() * 200 + 50).toFixed(1),
      threshold: (Math.random() * 150 + 100).toFixed(1),
      unit: ['kW', 't', 'm³', '%'][Math.floor(Math.random() * 4)]
    })
  }
  return { list, total, page, size }
}

function generateAlarmStats() {
  return { total: 37, red: 8, yellow: 15, blue: 14, triggered: 5, confirmed: 8, processing: 10, resolved: 12, closed: 2 }
}

function generateMeterSource(meterId) {
  return {
    meterId,
    meterName: `计量点 ${meterId}`,
    meterType: '智能电表',
    model: '安科瑞 APM810',
    protocol: 'Modbus TCP',
    installLocation: '一车间A线配电柜',
    calibrationDate: '2025-12-15',
    calibrationValid: '2026-12-14',
    accuracy: '0.5S',
    readings: Array.from({ length: 10 }, (_, i) => ({
      time: `2026-07-${String(15 - i).padStart(2, '0')} ${String(8 + i).padStart(2, '0')}:00`,
      value: (12500 + i * 35 + Math.random() * 10).toFixed(2),
      unit: 'kWh',
      status: '正常',
      hash: `0x${Math.random().toString(16).substring(2, 10)}`
    })),
    auditLog: [
      { time: '2026-07-10 14:30', operator: '张工', action: '人工修正', before: '12680.00', after: '12650.00', reason: '仪表倒转异常' },
      { time: '2026-07-05 09:15', operator: '李工', action: '数据补录', before: '--', after: '12550.00', reason: '采集中断恢复' }
    ]
  }
}

// ---- 导出 Mock 数据 ----
export default {
  // 基础数据
  '/energy/org-tree': { code: 200, data: orgTree },

  // 实时看板
  '/energy/dashboard/kpis': () => ({ code: 200, data: generateDashboardKpis() }),
  '/energy/dashboard/load-curve': () => ({ code: 200, data: generateLoadCurve() }),
  '/energy/dashboard/top-consumers': () => ({ code: 200, data: generateTopConsumers() }),
  '/energy/dashboard/energy-trend': (params) => ({ code: 200, data: generateEnergyTrend(params?.dimension || 'month') }),
  '/energy/dashboard/energy-pie': () => ({ code: 200, data: generateEnergyPie() }),

  // 数据查询
  '/energy/query/results': (params) => ({ code: 200, data: generateQueryResults(params) }),
  '/energy/query/compare': () => ({ code: 200, data: generateCompareData() }),
  '/energy/query/meter-source': (params) => ({ code: 200, data: generateMeterSource(params?.meterId || 'M05') }),

  // 告警
  '/energy/alarm/list': (params) => ({ code: 200, data: generateAlarms(params) }),
  '/energy/alarm/stats': () => ({ code: 200, data: generateAlarmStats() }),

  // 报表
  '/energy/report/templates': {
    code: 200,
    data: [
      { key: 'daily', label: '日报', desc: '当日用能概况', icon: 'el-icon-document' },
      { key: 'weekly', label: '周报', desc: '周用能统计 + 同比分析', icon: 'el-icon-data-line' },
      { key: 'monthly', label: '月报', desc: '月用能统计 + 结构图 + 单位产品能耗', icon: 'el-icon-data-analysis' }
    ]
  }
}
