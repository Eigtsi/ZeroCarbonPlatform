<template>
  <el-cascader
    v-model="selected"
    :options="treeData"
    :props="cascaderProps"
    placeholder="选择组织（集团/公司/车间/产线/设备）"
    size="small"
    clearable
    filterable
    style="width: 260px"
    @change="handleChange"
  />
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'OrgCascader',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      selected: this.value
    }
  },
  computed: {
    ...mapState('energy', ['orgTree']),
    treeData() {
      return this.orgTree.length ? this.orgTree : this.getDefaultTree()
    },
    cascaderProps() {
      return {
        value: 'id',
        label: 'label',
        children: 'children',
        checkStrictly: true,
        emitPath: true
      }
    }
  },
  watch: {
    value(val) { this.selected = val }
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val)
      // 获取选中节点的标签路径
      const labels = this.getLabels(val)
      this.$emit('change', { value: val, labels })
    },
    getLabels(ids) {
      if (!ids || !ids.length) return []
      return ids.map(id => this.findLabel(id, this.treeData))
    },
    findLabel(id, nodes) {
      for (const node of nodes) {
        if (node.id === id) return node.label
        if (node.children?.length) {
          const found = this.findLabel(id, node.children)
          if (found) return found
        }
      }
      return id
    },
    getDefaultTree() {
      return [
        { id: 'group_01', label: '某某控股集团', children: [
          { id: 'company_01', label: '某某制造有限公司', children: [
            { id: 'workshop_01', label: '一车间（机加工）', children: [
              { id: 'line_a', label: 'A产线（粗加工）', children: [
                { id: 'eq_mc01', label: 'CNC加工中心 MC-01' },
                { id: 'eq_lt01', label: '数控车床 LT-01' },
                { id: 'eq_ml01', label: '铣床 ML-01' }
              ]},
              { id: 'line_b', label: 'B产线（精加工）', children: [
                { id: 'eq_gr01', label: '精密磨床 GR-01' },
                { id: 'eq_br01', label: '镗床 BR-01' },
                { id: 'eq_cl01', label: '清洗机 CL-01' }
              ]}
            ]},
            { id: 'workshop_02', label: '二车间（热处理+表面处理）', children: [
              { id: 'line_c', label: 'C产线（热处理）', children: [
                { id: 'eq_ht01', label: '淬火炉 HT-01' },
                { id: 'eq_ht02', label: '回火炉 HT-02' },
                { id: 'eq_qc01', label: '油冷槽 QC-01' }
              ]},
              { id: 'line_d', label: 'D产线（电镀）', children: [
                { id: 'eq_ep01', label: '电镀槽 EP-01' },
                { id: 'eq_re01', label: '整流器 RE-01' },
                { id: 'eq_dr01', label: '烘干炉 DR-01' }
              ]}
            ]},
            { id: 'workshop_03', label: '三车间（组装+包装）', children: [
              { id: 'line_e', label: 'E产线（总装线）', children: [
                { id: 'eq_rb01', label: '装配机器人 RB-01' },
                { id: 'eq_tr01', label: '自动拧紧机 TR-01' },
                { id: 'eq_pk01', label: '包装机 PK-01' }
              ]}
            ]},
            { id: 'utility_01', label: '公用工程区', children: [
              { id: 'util_comp', label: '空压站', children: [
                { id: 'eq_ac01', label: '离心空压机 AC-01(250kW)' },
                { id: 'eq_ac02', label: '螺杆空压机 AC-02(132kW)' },
                { id: 'eq_ad01', label: '冷冻干燥机 AD-01' }
              ]},
              { id: 'util_chiller', label: '制冷站', children: [
                { id: 'eq_ch01', label: '离心冷水机 CH-01(1200kW)' },
                { id: 'eq_ch02', label: '螺杆冷水机 CH-02(800kW)' },
                { id: 'eq_ct01', label: '冷却塔 CT-01/02' }
              ]},
              { id: 'util_boiler', label: '锅炉房', children: [
                { id: 'eq_bl01', label: '燃气蒸汽锅炉 BL-01(6t/h)' },
                { id: 'eq_bl02', label: '燃煤蒸汽锅炉 BL-02(4t/h)' }
              ]},
              { id: 'util_water', label: '水处理站', children: [
                { id: 'eq_pw01', label: '纯化水机组 PW-01' },
                { id: 'eq_cp01', label: '循环水泵组 CP-01' },
                { id: 'eq_fp01', label: '消防水泵 FP-01' }
              ]},
              { id: 'util_env', label: '环保设施', children: [
                { id: 'eq_rt01', label: 'RTO废气焚烧炉 RT-01' },
                { id: 'eq_ww01', label: '废水处理站 WW-01' }
              ]}
            ]},
            { id: 'renewable_01', label: '新能源区', children: [
              { id: 'renew_pv', label: '光伏系统(2MWp)', children: [
                { id: 'eq_inv01', label: '逆变器 INV-01(500kW)' },
                { id: 'eq_inv02', label: '逆变器 INV-02(500kW)' }
              ]},
              { id: 'renew_bess', label: '储能系统(500kW/1MWh)', children: [
                { id: 'eq_pcs01', label: '储能变流器 PCS-01(500kW)' }
              ]}
            ]},
            { id: 'auxiliary_01', label: '生活附属区', children: [
              { id: 'aux_office', label: '行政办公楼' },
              { id: 'aux_canteen', label: '员工食堂' },
              { id: 'aux_dorm', label: '员工宿舍' }
            ]}
          ]}
        ]}
      ]
    }
  }
}
</script>
