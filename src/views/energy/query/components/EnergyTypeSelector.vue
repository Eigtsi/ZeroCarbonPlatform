<template>
  <div class="energy-type-selector">
    <el-popover placement="bottom-start" width="360" trigger="click">
      <div class="type-selector-pop">
        <div class="pop-header">
          <el-checkbox :indeterminate="isIndeterminate" :value="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
          <el-button type="text" size="mini" @click="handleClear">清空</el-button>
        </div>
        <div v-for="group in categories" :key="group.key" class="type-group">
          <div class="group-header">
            <i
              :class="expandedGroups[group.key] ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
              class="group-arrow"
              @click="toggleGroup(group.key)"
            />
            <el-checkbox
              :value="isGroupAllSelected(group.key)"
              :indeterminate="isGroupIndeterminate(group.key)"
              @change="handleGroupToggle(group.key)"
            >{{ group.label }}</el-checkbox>
          </div>
          <div v-show="expandedGroups[group.key]" class="group-items">
            <el-checkbox
              v-for="item in group.children"
              :key="item.key"
              :value="selectedTypes.includes(item.key)"
              class="sub-item"
              @change="handleToggle(item.key)"
            >
              <span class="type-dot" :style="{ background: item.color || group.color }"></span>
              {{ item.label }}
              <span class="type-unit">{{ item.unit }}</span>
            </el-checkbox>
          </div>
        </div>
      </div>
      <el-button slot="reference" size="small" :class="{ 'has-selection': selectedTypes.length }">
        能源品种 <span v-if="selectedTypes.length">({{ selectedTypes.length }})</span>
        <i class="el-icon-arrow-down"></i>
      </el-button>
    </el-popover>
    <span v-if="selectedTypes.length" class="selected-tags">
      <el-tag v-for="key in selectedTypes.slice(0, 3)" :key="key" size="small" closable @close="handleToggle(key)">{{ getLabel(key) }}</el-tag>
      <el-tag v-if="selectedTypes.length > 3" size="small" type="info">+{{ selectedTypes.length - 3 }}</el-tag>
    </span>
  </div>
</template>

<script>
export default {
  name: 'EnergyTypeSelector',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      selectedTypes: [...this.value],
      expandedGroups: {},
      categories: [
        {
          key: 'solid_fuel', label: '固体燃料', color: '#4A4A4A',
          children: [
            { key: 'raw_coal', label: '原煤', unit: 't', color: '#E64A19' },
            { key: 'washed_coal', label: '洗精煤', unit: 't', color: '#FF7043' },
            { key: 'coke', label: '焦炭', unit: 't', color: '#8D6E63' },
            { key: 'coal_gangue', label: '煤矸石', unit: 't', color: '#A1887F' }
          ]
        },
        {
          key: 'liquid_fuel', label: '液体燃料', color: '#CD853F',
          children: [
            { key: 'crude_oil', label: '原油', unit: 't', color: '#D84315' },
            { key: 'gasoline', label: '汽油', unit: 't', color: '#EF6C00' },
            { key: 'kerosene', label: '煤油', unit: 't', color: '#F9A825' },
            { key: 'diesel', label: '柴油', unit: 't', color: '#827717' },
            { key: 'fuel_oil', label: '燃料油', unit: 't', color: '#BF360C' },
            { key: 'lpg', label: '液化石油气', unit: 't', color: '#E65100' }
          ]
        },
        {
          key: 'gas_fuel', label: '气体燃料', color: '#2FC25B',
          children: [
            { key: 'natural_gas', label: '天然气', unit: '万m³', color: '#00C853' },
            { key: 'coke_oven_gas', label: '焦炉煤气', unit: '万m³', color: '#64DD17' },
            { key: 'bf_gas', label: '高炉煤气', unit: '万m³', color: '#009688' },
            { key: 'converter_gas', label: '转炉煤气', unit: '万m³', color: '#26A69A' },
            { key: 'lng', label: '液化天然气', unit: 't', color: '#00897B' }
          ]
        },
        {
          key: 'electricity', label: '电力', color: '#1890FF',
          children: [
            { key: 'grid_power', label: '电网购电', unit: '万kWh', color: '#1565C0' },
            { key: 'hydro_power', label: '水电', unit: '万kWh', color: '#00ACC1' },
            { key: 'wind_power', label: '风电', unit: '万kWh', color: '#43A047' },
            { key: 'solar_power', label: '光伏发电', unit: '万kWh', color: '#FF8F00' },
            { key: 'biomass_power', label: '生物质发电', unit: '万kWh', color: '#6D4C41' },
            { key: 'nuclear_power', label: '核电', unit: '万kWh', color: '#7B1FA2' },
            { key: 'high_voltage', label: '外购高压电', unit: '万kWh', color: '#283593' }
          ]
        },
        {
          key: 'heat', label: '热力', color: '#FACC14',
          children: [
            { key: 'steam_high', label: '高压蒸汽', unit: 't', color: '#F57F17' },
            { key: 'steam_low', label: '低压蒸汽', unit: 't', color: '#FDD835' },
            { key: 'hot_water', label: '热水', unit: 'GJ', color: '#FFB300' }
          ]
        },
        {
          key: 'other_fuel', label: '其他燃料', color: '#722ED1',
          children: [
            { key: 'methanol', label: '甲醇', unit: 't', color: '#6A1B9A' },
            { key: 'ethanol', label: '乙醇', unit: 't', color: '#8E24AA' },
            { key: 'hydrogen', label: '氢气', unit: '万m³', color: '#AB47BC' },
            { key: 'biomass_fuel', label: '生物质燃料', unit: 't', color: '#CE93D8' }
          ]
        }
      ]
    }
  },
  computed: {
    allKeys() {
      return this.categories.reduce((arr, g) => arr.concat(g.children.map(c => c.key)), [])
    },
    isAllSelected() {
      return this.allKeys.every(k => this.selectedTypes.includes(k))
    },
    isIndeterminate() {
      const sel = this.selectedTypes.filter(k => this.allKeys.includes(k)).length
      return sel > 0 && sel < this.allKeys.length
    }
  },
  watch: {
    value(val) { this.selectedTypes = [...val] }
  },
  methods: {
    toggleGroup(key) {
      this.$set(this.expandedGroups, key, !this.expandedGroups[key])
    },
    isGroupAllSelected(key) {
      const g = this.categories.find(c => c.key === key)
      return g ? g.children.every(c => this.selectedTypes.includes(c.key)) : false
    },
    isGroupIndeterminate(key) {
      const g = this.categories.find(c => c.key === key)
      if (!g) return false
      const sel = g.children.filter(c => this.selectedTypes.includes(c.key)).length
      return sel > 0 && sel < g.children.length
    },
    handleSelectAll(val) {
      this.selectedTypes = val ? [...this.allKeys] : []
      this.emitChange()
    },
    handleClear() {
      this.selectedTypes = []
      this.emitChange()
    },
    handleGroupToggle(key) {
      const g = this.categories.find(c => c.key === key)
      if (!g) return
      const keys = g.children.map(c => c.key)
      const allSel = keys.every(k => this.selectedTypes.includes(k))
      if (allSel) {
        this.selectedTypes = this.selectedTypes.filter(k => !keys.includes(k))
      } else {
        keys.forEach(k => { if (!this.selectedTypes.includes(k)) this.selectedTypes.push(k) })
      }
      this.emitChange()
    },
    handleToggle(key) {
      const idx = this.selectedTypes.indexOf(key)
      if (idx > -1) { this.selectedTypes.splice(idx, 1) }
      else { this.selectedTypes.push(key) }
      this.emitChange()
    },
    getLabel(key) {
      for (const g of this.categories) {
        const f = g.children.find(c => c.key === key)
        if (f) return f.label
      }
      return key
    },
    emitChange() {
      this.$emit('input', [...this.selectedTypes])
      this.$emit('change', [...this.selectedTypes])
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-type-selector {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.type-selector-pop {
  max-height: 420px;
  overflow-y: auto;

  .pop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid $divider-color;
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
  }

  .type-group {
    margin-bottom: 8px;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 0;
    font-weight: 600;
    font-size: 13px;
    color: $text-primary;
    user-select: none;
  }

  .group-arrow {
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover { color: $primary-color; }
  }

  .group-items {
    padding-left: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;
  }

  .sub-item {
    font-size: 12px;
    color: $text-regular;
  }

  .type-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    vertical-align: middle;
  }

  .type-unit {
    font-size: 11px;
    color: $text-placeholder;
    margin-left: 2px;
  }

  .type-count {
    font-size: 11px;
    color: $text-placeholder;
    font-weight: normal;
  }
}

.has-selection {
  color: $primary-color;
  border-color: $primary-color;
}

.selected-tags {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
