<template>
  <div class="equipment-settings">
    <div class="page-bar">
      <span class="page-desc">管理全厂用能设备台账，数据与组织架构、计量点位保持一致。</span>
      <el-button size="small" type="primary" icon="el-icon-plus" @click="handleAdd">新增设备</el-button>
    </div>

    <!-- 搜索过滤栏 -->
    <div class="filter-bar">
      <el-input v-model="searchKey" size="small" placeholder="搜索设备名称/型号/计量点" clearable style="width:260px" prefix-icon="el-icon-search" @input="currentPage=1" />
      <el-select v-model="filterArea" size="small" placeholder="筛选区域" clearable style="width:140px" @change="currentPage=1">
        <el-option label="全部区域" value="" />
        <el-option label="一车间" value="一车间" />
        <el-option label="二车间" value="二车间" />
        <el-option label="三车间" value="三车间" />
        <el-option label="公用工程" value="公用工程" />
        <el-option label="新能源区" value="新能源区" />
        <el-option label="生活附属" value="生活附属" />
      </el-select>
      <span class="filter-count">共 {{ filteredList.length }} 台设备</span>
    </div>

    <el-table :data="pagedList" border size="small" style="width:100%" max-height="440">
      <el-table-column type="index" label="#" width="45" align="center" :index="indexMethod" />
      <el-table-column label="所属区域" width="100" prop="area" />
      <el-table-column label="产线/站房" width="110" prop="line" />
      <el-table-column label="设备名称" min-width="170">
        <template slot-scope="{ row }"><el-input v-model="row.name" size="small" /></template>
      </el-table-column>
      <el-table-column label="型号/规格" width="130">
        <template slot-scope="{ row }"><el-input v-model="row.model" size="small" /></template>
      </el-table-column>
      <el-table-column label="功率/容量" width="110" align="center">
        <template slot-scope="{ row }"><el-input v-model="row.power" size="small" /></template>
      </el-table-column>
      <el-table-column label="计量点" width="85" align="center">
        <template slot-scope="{ row }"><el-input v-model="row.meterId" size="small" /></template>
      </el-table-column>
      <el-table-column label="主要能源" width="100">
        <template slot-scope="{ row }">
          <el-select v-model="row.energyType" size="small">
            <el-option value="electricity" label="电力" />
            <el-option value="natural_gas" label="天然气" />
            <el-option value="coal" label="煤炭" />
            <el-option value="steam" label="蒸汽" />
            <el-option value="diesel" label="柴油" />
            <el-option value="solar" label="光伏" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="采集协议" width="110">
        <template slot-scope="{ row }"><el-input v-model="row.protocol" size="small" /></template>
      </el-table-column>
      <el-table-column label="状态" width="65" align="center">
        <template slot-scope="{ row }"><el-switch v-model="row.enabled" size="small" /></template>
      </el-table-column>
      <el-table-column label="操作" width="55" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" icon="el-icon-delete" style="color:#FF4D4F" @click="handleDelete(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        :total="filteredList.length"
        layout="total, sizes, prev, pager, next"
        size="small"
        @size-change="pageSize=$event;currentPage=1"
        @current-change="currentPage=$event"
      />
    </div>

    <div class="page-actions">
      <el-button size="small" @click="resetEquipment">恢复默认</el-button>
      <el-button size="small" type="primary" @click="saveEquipment">保存设置</el-button>
    </div>
  </div>
</template>

<script>
const DEFAULT_EQUIPMENT = [
  { area:'一车间', line:'A产线(粗加工)', name:'CNC加工中心 MC-01', model:'DMG DMU 50', power:'45kW', meterId:'M05', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'一车间', line:'A产线(粗加工)', name:'数控车床 LT-01', model:'MAZAK QTE-200', power:'30kW', meterId:'M06', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'一车间', line:'A产线(粗加工)', name:'铣床 ML-01', model:'X6132', power:'22kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'一车间', line:'B产线(精加工)', name:'精密磨床 GR-01', model:'M1432', power:'18kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'一车间', line:'B产线(精加工)', name:'镗床 BR-01', model:'TPX6113', power:'25kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'一车间', line:'B产线(精加工)', name:'清洗机 CL-01', model:'QX-800', power:'12kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'二车间', line:'C产线(热处理)', name:'淬火炉 HT-01', model:'RT-1200', power:'280kW', meterId:'M07', energyType:'natural_gas', protocol:'Modbus TCP', enabled:true },
  { area:'二车间', line:'C产线(热处理)', name:'回火炉 HT-02', model:'RT-800', power:'160kW', meterId:'M07b', energyType:'natural_gas', protocol:'Modbus TCP', enabled:true },
  { area:'二车间', line:'C产线(热处理)', name:'油冷槽 QC-01', model:'YC-2000', power:'15kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'二车间', line:'D产线(电镀)', name:'电镀槽 EP-01', model:'DD-3000', power:'55kW', meterId:'M08b', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'二车间', line:'D产线(电镀)', name:'整流器 RE-01', model:'ZL-500A', power:'35kW', meterId:'--', energyType:'electricity', protocol:'4-20mA', enabled:true },
  { area:'二车间', line:'D产线(电镀)', name:'烘干炉 DR-01', model:'HG-1000', power:'60kW', meterId:'--', energyType:'natural_gas', protocol:'Modbus RTU', enabled:true },
  { area:'三车间', line:'E产线(总装)', name:'装配机器人 RB-01', model:'FANUC R-2000i', power:'12kW', meterId:'--', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'三车间', line:'E产线(总装)', name:'自动拧紧机 TR-01', model:'NJ-500', power:'8kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'三车间', line:'E产线(总装)', name:'包装机 PK-01', model:'BZ-2000', power:'15kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'公用工程', line:'空压站', name:'离心空压机 AC-01', model:'IR C1000', power:'250kW', meterId:'M16', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'空压站', name:'螺杆空压机 AC-02', model:'AC L160', power:'132kW', meterId:'M17', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'空压站', name:'冷冻干燥机 AD-01', model:'DR-500', power:'18kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'公用工程', line:'制冷站', name:'离心冷水机 CH-01', model:'YK M3M3E', power:'380kW', meterId:'M21', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'制冷站', name:'螺杆冷水机 CH-02', model:'30XW-V', power:'250kW', meterId:'M22', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'制冷站', name:'冷却塔 CT-01/02', model:'LRT-400', power:'22kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'公用工程', line:'锅炉房', name:'燃气蒸汽锅炉 BL-01', model:'WNS6-1.25-Q', power:'6t/h', meterId:'M10', energyType:'natural_gas', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'锅炉房', name:'燃煤蒸汽锅炉 BL-02', model:'DZL4-1.25-AII', power:'4t/h', meterId:'M12', energyType:'coal', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'水处理站', name:'纯化水机组 PW-01', model:'RO-20T', power:'45kW', meterId:'M25', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'水处理站', name:'循环水泵组 CP-01', model:'ISG150-315', power:'30kW', meterId:'M24', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'公用工程', line:'水处理站', name:'消防水泵 FP-01', model:'XBD8/40', power:'55kW', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'公用工程', line:'环保设施', name:'RTO废气焚烧炉 RT-01', model:'RTO-30000', power:'90kW', meterId:'M26', energyType:'natural_gas', protocol:'Modbus TCP', enabled:true },
  { area:'公用工程', line:'环保设施', name:'废水处理站 WW-01', model:'WS-500', power:'35kW', meterId:'M27', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'新能源区', line:'光伏系统', name:'逆变器 INV-01', model:'SUN2000-500KTL', power:'500kW', meterId:'M31', energyType:'solar', protocol:'Modbus TCP', enabled:true },
  { area:'新能源区', line:'光伏系统', name:'逆变器 INV-02', model:'SUN2000-500KTL', power:'500kW', meterId:'--', energyType:'solar', protocol:'Modbus TCP', enabled:true },
  { area:'新能源区', line:'储能系统', name:'储能变流器 PCS-01', model:'PCS-500', power:'500kW', meterId:'M33', energyType:'electricity', protocol:'Modbus TCP', enabled:true },
  { area:'生活附属', line:'综合楼', name:'行政办公楼', model:'--', power:'--', meterId:'M28', energyType:'electricity', protocol:'Modbus RTU', enabled:true },
  { area:'生活附属', line:'食堂', name:'员工食堂', model:'--', power:'--', meterId:'M29', energyType:'natural_gas', protocol:'NB-IoT', enabled:true },
  { area:'生活附属', line:'宿舍', name:'员工宿舍', model:'--', power:'--', meterId:'M30', energyType:'electricity', protocol:'Modbus RTU', enabled:true }
]

export default {
  name: 'EquipmentSettings',
  data() {
    return {
      equipmentList: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT)),
      defaults: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT)),
      searchKey: '',
      filterArea: '',
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    filteredList() {
      let list = this.equipmentList
      if (this.filterArea) list = list.filter(e => e.area === this.filterArea)
      if (this.searchKey) {
        const kw = this.searchKey.toLowerCase()
        list = list.filter(e => e.name.toLowerCase().includes(kw) || e.model.toLowerCase().includes(kw) || e.meterId.toLowerCase().includes(kw))
      }
      return list
    },
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredList.slice(start, start + this.pageSize)
    }
  },
  methods: {
    indexMethod(idx) { return (this.currentPage - 1) * this.pageSize + idx + 1 },
    handleAdd() {
      this.equipmentList.push({ area:'', line:'', name:'新设备', model:'', power:'', meterId:'--', energyType:'electricity', protocol:'Modbus RTU', enabled:true })
      this.currentPage = Math.ceil(this.filteredList.length / this.pageSize)
      this.$message.success('已添加设备，请编辑后保存')
    },
    handleDelete(pageIdx) {
      const item = this.pagedList[pageIdx]
      if (!item) return
      const realIdx = this.equipmentList.findIndex(e => e.name === item.name && e.meterId === item.meterId && e.area === item.area)
      if (realIdx > -1) this.equipmentList.splice(realIdx, 1)
      if (this.pagedList.length === 0 && this.currentPage > 1) this.currentPage--
      this.$message.success('已删除')
    },
    saveEquipment() { this.defaults = JSON.parse(JSON.stringify(this.equipmentList)); this.$message.success('设备台账已保存') },
    resetEquipment() { this.equipmentList = JSON.parse(JSON.stringify(this.defaults)); this.searchKey = ''; this.filterArea = ''; this.currentPage = 1; this.$message.info('已恢复默认') }
  }
}
</script>

<style lang="scss" scoped>
.equipment-settings { padding: $spacing-lg; }
.page-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.page-desc { font-size: 13px; color: $text-secondary; }
.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.filter-count { font-size: 12px; color: $text-placeholder; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 8px; }
.page-actions { margin-top: 12px; text-align: right; }
</style>
