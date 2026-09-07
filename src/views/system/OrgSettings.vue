<template>
  <div class="org-settings">
    <p class="section-desc">管理组织架构：集团 → 公司 → 车间 → 产线 → 设备，支持五级结构的新增、编辑和删除。</p>

    <div class="org-toolbar">
      <el-button size="small" type="primary" icon="el-icon-plus" @click="showAddDialog(null)">新增公司</el-button>
      <el-button size="small" @click="expandAll">全部展开</el-button>
      <el-button size="small" @click="collapseAll">全部收起</el-button>
    </div>

    <!-- 组织树 -->
    <el-tree
      :data="orgTree"
      :props="treeProps"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      style="margin-top:12px;background:#fff;padding:12px;border-radius:8px"
    >
      <span slot-scope="{ node, data }" class="tree-node">
        <span class="node-label">
          <i :class="nodeIcon(data.level)" style="margin-right:6px;color:#1890FF" />
          {{ data.label }}
          <span class="node-tag">{{ levelName(data.level) }}</span>
        </span>
        <span class="node-actions">
          <el-button type="text" size="mini" icon="el-icon-plus" @click.stop="showAddDialog(data)">添加下级</el-button>
          <el-button type="text" size="mini" icon="el-icon-edit" @click.stop="showEditDialog(data)">编辑</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" style="color:#FF4D4F" @click.stop="handleDelete(node, data)">删除</el-button>
        </span>
      </span>
    </el-tree>

    <!-- 新增/编辑对话框 -->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="450px" append-to-body>
      <el-form :model="form" size="small" label-width="80px">
        <el-form-item label="层级">
          <el-tag size="small" type="info">{{ levelName(form.level) }}</el-tag>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.label" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item v-if="form.level === 5" label="计量点编号">
          <el-input v-model="form.meterId" placeholder="如 M05" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>

    <div class="page-actions">
      <el-button size="small" @click="resetOrg">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveOrg">保存架构</el-button>
    </div>
  </div>
</template>

<script>
const DEFAULT_ORG = [{
  id:'group_01', label:'某某控股集团', level:1,
  children:[{
    id:'company_01', label:'某某制造有限公司', level:2,
    children:[
      { id:'workshop_01', label:'一车间（机加工）', level:3, children:[
        { id:'line_a', label:'A产线（粗加工）', level:4, children:[
          { id:'eq_mc01', label:'CNC加工中心 MC-01', level:5, meterId:'M05' },
          { id:'eq_lt01', label:'数控车床 LT-01', level:5, meterId:'M06' },
          { id:'eq_ml01', label:'铣床 ML-01', level:5 }
        ]},
        { id:'line_b', label:'B产线（精加工）', level:4, children:[
          { id:'eq_gr01', label:'精密磨床 GR-01', level:5 },
          { id:'eq_br01', label:'镗床 BR-01', level:5 },
          { id:'eq_cl01', label:'清洗机 CL-01', level:5 }
        ]}
      ]},
      { id:'workshop_02', label:'二车间（热处理+表面处理）', level:3, children:[
        { id:'line_c', label:'C产线（热处理）', level:4, children:[
          { id:'eq_ht01', label:'淬火炉 HT-01', level:5, meterId:'M07' },
          { id:'eq_ht02', label:'回火炉 HT-02', level:5 },
          { id:'eq_qc01', label:'油冷槽 QC-01', level:5 }
        ]},
        { id:'line_d', label:'D产线（电镀）', level:4, children:[
          { id:'eq_ep01', label:'电镀槽 EP-01', level:5 },
          { id:'eq_re01', label:'整流器 RE-01', level:5 },
          { id:'eq_dr01', label:'烘干炉 DR-01', level:5 }
        ]}
      ]},
      { id:'workshop_03', label:'三车间（组装+包装）', level:3, children:[
        { id:'line_e', label:'E产线（总装线）', level:4, children:[
          { id:'eq_rb01', label:'装配机器人 RB-01', level:5 },
          { id:'eq_tr01', label:'自动拧紧机 TR-01', level:5 },
          { id:'eq_pk01', label:'包装机 PK-01', level:5 }
        ]}
      ]},
      { id:'utility_01', label:'公用工程区', level:3, children:[
        { id:'util_comp', label:'空压站', level:4, children:[
          { id:'eq_ac01', label:'离心空压机 AC-01(250kW)', level:5 },
          { id:'eq_ac02', label:'螺杆空压机 AC-02(132kW)', level:5 }
        ]},
        { id:'util_chiller', label:'制冷站', level:4, children:[
          { id:'eq_ch01', label:'离心冷水机 CH-01(1200kW)', level:5 },
          { id:'eq_ch02', label:'螺杆冷水机 CH-02(800kW)', level:5 }
        ]},
        { id:'util_boiler', label:'锅炉房', level:4, children:[
          { id:'eq_bl01', label:'燃气蒸汽锅炉 BL-01(6t/h)', level:5 },
          { id:'eq_bl02', label:'燃煤蒸汽锅炉 BL-02(4t/h)', level:5 }
        ]}
      ]},
      { id:'renewable_01', label:'新能源区', level:3, children:[
        { id:'renew_pv', label:'光伏系统(2MWp)', level:4, children:[
          { id:'eq_inv01', label:'逆变器 INV-01(500kW)', level:5 },
          { id:'eq_inv02', label:'逆变器 INV-02(500kW)', level:5 }
        ]}
      ]},
      { id:'auxiliary_01', label:'生活附属区', level:3, children:[
        { id:'aux_office', label:'行政办公楼', level:4 },
        { id:'aux_canteen', label:'员工食堂', level:4 },
        { id:'aux_dorm', label:'员工宿舍', level:4 }
      ]}
    ]
  }]
}]

let _nextId = 100

export default {
  name: 'OrgSettings',
  data() {
    return {
      orgTree: JSON.parse(JSON.stringify(DEFAULT_ORG)),
      defaults: JSON.parse(JSON.stringify(DEFAULT_ORG)),
      treeProps: { children:'children', label:'label' },
      dialogVisible: false,
      dialogTitle: '',
      parentNode: null,
      editingNode: null,
      form: { level:1, label:'', meterId:'' }
    }
  },
  methods: {
    levelName(lv) {
      const map = { 1:'集团', 2:'公司', 3:'车间', 4:'产线/站房', 5:'设备' }
      return map[lv] || ''
    },
    nodeIcon(lv) {
      const map = { 1:'el-icon-office-building', 2:'el-icon-school', 3:'el-icon-s-home', 4:'el-icon-s-operation', 5:'el-icon-cpu' }
      return map[lv] || 'el-icon-document'
    },
    findNode(tree, id) {
      for (const n of tree) {
        if (n.id === id) return n
        if (n.children) {
          const found = this.findNode(n.children, id)
          if (found) return found
        }
      }
      return null
    },
    findParent(tree, id, parent = null) {
      for (const n of tree) {
        if (n.id === id) return parent
        if (n.children) {
          const found = this.findParent(n.children, id, n)
          if (found !== undefined) return found
        }
      }
      return undefined
    },
    showAddDialog(parent) {
      this.editingNode = null
      this.parentNode = parent
      const level = parent ? Math.min(parent.level + 1, 5) : 1
      this.form = { level, label:'', meterId:'' }
      this.dialogTitle = parent ? `新增下级 — ${this.levelName(level)}（上级：${parent.label}）` : '新增公司'
      this.dialogVisible = true
    },
    showEditDialog(node) {
      this.editingNode = node
      this.parentNode = null
      this.form = { level:node.level, label:node.label, meterId:node.meterId || '' }
      this.dialogTitle = `编辑 — ${this.levelName(node.level)}：${node.label}`
      this.dialogVisible = true
    },
    handleSave() {
      if (!this.form.label.trim()) { this.$message.warning('请输入名称'); return }
      if (this.editingNode) {
        this.editingNode.label = this.form.label.trim()
        if (this.form.meterId) this.editingNode.meterId = this.form.meterId.trim()
        this.$message.success('已更新')
      } else {
        const newNode = {
          id: `node_${_nextId++}`,
          label: this.form.label.trim(),
          level: this.form.level,
          children: this.form.level < 5 ? [] : undefined
        }
        if (this.form.meterId) newNode.meterId = this.form.meterId.trim()
        if (this.parentNode) {
          if (!this.parentNode.children) this.parentNode.children = []
          this.parentNode.children.push(newNode)
        } else {
          this.orgTree.push(newNode)
        }
        this.$message.success('已添加')
      }
      this.dialogVisible = false
    },
    handleDelete(node, data) {
      if (data.children && data.children.length) {
        this.$confirm(`"${data.label}" 下有 ${data.children.length} 个子节点，确认一并删除？`, '提示', { type:'warning' })
          .then(() => { this.doDelete(node, data) }).catch(() => {})
      } else {
        this.doDelete(node, data)
      }
    },
    doDelete(node, data) {
      const parent = node.parent
      if (parent) {
        const idx = (parent.data || parent).children.findIndex(c => c.id === data.id)
        if (idx > -1) (parent.data || parent).children.splice(idx, 1)
      } else {
        const idx = this.orgTree.findIndex(c => c.id === data.id)
        if (idx > -1) this.orgTree.splice(idx, 1)
      }
      this.$message.success('已删除')
    },
    expandAll() { this.$nextTick(() => { document.querySelectorAll('.el-tree-node').forEach(n => n.classList.add('is-expanded')) }) },
    collapseAll() { this.$nextTick(() => { document.querySelectorAll('.el-tree-node.is-expanded').forEach(n => n.classList.remove('is-expanded')) }) },
    saveOrg() {
      this.defaults = JSON.parse(JSON.stringify(this.orgTree))
      this.$store.commit('SET_ORG_TREE', this.orgTree)
      this.$message.success('组织架构已保存，刷新页面后生效')
    },
    resetOrg() {
      this.orgTree = JSON.parse(JSON.stringify(this.defaults))
      this.$message.info('已恢复默认')
    }
  }
}
</script>

<style lang="scss" scoped>
.org-settings { padding: $spacing-lg; }
.section-desc { font-size: 13px; color: $text-secondary; margin: 0; }
.org-toolbar { display: flex; gap: 8px; margin-top: 12px; }
.tree-node { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 4px 0; }
.node-label { font-size: $font-size-14; color: $text-primary; display: flex; align-items: center; }
.node-tag { font-size: 11px; color: $text-placeholder; background: #f0f0f0; padding: 0 6px; border-radius: 3px; margin-left: 8px; }
.node-actions { display: flex; gap: 2px; flex-shrink: 0; }
.page-actions { margin-top: 24px; text-align: right; }
</style>
