// ===== 能源品种（按物理形态分组，15个品类）=====
export const ENERGY_CATEGORIES = [
  {
    key: 'solid_fuel', label: '固体燃料',
    children: [
      { key: 'raw_coal', label: '原煤', unit: 't', factor: 0.7143, color: '#4A4A4A' },
      { key: 'washed_coal', label: '洗精煤', unit: 't', factor: 0.9000, color: '#5A5A5A' },
      { key: 'coke', label: '焦炭', unit: 't', factor: 0.9714, color: '#6B6B6B' },
      { key: 'coal_gangue', label: '煤矸石', unit: 't', factor: 0.1786, color: '#7D7D7D' }
    ]
  },
  {
    key: 'liquid_fuel', label: '液体燃料',
    children: [
      { key: 'crude_oil', label: '原油', unit: 't', factor: 1.4286, color: '#8B4513' },
      { key: 'gasoline', label: '汽油', unit: 't', factor: 1.4714, color: '#A0522D' },
      { key: 'kerosene', label: '煤油', unit: 't', factor: 1.4714, color: '#B8860B' },
      { key: 'diesel', label: '柴油', unit: 't', factor: 1.4571, color: '#CD853F' },
      { key: 'fuel_oil', label: '燃料油', unit: 't', factor: 1.4286, color: '#D2691E' },
      { key: 'lpg', label: '液化石油气', unit: 't', factor: 1.7143, color: '#8B6914' }
    ]
  },
  {
    key: 'gas_fuel', label: '气体燃料',
    children: [
      { key: 'natural_gas', label: '天然气', unit: '万m³', factor: 12.143, color: '#2FC25B' },
      { key: 'coke_oven_gas', label: '焦炉煤气', unit: '万m³', factor: 5.714, color: '#3CB371' },
      { key: 'bf_gas', label: '高炉煤气', unit: '万m³', factor: 1.286, color: '#66CDAA' },
      { key: 'converter_gas', label: '转炉煤气', unit: '万m³', factor: 2.714, color: '#90EE90' },
      { key: 'lng', label: '液化天然气', unit: 't', factor: 1.757, color: '#98FB98' }
    ]
  },
  {
    key: 'electricity', label: '电力',
    children: [
      { key: 'grid_power', label: '电网购电', unit: '万kWh', factor: 1.229, color: '#1890FF' },
      { key: 'hydro_power', label: '水电', unit: '万kWh', factor: 1.229, color: '#40A9FF' },
      { key: 'wind_power', label: '风电', unit: '万kWh', factor: 1.229, color: '#69C0FF' },
      { key: 'solar_power', label: '光伏发电', unit: '万kWh', factor: 1.229, color: '#91D5FF' },
      { key: 'biomass_power', label: '生物质发电', unit: '万kWh', factor: 1.229, color: '#BAE7FF' },
      { key: 'nuclear_power', label: '核电', unit: '万kWh', factor: 1.229, color: '#E6F7FF' },
      { key: 'high_voltage', label: '外购高压电', unit: '万kWh', factor: 1.229, color: '#096DD9' }
    ]
  },
  {
    key: 'heat', label: '热力',
    children: [
      { key: 'steam_high', label: '高压蒸汽', unit: 't', factor: 0.1286, color: '#FACC14' },
      { key: 'steam_low', label: '低压蒸汽', unit: 't', factor: 0.0900, color: '#FFE88C' },
      { key: 'hot_water', label: '热水', unit: 'GJ', factor: 0.0341, color: '#FFF3BF' }
    ]
  },
  {
    key: 'other_fuel', label: '其他燃料',
    children: [
      { key: 'methanol', label: '甲醇', unit: 't', factor: 0.7714, color: '#722ED1' },
      { key: 'ethanol', label: '乙醇', unit: 't', factor: 0.9286, color: '#9254DE' },
      { key: 'hydrogen', label: '氢气', unit: '万m³', factor: 4.857, color: '#B37FEB' },
      { key: 'biomass_fuel', label: '生物质燃料', unit: 't', factor: 0.5000, color: '#D3ADF7' }
    ]
  }
]

// 所有能源品种扁平列表（用于单选/多选）
export const ALL_ENERGY_TYPES = ENERGY_CATEGORIES.reduce((arr, cat) => {
  return arr.concat(cat.children.map(c => ({ ...c, category: cat.key, categoryLabel: cat.label })))
}, [])

// 保留旧版兼容（4种基础能源）
export const ENERGY_TYPES = [
  { key: 'coal', label: '煤炭', unit: 't', color: '#8B572A' },
  { key: 'gas', label: '天然气', unit: 'm³', color: '#2FC25B' },
  { key: 'electricity', label: '电', unit: 'kWh', color: '#1890FF' },
  { key: 'steam', label: '蒸汽', unit: 't', color: '#FACC14' }
]

// ===== 用能类型 =====
export const USAGE_TYPES = [
  {
    key: 'production_direct', label: '生产直接用能',
    children: [
      { key: 'machining', label: '机械加工用能' },
      { key: 'heat_treatment', label: '热处理用能' },
      { key: 'surface_treatment', label: '表面处理用能' },
      { key: 'assembly', label: '装配用能' }
    ]
  },
  {
    key: 'production_indirect', label: '生产间接用能',
    children: [
      { key: 'compressed_air', label: '压缩空气' },
      { key: 'chilled_water', label: '冷冻水' },
      { key: 'cooling_water', label: '冷却循环水' },
      { key: 'pure_water', label: '纯水制备' },
      { key: 'lighting_prod', label: '生产照明' },
      { key: 'hvav_prod', label: '生产暖通' }
    ]
  },
  {
    key: 'auxiliary_production', label: '辅助生产用能',
    children: [
      { key: 'boiler_aux', label: '锅炉辅机' },
      { key: 'compressor_aux', label: '空压站辅机' },
      { key: 'water_station', label: '水处理站' },
      { key: 'rto', label: 'RTO废气处理' },
      { key: 'wastewater', label: '污水处理站' },
      { key: 'warehouse', label: '仓库物流' }
    ]
  },
  {
    key: 'auxiliary_other', label: '辅助其他用能',
    children: [
      { key: 'office', label: '办公用能' },
      { key: 'canteen', label: '食堂用能' },
      { key: 'dormitory', label: '宿舍用能' },
      { key: 'lighting_public', label: '公共照明' },
      { key: 'greening', label: '绿化/景观' }
    ]
  }
]

// ===== 用能类别（三大类）=====
export const USAGE_CATEGORIES = [
  { key: 'production', label: '生产用能', desc: '直接用于产品加工制造的能源消耗', rule: '关联MES工单+设备运行台时' },
  { key: 'auxiliary', label: '辅助用能', desc: '为生产提供支撑的公用工程系统能耗', rule: '关联公用工程产出的工质流量' },
  { key: 'living', label: '生活用能', desc: '办公、食堂、宿舍等非生产性能耗', rule: '独立计量回路或人工填报' }
]

// 时间维度
export const TIME_DIMENSIONS = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季' },
  { key: 'year', label: '年' }
]

// 碳排放范围
export const CARBON_SCOPES = [
  { key: 'scope1', label: '范围1（直接排放）', color: '#FF6B6B' },
  { key: 'scope2', label: '范围2（间接排放-电力热力）', color: '#FACC14' },
  { key: 'scope3', label: '范围3（间接排放-上下游）', color: '#1890FF' }
]

// 告警等级
export const ALARM_LEVELS = [
  { key: 'red', label: '预警', color: '#FF4D4F', icon: 'el-icon-warning' },
  { key: 'yellow', label: '提醒', color: '#FAAD14', icon: 'el-icon-info' },
  { key: 'blue', label: '稳定', color: '#1890FF', icon: 'el-icon-success' }
]

// 供应商碳评级
export const SUPPLIER_RATINGS = [
  { key: 'A', label: 'A级（优秀）', color: '#52C41A' },
  { key: 'B', label: 'B级（良好）', color: '#1890FF' },
  { key: 'C', label: 'C级（一般）', color: '#FAAD14' },
  { key: 'D', label: 'D级（需改进）', color: '#FF4D4F' }
]

// 能效等级
export const EFFICIENCY_LEVELS = [
  { key: 1, label: '1级（先进）', color: '#52C41A' },
  { key: 2, label: '2级（中等）', color: '#FAAD14' },
  { key: 3, label: '3级（落后）', color: '#FF4D4F' }
]

// LCA生命周期阶段
export const LCA_STAGES = [
  { key: 'raw_material', label: '原材料获取' },
  { key: 'production', label: '生产制造' },
  { key: 'transport', label: '运输' },
  { key: 'usage', label: '使用' },
  { key: 'disposal', label: '废弃处置' }
]

// ===== 告警类型（6种）=====
export const ALARM_TYPES = [
  { key: 'surge', label: '能耗突增', desc: '当前值超过历史同期均值+3σ', defaultLevel: 'red' },
  { key: 'meter_offline', label: '仪表失联', desc: '数据采集中断超过15分钟', defaultLevel: 'red' },
  { key: 'quota_exceed', label: '能耗超标', desc: '累计能耗超过月度限额', defaultLevel: 'yellow' },
  { key: 'standby_waste', label: '待机空耗', desc: '非工作时间设备持续运行', defaultLevel: 'yellow' },
  { key: 'power_factor', label: '功率因数异常', desc: '功率因数低于0.90', defaultLevel: 'blue' },
  { key: 'process_anomaly', label: '工艺参数异常', desc: '工艺参数超出正常范围', defaultLevel: 'blue' }
]

// 告警状态流程
export const ALARM_STATUS = [
  { key: 'triggered', label: '已触发' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已关闭' },
  { key: 'closed', label: '已归档' }
]

// ===== 采集优先级 =====
export const COLLECTION_PRIORITIES = [
  { key: 'P0', label: '仪表自动采集', interval: '1-15分钟', latency: '<30秒',
    sources: ['智能电表(Modbus/DL/T645)', '气体流量计(NB-IoT)', '热计量表(4-20mA)', '重量传感器(RS485)'] },
  { key: 'P1', label: '系统API对接', interval: '5-30分钟', latency: '<5分钟',
    sources: ['MES(产量/设备数据)', 'ERP(采购量/库存)'] },
  { key: 'P2', label: '地磅/物位计', interval: '实时/批次', latency: '<30分钟',
    sources: ['地磅(煤炭/液体燃料)', '物位计(储罐液位)'] },
  { key: 'P3', label: '人工填报', interval: '日/周/月', latency: '人工录入',
    sources: ['无自动采集的能源', '外购瓶装气体', '移动源燃料'] },
  { key: 'P4', label: '离线实测', interval: '批次', latency: '<60分钟',
    sources: ['碳排放监测(烟气分析)', '燃料热值实测'] }
]

// ===== 折标系数（参考值）=====
export const COAL_EQUIVALENT_FACTORS = {
  coal: 0.7143,       // kgce/kg
  gas: 1.3300,        // kgce/m³
  electricity: 0.1229, // kgce/kWh（当量值）
  steam: 0.1286        // kgce/kg
}
