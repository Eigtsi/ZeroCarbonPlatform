<template>
  <div class="time-range-picker">
    <div class="dimension-tabs">
      <span
        v-for="dim in dimensions"
        :key="dim.key"
        :class="['dim-item', { active: activeDim === dim.key }]"
        @click="handleDimChange(dim.key)"
      >{{ dim.label }}</span>
    </div>
    <div class="range-picker">
      <template v-if="activeDim === 'day'">
        <el-date-picker
          v-model="dateValue"
          type="date"
          placeholder="选择日期"
          size="small"
          value-format="YYYY-MM-DD"
          @change="handleChange"
        />
      </template>
      <template v-else-if="activeDim === 'month'">
        <el-date-picker
          v-model="dateValue"
          type="month"
          placeholder="选择月份"
          size="small"
          value-format="YYYY-MM"
          @change="handleChange"
        />
      </template>
      <template v-else-if="activeDim === 'quarter'">
        <el-date-picker
          v-model="dateValue"
          type="month"
          placeholder="选择季度月份"
          size="small"
          value-format="YYYY-MM"
          @change="handleChange"
        />
      </template>
      <template v-else>
        <el-date-picker
          v-model="dateValue"
          type="year"
          placeholder="选择年份"
          size="small"
          value-format="YYYY"
          @change="handleChange"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { TIME_DIMENSIONS } from '@/utils/enum'

export default {
  name: 'TimeRangePicker',
  props: {
    value: { type: [String, Date], default: '' },
    dimension: { type: String, default: 'month' }
  },
  data() {
    return {
      activeDim: this.dimension,
      dateValue: this.value,
      dimensions: TIME_DIMENSIONS
    }
  },
  methods: {
    handleDimChange(key) {
      this.activeDim = key
      this.$emit('dimension-change', key)
    },
    handleChange(val) {
      this.$emit('input', val)
      this.$emit('change', { dimension: this.activeDim, value: val })
    }
  }
}
</script>

<style lang="scss" scoped>
.time-range-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dimension-tabs {
  display: flex;
  gap: 4px;
  background: #F5F5F5;
  border-radius: 4px;
  padding: 2px;

  .dim-item {
    padding: 4px 12px;
    font-size: $font-size-12;
    color: $text-secondary;
    cursor: pointer;
    border-radius: 3px;
    transition: all $transition-duration;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      background: $background-white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
