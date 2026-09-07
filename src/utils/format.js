import moment from 'moment'

// 数值格式化：千分位分隔
export function formatNumber(num, decimal = 2) {
  if (num === null || num === undefined) return '--'
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal
  })
}

// 百分比格式化
export function formatPercent(num, decimal = 1) {
  if (num === null || num === undefined) return '--'
  return `${Number(num).toFixed(decimal)}%`
}

// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '--'
  return moment(date).format(format)
}

// 日期时间格式化
export function formatDateTime(date) {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 标准煤单位转换
export function formatCoal(num) {
  if (num === null || num === undefined) return '--'
  return `${formatNumber(num)} kgce`
}

// 碳排放单位
export function formatCarbon(num) {
  if (num === null || num === undefined) return '--'
  return `${formatNumber(num)} tCO₂e`
}

// 能耗趋势判断
export function getTrend(current, previous) {
  if (!previous || previous === 0) return { value: 0, type: 'stable' }
  const diff = ((current - previous) / previous * 100).toFixed(1)
  if (diff > 0) return { value: diff, type: 'up' }
  if (diff < 0) return { value: Math.abs(diff), type: 'down' }
  return { value: 0, type: 'stable' }
}
