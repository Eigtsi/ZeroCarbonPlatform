<template>
  <div class="compare-card">
    <div class="compare-card__label">{{ label }}</div>
    <div class="compare-card__values">
      <div class="value-item">
        <span class="value-label">本期</span>
        <span class="value-number font-d-din">{{ formatNum(current) }}</span>
        <span class="value-unit">{{ unit }}</span>
      </div>
      <div class="compare-divider"></div>
      <div class="value-item">
        <span class="value-label">{{ compareLabel }}</span>
        <span class="value-number font-d-din">{{ formatNum(compare) }}</span>
        <span class="value-unit">{{ unit }}</span>
      </div>
    </div>
    <div :class="['compare-card__change', `change--${trendType}`]">
      <i :class="trendIcon"></i>
      <span>变化 {{ changeValue }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompareCard',
  props: {
    label: { type: String, required: true },
    current: { type: [Number, String], default: 0 },
    compare: { type: [Number, String], default: 0 },
    unit: { type: String, default: '' },
    compareLabel: { type: String, default: '同期' }
  },
  computed: {
    trendType() {
      const diff = Number(this.current) - Number(this.compare)
      if (diff > 0) return 'up'
      if (diff < 0) return 'down'
      return 'stable'
    },
    changeValue() {
      if (!this.compare || Number(this.compare) === 0) return '0.0'
      return Math.abs((Number(this.current) - Number(this.compare)) / Number(this.compare) * 100).toFixed(1)
    },
    trendIcon() {
      if (this.trendType === 'up') return 'el-icon-top'
      if (this.trendType === 'down') return 'el-icon-bottom'
      return 'el-icon-minus'
    }
  },
  methods: {
    formatNum(val) {
      if (val === '--' || val === null) return '--'
      return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-card {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.compare-card__label {
  font-size: $font-size-14;
  color: $text-secondary;
  margin-bottom: 12px;
}

.compare-card__values {
  display: flex;
  align-items: center;
  gap: 16px;
}

.value-item {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .value-label {
    font-size: $font-size-12;
    color: $text-placeholder;
    margin-right: 4px;
  }

  .value-number {
    font-size: $font-size-20;
    color: $text-primary;
  }

  .value-unit {
    font-size: $font-size-12;
    color: $text-secondary;
  }
}

.compare-divider {
  width: 1px;
  height: 24px;
  background: $divider-color;
}

.compare-card__change {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: $font-size-12;

  &.change--up { color: $danger-color; }
  &.change--down { color: $success-color; }
  &.change--stable { color: $text-secondary; }
}
</style>
