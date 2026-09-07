import Vue from 'vue'
import VueRouter from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/energy/query',
    children: [
      // ---- 能源管理模块 ----
      {
        path: 'energy/query',
        name: 'EnergyQuery',
        component: () => import('@/views/energy/query/EnergyQuery.vue'),
        meta: { title: '能耗查询', parent: '能源管理', icon: 'energy' }
      },
      {
        path: 'energy/consumption',
        name: 'EnergyConsumption',
        component: () => import('@/views/energy/intensity/Consumption.vue'),
        meta: { title: '能源消费量', parent: '能源消费量与强度', icon: 'calculate' }
      },
      {
        path: 'energy/intensity',
        name: 'EnergyIntensity',
        component: () => import('@/views/energy/intensity/IntensityCalc.vue'),
        meta: { title: '能源强度', parent: '能源消费量与强度', icon: 'calculate' }
      },
      {
        path: 'energy/analysis',
        name: 'EnergyAnalysis',
        component: () => import('@/views/energy/EnergyAnalysis.vue'),
        meta: { title: '能源分析', parent: '能源分析与策略', icon: 'analysis' }
      },
      {
        path: 'energy/strategy',
        name: 'EnergyStrategy',
        component: () => import('@/views/energy/EnergyStrategy.vue'),
        meta: { title: '能源策略推荐', parent: '能源分析与策略', icon: 'strategy' }
      },
      {
        path: 'energy/benchmark',
        name: 'EnergyBenchmark',
        component: () => import('@/views/energy/EnergyBenchmark.vue'),
        meta: { title: '能效对标', parent: '能源管理', icon: 'benchmark' }
      },
      {
        path: 'energy/flow',
        name: 'EnergyFlow',
        component: () => import('@/views/energy/EnergyFlow.vue'),
        meta: { title: '能流分析', parent: '能源管理', icon: 'flow' }
      },
      {
        path: 'energy/balance',
        name: 'EnergyBalance',
        component: () => import('@/views/energy/EnergyBalance.vue'),
        meta: { title: '能效平衡与优化', parent: '能源管理', icon: 'balance' }
      },
      {
        path: 'energy/budget',
        name: 'BudgetManage',
        component: () => import('@/views/energy/BudgetManage.vue'),
        meta: { title: '用能与碳排放预算管理', parent: '能源管理', icon: 'budget' }
      },
      // ---- 碳管理模块 ----
      {
        path: 'carbon/accounting',
        name: 'CarbonAccounting',
        component: () => import('@/views/carbon/CarbonAccounting.vue'),
        meta: { title: '碳排放核算', parent: '碳管理', icon: 'carbon' }
      },
      {
        path: 'carbon/footprint',
        name: 'CarbonFootprint',
        component: () => import('@/views/carbon/CarbonFootprint.vue'),
        meta: { title: '产品碳足迹核算', parent: '碳管理', icon: 'footprint' }
      },
      {
        path: 'carbon/supply-chain',
        name: 'SupplyChainCarbon',
        component: () => import('@/views/carbon/SupplyChainCarbon.vue'),
        meta: { title: '供应链碳管理', parent: '碳管理', icon: 'supply' }
      },
      {
        path: 'carbon/verification',
        name: 'CarbonVerification',
        component: () => import('@/views/carbon/CarbonVerification.vue'),
        meta: { title: '碳核查支撑', parent: '碳管理', icon: 'verify' }
      },
      {
        path: 'carbon/asset',
        name: 'CarbonAsset',
        component: () => import('@/views/carbon/CarbonAsset.vue'),
        meta: { title: '碳资产管理', parent: '碳管理', icon: 'asset' }
      },
      // ---- 系统设置 ----
      {
        path: 'system/alarm',
        name: 'AlarmSettings',
        component: () => import('@/views/system/AlarmSettings.vue'),
        meta: { title: '告警阈值设置', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/factor',
        name: 'FactorSettings',
        component: () => import('@/views/system/FactorSettings.vue'),
        meta: { title: '折标系数管理', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/collect',
        name: 'CollectSettings',
        component: () => import('@/views/system/CollectSettings.vue'),
        meta: { title: '采集参数配置', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/notify',
        name: 'NotifySettings',
        component: () => import('@/views/system/NotifySettings.vue'),
        meta: { title: '通知配置', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/users',
        name: 'UserSettings',
        component: () => import('@/views/system/UserSettings.vue'),
        meta: { title: '用户管理', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/roles',
        name: 'RoleSettings',
        component: () => import('@/views/system/RoleSettings.vue'),
        meta: { title: '角色管理', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/equipment',
        name: 'EquipmentSettings',
        component: () => import('@/views/system/EquipmentSettings.vue'),
        meta: { title: '用能设备管理', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/targets',
        name: 'TargetSettings',
        component: () => import('@/views/system/TargetSettings.vue'),
        meta: { title: '强度目标设置', parent: '系统设置', icon: 'system' }
      },
      {
        path: 'system/org',
        name: 'OrgSettings',
        component: () => import('@/views/system/OrgSettings.vue'),
        meta: { title: '组织架构设置', parent: '系统设置', icon: 'system' }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
