// ===== 能源管理 Vuex 模块 =====
// 开发环境下直接在 Action 中返回 Mock 数据，无需 HTTP 拦截

// ---- Mock 数据生成器 ----
let _seed = 0
const jitter = (base, pct) => (base * (1 + (Math.random() - 0.5) * pct / 100)).toFixed(2)

function mockDashboardKpis() {
  return {
    totalEnergy: { value: jitter(156.82, 2), unit: 'tce', trend: { value: (2.5 + Math.random() * 2).toFixed(1), type: 'up' } },
    realtimePower: { value: jitter(2450, 5), unit: 'kW' },
    cleanEnergyRatio: { value: jitter(35.8, 7), unit: '%', trend: { value: (1.5).toFixed(1), type: 'up' } },
    activeAlarms: { value: Math.floor(5 + Math.random() * 5), unit: '条' },
    monthEnergy: { value: jitter(3856.45, 1), unit: 'tce', trend: { value: '2.1', type: 'down' } },
    yearEnergy: { value: jitter(28568.30, 1), unit: 'tce', trend: { value: (4.5 + Math.random()).toFixed(1), type: 'down' } }
  }
}

function mockLoadCurve() {
  const base = [0.30,0.25,0.20,0.20,0.25,0.35,0.55,0.75,0.90,0.95,1.00,0.95,0.85,0.90,0.95,0.90,0.80,0.70,0.75,0.80,0.70,0.55,0.45,0.35]
  return {
    xAxis: Array.from({length:24},(_,i)=>`${i}:00`),
    series: [
      { name:'电网',type:'line',symbol:'none',smooth:true, data:base.map(v=>(v*2000+Math.random()*100).toFixed(0)), areaStyle:{color:'rgba(24,144,255,0.15)'},itemStyle:{color:'#1890FF'} },
      { name:'光伏',type:'line',symbol:'none',smooth:true, data:base.map((v,i)=>i>=6&&i<=18?(v*500+Math.random()*50).toFixed(0):'0'), areaStyle:{color:'rgba(250,204,20,0.15)'},itemStyle:{color:'#FACC14'} }
    ]
  }
}

function mockTopConsumers() {
  return [
    { name:'一车间A线',value:'325.6',percent:22.8,color:'#1890FF' },
    { name:'一车间B线',value:'268.4',percent:18.8,color:'#2FC25B' },
    { name:'二车间C线',value:'245.2',percent:17.2,color:'#FACC14' },
    { name:'空压站',value:'198.7',percent:13.9,color:'#FA8C16' },
    { name:'冷冻站',value:'156.3',percent:10.9,color:'#722ED1' }
  ]
}

// 6大能源品类定义
const CATEGORY_SERIES = [
  { key:'solid_fuel', name:'固体燃料', color:'#4A4A4A', base:320, range:60 },
  { key:'liquid_fuel', name:'液体燃料', color:'#CD853F', base:120, range:30 },
  { key:'gas_fuel', name:'气体燃料', color:'#2FC25B', base:180, range:40 },
  { key:'electricity', name:'电力', color:'#1890FF', base:250, range:50 },
  { key:'heat', name:'热力', color:'#FACC14', base:100, range:25 },
  { key:'other_fuel', name:'其他燃料', color:'#722ED1', base:30, range:10 }
]

function mockEnergyTrend(dim) {
  const xMap = { day: Array.from({length:30},(_,i)=>`${i+1}日`), month: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], quarter: ['Q1','Q2','Q3','Q4'], year: ['2021','2022','2023','2024','2025','2026'] }
  const xAxis = xMap[dim||'month'] || xMap.month
  const len = xAxis.length
  return {
    xAxis, legend: CATEGORY_SERIES.map(c => c.name),
    series: CATEGORY_SERIES.map(c => ({
      name: c.name, type:'line', smooth:true, symbol:'none',
      data: Array.from({length:len},() => (c.base + Math.random() * c.range).toFixed(0)),
      itemStyle: { color: c.color }
    }))
  }
}

function mockEnergyPie() {
  return CATEGORY_SERIES.map(c => ({
    value: c.base * 10, name: c.name, itemStyle: { color: c.color }
  }))
}

function mockQueryResults(p) {
  const page = p?.page || 1; const size = p?.size || 20
  // 全部用能单元（基于完整工厂数据模型V3 — 5级组织架构）
  const allSections = [
    // 一车间 — A产线（粗加工）
    '一车间A线·CNC加工中心MC-01','一车间A线·数控车床LT-01','一车间A线·铣床ML-01',
    // 一车间 — B产线（精加工）
    '一车间B线·精密磨床GR-01','一车间B线·镗床BR-01','一车间B线·清洗机CL-01',
    // 二车间 — C产线（热处理）
    '二车间C线·淬火炉HT-01','二车间C线·回火炉HT-02','二车间C线·油冷槽QC-01',
    // 二车间 — D产线（电镀）
    '二车间D线·电镀槽EP-01','二车间D线·整流器RE-01','二车间D线·烘干炉DR-01',
    // 三车间 — E产线（总装）
    '三车间E线·装配机器人RB-01','三车间E线·自动拧紧机TR-01','三车间E线·包装机PK-01',
    // 公用工程 — 空压站
    '空压站·离心空压机AC-01','空压站·螺杆空压机AC-02','空压站·冷冻干燥机AD-01',
    // 公用工程 — 制冷站
    '制冷站·离心冷水机CH-01','制冷站·螺杆冷水机CH-02','制冷站·冷却塔CT-01',
    // 公用工程 — 锅炉房
    '锅炉房·燃气锅炉BL-01','锅炉房·燃煤锅炉BL-02','锅炉房·给水泵/软水装置',
    // 公用工程 — 水处理站
    '水处理站·纯化水机组PW-01','水处理站·循环水泵组CP-01','水处理站·消防水泵FP-01',
    // 公用工程 — 环保设施
    '环保设施·RTO废气焚烧炉RT-01','环保设施·废水处理站WW-01',
    // 新能源区
    '新能源区·逆变器INV-01','新能源区·逆变器INV-02','新能源区·储能变流器PCS-01',
    // 生活附属
    '综合办公楼','员工食堂','员工宿舍'
  ]
  // 按组织筛选级别过滤
  const orgIds = p?.orgIds || []
  let sections = allSections
  if (orgIds.length) {
    // 根据选中的组织层级过滤用能单元
    const lastId = orgIds[orgIds.length - 1]
    const orgMap = {
      'group_01': allSections,
      'company_01': allSections,
      'workshop_01': allSections.filter(s => s.startsWith('一车间')),
      'workshop_02': allSections.filter(s => s.startsWith('二车间')),
      'workshop_03': allSections.filter(s => s.startsWith('三车间')),
      'utility_01': allSections.filter(s => ['空压','制冷','锅炉','水处理','环保'].some(t => s.includes(t))),
      'renewable_01': allSections.filter(s => s.includes('新能源')),
      'auxiliary_01': allSections.filter(s => ['办公','食堂','宿舍'].some(t => s.includes(t))),
      'util_comp': allSections.filter(s => s.includes('空压')),
      'util_chiller': allSections.filter(s => ['制冷','冷水','冷却塔'].some(t => s.includes(t))),
      'util_boiler': allSections.filter(s => s.includes('锅炉')),
      'util_water': allSections.filter(s => ['水处理','纯化水','循环水','消防水'].some(t => s.includes(t))),
      'util_env': allSections.filter(s => ['RTO','废气','废水','污水'].some(t => s.includes(t))),
      'renew_pv': allSections.filter(s => s.includes('逆变')),
      'renew_bess': allSections.filter(s => s.includes('储能')),
      'line_a': allSections.filter(s => s.includes('A线')),
      'line_b': allSections.filter(s => s.includes('B线')),
      'line_c': allSections.filter(s => s.includes('C线')),
      'line_d': allSections.filter(s => s.includes('D线')),
      'line_e': allSections.filter(s => s.includes('E线')),
      'eq_mc01': allSections.filter(s => s.includes('CNC')),
      'eq_lt01': allSections.filter(s => s.includes('数控车床')),
      'eq_ml01': allSections.filter(s => s.includes('铣床')),
      'eq_gr01': allSections.filter(s => s.includes('磨床')),
      'eq_br01': allSections.filter(s => s.includes('镗床')),
      'eq_cl01': allSections.filter(s => s.includes('清洗机')),
      'eq_ht01': allSections.filter(s => s.includes('淬火')),
      'eq_ht02': allSections.filter(s => s.includes('回火')),
      'eq_qc01': allSections.filter(s => s.includes('油冷')),
      'eq_ep01': allSections.filter(s => s.includes('电镀')),
      'eq_re01': allSections.filter(s => s.includes('整流器')),
      'eq_dr01': allSections.filter(s => s.includes('烘干炉')),
      'eq_rb01': allSections.filter(s => s.includes('装配')),
      'eq_tr01': allSections.filter(s => s.includes('拧紧')),
      'eq_pk01': allSections.filter(s => s.includes('包装机')),
      'eq_ac01': allSections.filter(s => s.includes('AC-01')),
      'eq_ac02': allSections.filter(s => s.includes('AC-02')),
      'eq_ad01': allSections.filter(s => s.includes('干燥机AD')),
      'eq_ch01': allSections.filter(s => s.includes('CH-01')),
      'eq_ch02': allSections.filter(s => s.includes('CH-02')),
      'eq_ct01': allSections.filter(s => s.includes('冷却塔')),
      'eq_bl01': allSections.filter(s => s.includes('BL-01')),
      'eq_bl02': allSections.filter(s => s.includes('BL-02')),
      'eq_pw01': allSections.filter(s => s.includes('纯化水')),
      'eq_cp01': allSections.filter(s => s.includes('循环水泵')),
      'eq_fp01': allSections.filter(s => s.includes('消防水泵')),
      'eq_rt01': allSections.filter(s => s.includes('RTO')),
      'eq_ww01': allSections.filter(s => s.includes('废水')),
      'eq_inv01': allSections.filter(s => s.includes('逆变器INV-01')),
      'eq_inv02': allSections.filter(s => s.includes('逆变器INV-02')),
      'eq_pcs01': allSections.filter(s => s.includes('储能变流器')),
      'aux_office': allSections.filter(s => s.includes('办公')),
      'aux_canteen': allSections.filter(s => s.includes('食堂')),
      'aux_dorm': allSections.filter(s => s.includes('宿舍'))
    }
    const filtered = orgMap[lastId]
    if (filtered && filtered.length) sections = filtered
  }

  const total = sections.length * 5 // 每个单元5条记录
  const list = []
  const baseDate = new Date(2026, 6, 1)
  for (let i = 0; i < total; i++) {
    const d = new Date(baseDate.getTime() + (i % 30) * 86400000 + (i % 24) * 3600000 + (i % 4) * 900000)
    const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    const section = sections[i % sections.length] || sections[0]
    // 一行包含多个能源品类
    list.push({
      id: i + 1,
      date: timeStr,
      section: section,
      // 直接提供各类型数值，按选中的子品类动态展示
      energyType: ['raw_coal','diesel','natural_gas','grid_power','steam_low','methanol'][i % 6],
      energyLabel: ['原煤','柴油','天然气','电网购电','低压蒸汽','甲醇'][i % 6],
      amount: (10 + Math.random() * 50).toFixed(1),
      unit: ['t','t','万m³','万kWh','t','t'][i % 6],
      factor: [0.7143,1.4571,12.143,1.229,0.09,0.7714][i % 6],
      tce: (10 + Math.random() * 40).toFixed(1),
      color: '#1890FF',
      meterId: `M${String(Math.floor(Math.random()*34)+1).padStart(2,'0')}`,
      collectionPriority: ['P0','P1','P2','P3'][Math.floor(Math.random()*4)]
    })
  }
  return { list: list.slice((page-1)*size, page*size), total, page, size }
}

function mockCompareData() {
  return [
    { label:'综合能耗同比',current:156.82,compare:162.30,unit:'tce',compareLabel:'去年同期' },
    { label:'煤炭消耗同比',current:45.60,compare:42.80,unit:'t',compareLabel:'去年同期' },
    { label:'电力消耗同比',current:12580,compare:11800,unit:'kWh',compareLabel:'去年同期' },
    { label:'综合能耗环比',current:156.82,compare:148.50,unit:'tce',compareLabel:'上月同期' }
  ]
}

function mockAlarms(p) {
  const page = p?.page || 1; const size = p?.size || 10
  const filterType = p?.alarmType || ''
  const filterLevel = p?.level || ''
  const filterStatus = p?.status || ''
  const timeRange = p?.timeRange || []
  const sources = ['锅炉房BL-01','空压站AC-01','配电室','一车间A线','冷冻站CH-01','淬火炉HT-01','污水处理站']
  const types = ['surge','meter_offline','quota_exceed','standby_waste','power_factor','process_anomaly']
  const typeLabels = { surge:'能耗突增',meter_offline:'仪表失联',quota_exceed:'能耗超标',standby_waste:'待机空耗',power_factor:'功率因数异常',process_anomaly:'工艺参数异常' }
  const levels = { surge:'red',meter_offline:'red',quota_exceed:'yellow',standby_waste:'yellow',power_factor:'blue',process_anomaly:'blue' }
  const levelTexts = { red:'预警',yellow:'提醒',blue:'稳定' }
  const statuses = ['triggered','triggered','processing','processing','resolved','resolved','closed']
  const statusLabels = { triggered:'已触发',processing:'处理中',resolved:'已关闭',closed:'已归档' }
  // 生成全量数据再筛选
  const allList = []
  for (let i=0;i<37;i++) {
    const st = statuses[i % statuses.length]
    const type = types[i % types.length]
    allList.push({ id:i+1, time:`2026-07-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')} ${String(Math.floor(Math.random()*24)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`, source:sources[i%sources.length], content:`${typeLabels[type]}：${['当前值超出阈值','连续3次检测异常','设备运行异常'][i%3]}`, level:levels[type], levelText:levelTexts[levels[type]], type, typeLabel:typeLabels[type], status:st, statusLabel:statusLabels[st],
      handler: (st==='processing'||st==='resolved'||st==='closed') ? ['张工','李工','王工','赵工'][i%4] : '',
      problem: (st==='processing'||st==='resolved'||st==='closed') ? ['现场检查发现排烟温度偏高，空燃比失衡','管道压力异常波动，阀门开度不足','电机运行时电流超出额定值30%','散热器堵塞导致温度持续升高','数据采集中断，网关通信异常'][i%5] : '',
      solution: (st==='resolved'||st==='closed') ? ['调整空燃比至1.2，清理换热器积灰，温度已恢复正常','更换故障阀门并校准控制器，压力已稳定','更换老化电缆并重新接线，电流恢复正常','清洗散热器并更换冷却液，温度降至正常范围','重启网关并更新固件，通信已恢复'][i%5] : '',
      resolveTime: st==='closed' ? '2026-08-04 16:30' : (st==='resolved' ? '2026-08-04 14:20' : ''), currentValue:(Math.random()*200+50).toFixed(1), threshold:(Math.random()*150+100).toFixed(1), unit:['kW','t','m³','%'][i%4] })
  }
  // 应用筛选
  let filtered = allList
  if (timeRange && timeRange.length === 2) {
    filtered = filtered.filter(a => a.time >= timeRange[0] && a.time <= timeRange[1] + ' 23:59')
  }
  if (filterType) filtered = filtered.filter(a => a.type === filterType)
  if (filterLevel) filtered = filtered.filter(a => a.level === filterLevel)
  if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus)
  const total = filtered.length
  // 分页
  const start = (page - 1) * size
  return { list: filtered.slice(start, start + size), total, page, size }
}

function mockMeterSource(id) {
  return {
    meterId: id||'M05', meterName:`计量点 ${id||'M05'}`, meterType:'智能电表', model:'安科瑞 APM810', protocol:'Modbus TCP', installLocation:'一车间A线配电柜', calibrationDate:'2025-12-15', calibrationValid:'2026-12-14', accuracy:'0.5S',
    readings: Array.from({length:10},(_,i)=>({ time:`2026-07-${String(15-i).padStart(2,'0')} ${String(8+i).padStart(2,'0')}:00`, value:(12500+i*35+Math.random()*10).toFixed(2), unit:'kWh', status:'正常', hash:'0x'+Math.random().toString(16).substring(2,10) })),
    auditLog: [{ time:'2026-07-10 14:30',operator:'张工',action:'人工修正',before:'12680.00',after:'12650.00',reason:'仪表倒转异常' },{ time:'2026-07-05 09:15',operator:'李工',action:'数据补录',before:'--',after:'12550.00',reason:'采集中断恢复' }]
  }
}

// ---- Vuex Store ----
const state = {
  orgTree: [],
  dashboard: { kpis: null, loadCurve: null, topConsumers: [], energyTrend: null, energyPie: [] },
  query: { results: { list:[], total:0, page:1, size:20 }, compareData: [], meterSource: null },
  alarms: { stats: { total:0,red:0,yellow:0,blue:0,triggered:0,processing:0,resolved:0,closed:0 }, list: [], listTotal: 0 },
  reportTemplates: [],
  loading: { dashboard: false, query: false, alarms: false }
}

const mutations = {
  SET_ORG_TREE(s, v) { s.orgTree = v },
  SET_DASHBOARD_KPIS(s, v) { s.dashboard.kpis = v },
  SET_LOAD_CURVE(s, v) { s.dashboard.loadCurve = v },
  SET_TOP_CONSUMERS(s, v) { s.dashboard.topConsumers = v },
  SET_ENERGY_TREND(s, v) { s.dashboard.energyTrend = v },
  SET_ENERGY_PIE(s, v) { s.dashboard.energyPie = v },
  SET_QUERY_RESULTS(s, v) { s.query.results = v },
  SET_COMPARE_DATA(s, v) { s.query.compareData = v },
  SET_METER_SOURCE(s, v) { s.query.meterSource = v },
  SET_ALARM_STATS(s, v) { s.alarms.stats = v },
  SET_ALARM_LIST(s, { list, total }) { s.alarms.list = list; s.alarms.listTotal = total },
  SET_REPORT_TEMPLATES(s, v) { s.reportTemplates = v },
  SET_LOADING(s, { key, value }) { s.loading[key] = value }
}

const actions = {
  fetchOrgTree({ commit }) {
    // dev mock — 基于完整工厂数据模型V3
    commit('SET_ORG_TREE', [{
      id:'group_01',label:'某某控股集团',level:1, children:[{ id:'company_01',label:'某某制造有限公司',level:2, children:[
        { id:'workshop_01',label:'一车间（机加工）',level:3, children:[
          { id:'line_a',label:'A产线（粗加工）',level:4, children:[{ id:'eq_mc01',label:'CNC加工中心 MC-01',level:5 },{ id:'eq_lt01',label:'数控车床 LT-01',level:5 },{ id:'eq_ml01',label:'铣床 ML-01',level:5 }] },
          { id:'line_b',label:'B产线（精加工）',level:4, children:[{ id:'eq_gr01',label:'精密磨床 GR-01',level:5 },{ id:'eq_br01',label:'镗床 BR-01',level:5 },{ id:'eq_cl01',label:'清洗机 CL-01',level:5 }] }
        ]},
        { id:'workshop_02',label:'二车间（热处理+表面处理）',level:3, children:[
          { id:'line_c',label:'C产线（热处理）',level:4, children:[{ id:'eq_ht01',label:'淬火炉 HT-01',level:5 },{ id:'eq_ht02',label:'回火炉 HT-02',level:5 },{ id:'eq_qc01',label:'油冷槽 QC-01',level:5 }] },
          { id:'line_d',label:'D产线（电镀）',level:4, children:[{ id:'eq_ep01',label:'电镀槽 EP-01',level:5 },{ id:'eq_re01',label:'整流器 RE-01',level:5 },{ id:'eq_dr01',label:'烘干炉 DR-01',level:5 }] }
        ]},
        { id:'workshop_03',label:'三车间（组装+包装）',level:3, children:[
          { id:'line_e',label:'E产线（总装线）',level:4, children:[{ id:'eq_rb01',label:'装配机器人 RB-01',level:5 },{ id:'eq_tr01',label:'自动拧紧机 TR-01',level:5 },{ id:'eq_pk01',label:'包装机 PK-01',level:5 }] }
        ]},
        { id:'utility_01',label:'公用工程区',level:3, children:[
          { id:'util_comp',label:'空压站',level:4, children:[{ id:'eq_ac01',label:'离心空压机 AC-01(250kW)',level:5 },{ id:'eq_ac02',label:'螺杆空压机 AC-02(132kW)',level:5 },{ id:'eq_ad01',label:'冷冻干燥机 AD-01',level:5 }] },
          { id:'util_chiller',label:'制冷站',level:4, children:[{ id:'eq_ch01',label:'离心冷水机 CH-01(1200kW)',level:5 },{ id:'eq_ch02',label:'螺杆冷水机 CH-02(800kW)',level:5 },{ id:'eq_ct01',label:'冷却塔 CT-01/02',level:5 }] },
          { id:'util_boiler',label:'锅炉房',level:4, children:[{ id:'eq_bl01',label:'燃气蒸汽锅炉 BL-01(6t/h)',level:5 },{ id:'eq_bl02',label:'燃煤蒸汽锅炉 BL-02(4t/h)',level:5 }] },
          { id:'util_water',label:'水处理站',level:4, children:[{ id:'eq_pw01',label:'纯化水机组 PW-01',level:5 },{ id:'eq_cp01',label:'循环水泵组 CP-01',level:5 },{ id:'eq_fp01',label:'消防水泵 FP-01',level:5 }] },
          { id:'util_env',label:'环保设施',level:4, children:[{ id:'eq_rt01',label:'RTO废气焚烧炉 RT-01',level:5 },{ id:'eq_ww01',label:'废水处理站 WW-01',level:5 }] }
        ]},
        { id:'renewable_01',label:'新能源区',level:3, children:[
          { id:'renew_pv',label:'光伏系统(2MWp)',level:4, children:[{ id:'eq_inv01',label:'逆变器 INV-01(500kW)',level:5 },{ id:'eq_inv02',label:'逆变器 INV-02(500kW)',level:5 }] },
          { id:'renew_bess',label:'储能系统(500kW/1MWh)',level:4, children:[{ id:'eq_pcs01',label:'储能变流器 PCS-01(500kW)',level:5 }] }
        ]},
        { id:'auxiliary_01',label:'生活附属区',level:3, children:[{ id:'aux_office',label:'行政办公楼',level:4,children:[] },{ id:'aux_canteen',label:'员工食堂',level:4,children:[] },{ id:'aux_dorm',label:'员工宿舍',level:4,children:[] }] }
      ] }]
    }])
  },

  fetchDashboardAll({ commit }) {
    commit('SET_LOADING', { key:'dashboard', value:true })
    // 使用 Promise.resolve 模拟异步，让 loading 状态可见
    Promise.resolve().then(() => {
      commit('SET_DASHBOARD_KPIS', mockDashboardKpis())
      commit('SET_LOAD_CURVE', mockLoadCurve())
      commit('SET_TOP_CONSUMERS', mockTopConsumers())
      commit('SET_ENERGY_TREND', mockEnergyTrend('month'))
      commit('SET_ENERGY_PIE', mockEnergyPie())
      commit('SET_LOADING', { key:'dashboard', value:false })
    })
  },

  fetchDashboardKpis({ commit }) {
    commit('SET_DASHBOARD_KPIS', mockDashboardKpis())
  },

  fetchEnergyTrend({ commit }, dimension) {
    commit('SET_ENERGY_TREND', mockEnergyTrend(dimension || 'month'))
  },

  fetchQueryResults({ commit }, params) {
    commit('SET_LOADING', { key:'query', value:true })
    Promise.resolve().then(() => {
      commit('SET_QUERY_RESULTS', mockQueryResults(params))
      commit('SET_COMPARE_DATA', mockCompareData())
      commit('SET_LOADING', { key:'query', value:false })
    })
  },

  fetchMeterSource({ commit }, meterId) {
    commit('SET_METER_SOURCE', mockMeterSource(meterId))
  },

  fetchAlarms({ commit }, params = {}) {
    commit('SET_LOADING', { key:'alarms', value:true })
    Promise.resolve().then(() => {
      const res = mockAlarms(params)
      commit('SET_ALARM_LIST', { list:res.list, total:res.total })
      commit('SET_ALARM_STATS', { total:37,red:8,yellow:15,blue:14,triggered:5,processing:10,resolved:12,closed:10 })
      commit('SET_LOADING', { key:'alarms', value:false })
    })
  },

  fetchReportTemplates({ commit }) {
    commit('SET_REPORT_TEMPLATES', [
      { key:'daily',label:'日报',desc:'当日用能概况',icon:'el-icon-document' },
      { key:'weekly',label:'周报',desc:'周用能统计 + 同比分析',icon:'el-icon-data-line' },
      { key:'monthly',label:'月报',desc:'月用能统计 + 结构图 + 单位产品能耗',icon:'el-icon-data-analysis' }
    ])
  }
}

const getters = {
  dashboardKpiList: (state, getters, rootState, rootGetters) => {
    const k = state.dashboard.kpis
    if (!k) return []
    // 从 Dashboard 组件读取 period（通过 rootState 无法直接获取，返回带 period 的逻辑由组件处理）
    return [
      { label:'当日总能耗', value:Number(k.totalEnergy?.value||0), unit:k.totalEnergy?.unit||'tce', status:'default', trend:k.totalEnergy?.trend, trendLabel:'同比昨日' },
      { label:'当月累计能耗', value:Number(k.monthEnergy?.value||0), unit:k.monthEnergy?.unit||'tce', status:'success', trend:k.monthEnergy?.trend, trendLabel:'同比上月' },
      { label:'当年累计能耗', value:Number(k.yearEnergy?.value||0), unit:k.yearEnergy?.unit||'tce', status:'default', trend:k.yearEnergy?.trend, trendLabel:'同比去年' },
      { label:'实时功率', value:Number(k.realtimePower?.value||0), unit:k.realtimePower?.unit||'kW', status:'warning' },
      { label:'清洁能源占比', value:Number(k.cleanEnergyRatio?.value||0), unit:'%', status:'success' },
      { label:'活跃告警', value:Number(k.activeAlarms?.value||0), unit:'条', status:'danger' }
    ]
  },
  alarmStatCards: (state) => {
    const s = state.alarms.stats
    return [
      { label:'总计', value:s.total, color:'#595959', border:'default' },
      { label:'红色预警', value:s.red, color:'#FF4D4F', border:'danger' },
      { label:'黄色提醒', value:s.yellow, color:'#FAAD14', border:'warning' },
      { label:'蓝色稳定', value:s.blue, color:'#1890FF', border:'info' },
      { label:'处理中', value:s.processing, color:'#1890FF', border:'info' },
      { label:'已关闭', value:s.resolved, color:'#52C41A', border:'success' },
      { label:'已归档', value:s.closed, color:'#909399', border:'default' }
    ]
  }
}

export default { namespaced: true, state, mutations, actions, getters }
