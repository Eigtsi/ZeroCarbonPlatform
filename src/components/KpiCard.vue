<template>
  <div :class="['kpi-card', `kpi-card--${status}`]" :style="color ? { borderLeftColor: color } : {}">
    <div class="kpi-card__header">
      <span class="kpi-card__label">{{ label }}</span>
      <el-tooltip v-if="tip" :content="tip" placement="top">
        <i class="el-icon-info kpi-card__tip"></i>
      </el-tooltip>
    </div>
    <div class="kpi-card__value">
      <span :class="['kpi-card__number', { 'flash-animate': flash }]">{{ displayValue }}</span>
      <span class="kpi-card__unit">{{ unit }}</span>
    </div>
    <div v-if="trend" class="kpi-card__trend">
      <span :class="['trend-tag', `trend--${trend.type}`]">
        <i :class="trendIcon"></i>
        {{ trend.value }}%
      </span>
      <span class="trend-label">（{{ trendLabel }}）</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], default: '--' },
    unit: { type: String, default: '' },
    status: { type: String, default: 'default', validator: v => ['default', 'success', 'warning', 'danger'].includes(v) },
    color: { type: String, default: '' },
    trend: { type: Object, default: null },
    trendLabel: { type: String, default: '同比' },
    tip: { type: String, default: '' },
    flash: { type: Boolean, default: false },
    decimal: { type: Number, default: 2 }
  },
  computed: {
    displayValue() {
      if (this.value === '--' || this.value === null || this.value === undefined) return '--'
      return Number(this.value).toLocaleString('zh-CN', {
        minimumFractionDigits: this.decimal,
        maximumFractionDigits: this.decimal
      })
    },
    trendIcon() {
      if (this.trend.type === 'up') return 'el-icon-top'
      if (this.trend.type === 'down') return 'el-icon-bottom'
      return 'el-icon-minus'
    }
  }
}
</script>

<style lang="scss" scoped>
.kpi-card {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
  border-left: 3px solid transparent;
  transition: all $transition-duration;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &--success { border-left-color: $success-color; }
  &--warning { border-left-color: $warning-color; }
  &--danger { border-left-color: $danger-color; }

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  &__label {
    font-family: $font-body;
    font-size: $font-size-14;
    color: $text-secondary;
  }

  &__tip {
    color: $text-placeholder;
    font-size: 14px;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__number {
    font-family: $font-d-din;
    font-size: $font-size-24;
    line-height: 26px;
    color: $text-primary;
    font-weight: 400;
  }

  &__unit {
    font-size: $font-size-12;
    color: $text-secondary;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }
}

.trend-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: $font-size-12;
  font-family: $font-d-din;
  padding: 2px 6px;
  border-radius: 2px;

  &.trend--up {
    color: $danger-color;
    background: rgba($danger-color, 0.1);
  }

  &.trend--down {
    color: $success-color;
    background: rgba($success-color, 0.1);
  }

  &.trend--stable {
    color: $text-secondary;
    background: rgba($text-secondary, 0.1);
  }
}

.trend-label {
  font-size: $font-size-12;
  color: $text-placeholder;
}
</style>
