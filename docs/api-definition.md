# 零碳园区能碳数字化平台 API 接口文档

> 版本：V1.0 | 更新日期：2026-05-13

## 通用说明

### 请求基础地址
```
开发环境: http://localhost:3000/api
生产环境: https://api.zero-carbon-platform.com/api
```

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码定义

| 错误码 | 说明 |
|:---|:---|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页参数
所有列表接口统一支持分页参数：
- `page`: 页码，默认 1
- `size`: 每页条数，默认 20

分页响应格式：
```json
{
  "code": 200,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

## 一、通用接口

### 1.1 用户登录
`POST /auth/login`

**请求参数：**
```json
{
  "username": "admin",
  "password": "encrypted_password"
}
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin"
    }
  }
}
```

### 1.2 获取字典数据
`GET /system/dict/{dictType}`

**路径参数：**
- `dictType`: 字典类型（energy_type / alarm_level / carbon_scope 等）

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "label": "煤炭", "value": "coal", "extra": { "unit": "t", "color": "#8B572A" } },
    { "label": "天然气", "value": "gas", "extra": { "unit": "m³", "color": "#2FC25B" } }
  ]
}
```

---

## 二、模块1 - 能耗查询

### 2.1 获取实时能耗数据
`GET /energy/realtime`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "todayEnergy": 156.82,
    "monthEnergy": 3856.45,
    "yearEnergy": 42568.30,
    "todayTrend": { "value": 3.2, "type": "up" },
    "monthTrend": { "value": 2.1, "type": "down" },
    "yearTrend": { "value": 5.6, "type": "down" },
    "byType": {
      "coal": { "today": 45.60, "month": 1256.80, "unit": "t", "trend": { "value": 2.3, "type": "up" } },
      "gas": { "today": 3200, "month": 96000, "unit": "m³", "trend": { "value": 1.5, "type": "down" } },
      "electricity": { "today": 12580, "month": 376000, "unit": "kWh", "trend": { "value": 3.1, "type": "up" } },
      "steam": { "today": 18.50, "month": 556, "unit": "t", "trend": { "value": 0.8, "type": "down" } }
    }
  }
}
```

### 2.2 历史能耗数据查询
`GET /energy/history`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| dimension | string | 是 | 时间维度：day/month/quarter/year |
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |
| device | string | 否 | 设备编号 |
| section | string | 否 | 工段编号 |
| energyType | string | 否 | 能源类型：coal/gas/electricity/steam |
| page | number | 否 | 页码 |
| size | number | 否 | 每页条数 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "date": "2026-05-13",
        "section": "锅炉工段",
        "sectionCode": "section_a",
        "device": "1号锅炉",
        "deviceCode": "boiler_1",
        "coal": 12.50,
        "gas": 800,
        "electricity": 3200,
        "steam": 5.20,
        "totalTce": 18.60
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

### 2.3 能耗趋势数据
`GET /energy/trend`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| dimension | string | 是 | day/month/quarter/year |
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |
| energyType | string | 否 | 能源类型，不传则返回全部 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "xAxis": ["1日", "2日", "...", "30日"],
    "series": [
      { "name": "煤炭", "unit": "tce", "data": [18.6, 17.8, "..."] },
      { "name": "天然气", "unit": "tce", "data": [12.3, 11.5, "..."] }
    ]
  }
}
```

### 2.4 同比环比数据
`GET /energy/compare`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| dimension | string | 是 | 时间维度 |
| date | string | 是 | 基准日期 |
| compareType | string | 是 | yoy(同比)/mom(环比) |

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "label": "煤炭消耗", "current": 45.60, "compare": 42.80, "unit": "t", "changePercent": 6.5 },
    { "label": "天然气消耗", "current": 3200, "compare": 3500, "unit": "m³", "changePercent": -8.6 }
  ]
}
```

### 2.5 能耗告警列表
`GET /energy/alarm`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| level | string | 否 | red/yellow/blue |
| status | string | 否 | pending/processing/resolved |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| page | number | 否 | 页码 |
| size | number | 否 | 每页条数 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "time": "2026-05-13 08:30:00",
        "source": "锅炉房A",
        "sourceCode": "boiler_room_a",
        "content": "煤炭消耗量突增30%，超出日阈值",
        "level": "red",
        "levelText": "预警",
        "status": "processing",
        "threshold": 40,
        "actualValue": 56.5,
        "unit": "t"
      }
    ],
    "total": 15,
    "page": 1,
    "size": 20
  }
}
```

### 2.6 处理告警
`POST /energy/alarm/{id}/handle`

**请求参数（Body）：**
```json
{
  "handleResult": "已调整锅炉运行参数",
  "handler": "张工"
}
```

### 2.7 导出能耗数据
`GET /energy/export`

**请求参数：** 同 2.2 历史查询参数，响应为文件流（application/octet-stream）。

---

## 三、模块2 - 能源消费量和强度计算

### 3.1 综合能耗计算
`GET /energy-consumption/calc`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| period | string | 是 | year/month |
| date | string | 是 | 年份或月份 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "items": [
      { "label": "煤炭", "consumption": 1256.80, "rawUnit": "t", "factor": 0.7143, "tce": 897.92, "color": "#8B572A" },
      { "label": "天然气", "consumption": 458000, "rawUnit": "m³", "factor": 1.33, "tce": 609.14, "color": "#2FC25B" },
      { "label": "电力", "consumption": 2356800, "rawUnit": "kWh", "factor": 0.1229, "tce": 289.68, "color": "#1890FF" },
      { "label": "蒸汽", "consumption": 8560, "rawUnit": "t", "factor": 0.1286, "tce": 110.04, "color": "#FACC14" }
    ],
    "totalTce": 1906.78
  }
}
```

### 3.2 能耗强度计算
`GET /energy-consumption/intensity`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "items": [
      { "label": "单位产值能耗", "value": 0.38, "unit": "tce/万元" },
      { "label": "单位增加值能耗", "value": 0.52, "unit": "tce/万元" },
      { "label": "单位产品能耗", "value": 156.8, "unit": "kgce/t" }
    ]
  }
}
```

### 3.3 能效排名
`GET /energy-consumption/ranking`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "rank": 1, "name": "生产车间一", "output": 5680, "consumption": 1825.6, "intensity": 0.32, "level": 1 }
  ]
}
```

### 3.4 能耗强度趋势
`GET /energy-consumption/intensity-trend`

### 3.5 目标考核
`GET /energy-consumption/target`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "name": "年度能耗强度目标", "target": 0.40, "current": 0.38, "unit": "tce/万元", "percent": 95 },
    { "name": "年度节能量目标", "target": 500, "current": 380, "unit": "tce", "percent": 76 }
  ]
}
```

---

## 四、模块3 - 能源消费分析与策略推荐

### 4.1 用能结构分析
`GET /energy-analysis/structure`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "fossil": { "ratio": 55.2, "tce": 1052.54 },
    "clean": { "ratio": 35.8, "tce": 682.63 },
    "renewable": { "ratio": 9.0, "tce": 171.61 }
  }
}
```

### 4.2 用能成本分析
`GET /energy-analysis/cost`

### 4.3 设备能效分析
`GET /energy-analysis/equipment-efficiency`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "name": "1号锅炉", "actualEfficiency": 88.5, "designEfficiency": 92, "load": 75 },
    { "name": "空气压缩机", "actualEfficiency": 72.3, "designEfficiency": 85, "load": 60 },
    { "name": "循环水泵", "actualEfficiency": 68.5, "designEfficiency": 78, "load": 55 },
    { "name": "引风机", "actualEfficiency": 76.8, "designEfficiency": 82, "load": 70 }
  ]
}
```

### 4.4 异常诊断
`GET /energy-analysis/anomaly`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "over_threshold",
        "level": "red",
        "equipment": "1号锅炉",
        "process": "锅炉工段",
        "timeRange": "2026-05-13 06:00 ~ 08:00",
        "description": "排烟温度超标，实际值186°C，阈值160°C",
        "suggestion": "检查燃烧器状态，调整空燃比"
      }
    ]
  }
}
```

### 4.5 AI策略推荐
`GET /energy-analysis/strategy`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "priority": "high",
      "title": "优化锅炉燃烧效率",
      "description": "当前锅炉排烟温度偏高，建议调整空燃比并检查换热器结垢情况",
      "expectedSaving": "预计节能 120 tce/年",
      "difficulty": "medium",
      "investment": "低 (<5万元)"
    }
  ]
}
```

---

## 五、模块4 - 能效对标

### 5.1 能效对标数据
`GET /benchmark/data`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "currentIntensity": 0.38,
    "nationalStandard": 0.42,
    "industryAdvanced": 0.30,
    "internationalAdvanced": 0.25,
    "rating": 2,
    "standardRef": "GB/T 32045"
  }
}
```

### 5.2 行业标杆对比
`GET /benchmark/industry`

### 5.3 能效等级评定
`GET /benchmark/rating`

### 5.4 差距分析
`GET /benchmark/gap`

### 5.5 设定节能目标
`POST /benchmark/target`

**请求参数：**
```json
{
  "targetIntensity": 0.35,
  "targetYear": "2026",
  "measures": ["更换高效电机", "余热回收改造"]
}
```

---

## 六、模块5 - 能流分析

### 6.1 能流图数据
`GET /energy-flow/data`

**响应数据（桑基图格式）：**
```json
{
  "code": 200,
  "data": {
    "nodes": [
      { "name": "煤炭输入", "value": 897.92 },
      { "name": "天然气输入", "value": 609.14 },
      { "name": "电力输入", "value": 289.68 },
      { "name": "锅炉转换", "value": 1200 },
      { "name": "生产工艺", "value": 800 },
      { "name": "有效利用", "value": 1334.75 },
      { "name": "损失", "value": 572.03 }
    ],
    "links": [
      { "source": "煤炭输入", "target": "锅炉转换", "value": 897.92 },
      { "source": "天然气输入", "target": "锅炉转换", "value": 302.08 },
      { "source": "电力输入", "target": "生产工艺", "value": 289.68 },
      { "source": "锅炉转换", "target": "有效利用", "value": 900 },
      { "source": "锅炉转换", "target": "损失", "value": 300 },
      { "source": "生产工艺", "target": "有效利用", "value": 434.75 },
      { "source": "生产工艺", "target": "损失", "value": 272.03 }
    ],
    "totalInput": 1906.78,
    "totalUseful": 1334.75,
    "totalLoss": 572.03,
    "efficiency": 70.0
  }
}
```

### 6.2 能量平衡
`GET /energy-flow/balance`

### 6.3 损失分析
`GET /energy-flow/loss`

---

## 七、模块6 - 能效平衡与优化

### 7.1 能量平衡计算
`GET /energy-balance/calc`

### 7.2 热效率计算
`GET /energy-balance/thermal-efficiency`

### 7.3 平衡校验
`POST /energy-balance/verify`

---

## 八、模块7 - 用能与碳排放预算管理

### 8.1 预算列表
`GET /budget/list`

### 8.2 创建预算
`POST /budget/create`

**请求参数：**
```json
{
  "name": "2026年度用能预算",
  "type": "energy",
  "period": "year",
  "totalAmount": 5000,
  "unit": "tce",
  "items": [
    { "month": "2026-01", "amount": 420 },
    { "month": "2026-02", "amount": 380 }
  ]
}
```

### 8.3 更新预算
`PUT /budget/{id}`

### 8.4 预算执行进度
`GET /budget/progress`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "name": "用能预算", "budget": 5000, "used": 3400, "percent": 68 },
    { "name": "碳排放预算", "budget": 10000, "used": 7200, "percent": 72 },
    { "name": "煤炭配额", "budget": 2000, "used": 1700, "percent": 85 },
    { "name": "电力预算", "budget": 3000000, "used": 1620000, "percent": 54 }
  ]
}
```

### 8.5 预算预测预警
`GET /budget/forecast`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "forecastedUsage": 5200,
    "budget": 5000,
    "willExceed": true,
    "exceedAmount": 200,
    "monthlyForecast": [
      { "month": "2026-06", "forecasted": 450, "actual": null },
      { "month": "2026-07", "forecasted": 480, "actual": null }
    ],
    "warnings": [
      { "month": "2026-10", "type": "exceed", "message": "预计10月将超出年度预算" }
    ]
  }
}
```

---

## 九、模块8 - 碳排放核算

### 9.1 Scope 1 核算
`GET /carbon-accounting/scope1`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| year | string | 是 | 年份 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "total": 5240,
    "items": [
      {
        "category": "燃料燃烧",
        "subItems": [
          { "fuel": "煤炭", "consumption": 1256.80, "emissionFactor": 2.66, "carbonContent": 0.75, "emission": 3343.09, "unit": "tCO₂e" },
          { "fuel": "天然气", "consumption": 458000, "emissionFactor": 0.00216, "carbonContent": 0.4, "emission": 989.28, "unit": "tCO₂e" }
        ]
      },
      {
        "category": "工艺过程",
        "subItems": [
          { "process": "石灰石分解", "emission": 907.63, "unit": "tCO₂e" }
        ]
      }
    ]
  }
}
```

### 9.2 Scope 2 核算
`GET /carbon-accounting/scope2`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "total": 4860,
    "items": [
      { "type": "外购电力", "consumption": 2356800, "unit": "kWh", "emissionFactor": 0.5810, "emission": 1369.30, "unit": "tCO₂e" },
      { "type": "外购热力", "consumption": 8560, "unit": "GJ", "emissionFactor": 0.4080, "emission": 3492.48, "unit": "tCO₂e" }
    ]
  }
}
```

### 9.3 Scope 3 核算
`GET /carbon-accounting/scope3`

### 9.4 排放汇总
`GET /carbon-accounting/summary`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "total": 12856.50,
    "scope1": 5240.00,
    "scope2": 4860.50,
    "scope3": 2756.00,
    "monthlyTrend": [
      { "month": "2026-01", "scope1": 450, "scope2": 420, "scope3": 230 },
      { "month": "2026-02", "scope1": 420, "scope2": 380, "scope3": 210 }
    ]
  }
}
```

### 9.5 生成碳排放报告
`POST /carbon-accounting/report`

**请求参数：**
```json
{
  "year": "2026",
  "format": "pdf",
  "standard": "ISO14064"
}
```

---

## 十、模块9 - 产品碳足迹核算

### 10.1 产品列表
`GET /carbon-footprint/products`

### 10.2 碳足迹计算
`POST /carbon-footprint/calc`

**请求参数：**
```json
{
  "productId": "P001",
  "productName": "产品A",
  "period": "2026",
  "stages": {
    "raw_material": { "emission": 2.5, "dataSources": "供应商数据+排放因子" },
    "production": { "emission": 5.8, "energyConsumption": { "coal": 0.5, "electricity": 800 } },
    "transport": { "emission": 1.2, "distance": 500, "vehicleType": "diesel_truck" },
    "usage": { "emission": 0 },
    "disposal": { "emission": 0.5 }
  }
}
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "totalFootprint": 10.0,
    "unit": "tCO₂e/t",
    "scopeBreakdown": { "scope1": 4.2, "scope2": 3.5, "scope3": 2.3 },
    "stageBreakdown": {
      "raw_material": { "emission": 2.5, "ratio": 25 },
      "production": { "emission": 5.8, "ratio": 58 },
      "transport": { "emission": 1.2, "ratio": 12 },
      "usage": { "emission": 0, "ratio": 0 },
      "disposal": { "emission": 0.5, "ratio": 5 }
    }
  }
}
```

### 10.3 碳足迹详情
`GET /carbon-footprint/detail?productId=P001`

### 10.4 敏感性分析
`GET /carbon-footprint/sensitivity?productId=P001`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "parameter": "电力消耗", "sensitivity": 0.35, "impact": "高" },
    { "parameter": "煤炭消耗", "sensitivity": 0.28, "impact": "高" },
    { "parameter": "运输距离", "sensitivity": 0.12, "impact": "中" },
    { "parameter": "原辅料用量", "sensitivity": 0.08, "impact": "低" }
  ]
}
```

### 10.5 生成碳足迹报告
`POST /carbon-footprint/report`

---

## 十一、模块10 - 供应链碳管理

### 11.1 供应商列表
`GET /supply-chain/suppliers`

**请求参数（Query）：**
| 参数 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|
| rating | string | 否 | A/B/C/D |
| keyword | string | 否 | 搜索关键词 |
| page | number | 否 | 页码 |
| size | number | 否 | 每页条数 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "XX化工有限公司",
        "material": "硫酸",
        "purchaseAmount": 500,
        "unit": "t",
        "emission": 125.5,
        "emissionIntensity": 0.251,
        "rating": "A",
        "distance": 120,
        "transportEmission": 8.4
      }
    ],
    "total": 50
  }
}
```

### 11.2 供应商碳排放数据
`GET /supply-chain/suppliers/{id}/emission`

### 11.3 添加供应商
`POST /supply-chain/suppliers`

**请求参数：**
```json
{
  "name": "XX化工有限公司",
  "material": "硫酸",
  "purchaseAmount": 500,
  "unit": "t",
  "transportDistance": 120,
  "emissionData": {
    "scope1": 80.5,
    "scope2": 30.2,
    "scope3": 14.8
  }
}
```

### 11.4 更新供应商
`PUT /supply-chain/suppliers/{id}`

### 11.5 供应商评级
`GET /supply-chain/rating`

**响应数据：**
```json
{
  "code": 200,
  "data": [
    { "rating": "A", "count": 12, "avgIntensity": 0.15, "color": "#52C41A" },
    { "rating": "B", "count": 18, "avgIntensity": 0.28, "color": "#1890FF" },
    { "rating": "C", "count": 8, "avgIntensity": 0.45, "color": "#FAAD14" },
    { "rating": "D", "count": 3, "avgIntensity": 0.68, "color": "#FF4D4F" }
  ]
}
```

### 11.6 减排项目列表
`GET /supply-chain/projects`

---

## 十二、模块11 - 碳资产管理

### 12.1 配额管理
`GET /carbon-asset/quota`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "totalQuota": 15000,
    "usedQuota": 10000,
    "remainQuota": 2340,
    "bankedQuota": 2660,
    "complianceYear": "2026",
    "deadline": "2026-12-31",
    "transactions": [
      { "date": "2026-01-15", "type": "buy", "amount": 2000, "price": 55.6, "total": 111200 }
    ]
  }
}
```

### 12.2 CCER资产列表
`GET /carbon-asset/ccer`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "projectName": "光伏发电CCER项目",
        "certificationBody": "国家发改委",
        "totalCredits": 5000,
        "usedCredits": 2000,
        "remainCredits": 3000,
        "validityPeriod": "2024-01-01 ~ 2029-12-31",
        "status": "active"
      }
    ]
  }
}
```

### 12.3 履约管理
`GET /carbon-asset/compliance`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "complianceYear": "2026",
    "totalEmission": 12856.50,
    "totalQuota": 15000,
    "quotaBalance": 2143.50,
    "ccerOffset": 500,
    "status": "on_track",
    "deadline": "2026-12-31",
    "history": [
      { "year": "2025", "emission": 13500, "quota": 14000, "status": "compliant" },
      { "year": "2024", "emission": 14200, "quota": 14500, "status": "compliant" }
    ]
  }
}
```

### 12.4 碳排放预测
`GET /carbon-asset/forecast`

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "currentTotal": 12856.50,
    "forecastedTotal": 13200,
    "quotaTotal": 15000,
    "confidence": 0.85,
    "monthlyForecast": [
      { "month": "2026-01", "actual": 1100, "forecast": null },
      { "month": "2026-06", "actual": null, "forecast": 1080 },
      { "month": "2026-12", "actual": null, "forecast": 1150 }
    ]
  }
}
```

### 12.5 配额交易记录
`GET /carbon-asset/transactions`

---

## 十三、数据模型定义

### EnergyRealtime（实时能耗）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| todayEnergy | number | 当日总能耗(tce) |
| monthEnergy | number | 当月累计(tce) |
| yearEnergy | number | 当年累计(tce) |
| byType | object | 按能源类型明细 |

### EnergyHistory（历史能耗）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| date | string | 日期 |
| section | string | 工段名称 |
| device | string | 设备名称 |
| coal | number | 煤炭消耗(t) |
| gas | number | 天然气消耗(m³) |
| electricity | number | 电力消耗(kWh) |
| steam | number | 蒸汽消耗(t) |
| totalTce | number | 折标煤(tce) |

### AlarmRecord（告警记录）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | number | 告警ID |
| time | string | 告警时间 |
| source | string | 来源 |
| content | string | 告警内容 |
| level | string | 等级: red/yellow/blue |
| status | string | 状态: pending/processing/resolved |

### CarbonEmission（碳排放核算）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| scope | number | 范围: 1/2/3 |
| category | string | 类别 |
| consumption | number | 消耗量 |
| emissionFactor | number | 排放因子 |
| emission | number | 排放量(tCO₂e) |

### Supplier（供应商）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| id | number | 供应商ID |
| name | string | 名称 |
| material | string | 物料 |
| purchaseAmount | number | 采购量 |
| emission | number | 碳排放量 |
| rating | string | 评级: A/B/C/D |

### CarbonQuota（碳配额）
| 字段 | 类型 | 说明 |
|:---|:---|:---|
| totalQuota | number | 总配额 |
| usedQuota | number | 已使用 |
| remainQuota | number | 剩余 |
| complianceYear | string | 履约年度 |
