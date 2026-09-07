<template>
  <span :class="['alarm-tag', `alarm-tag--${level}`]">
    <i :class="icon"></i>
    {{ text }}
  </span>
</template>

<script>
import { ALARM_LEVELS } from '@/utils/enum'

export default {
  name: 'AlarmTag',
  props: {
    level: { type: String, required: true, validator: v => ['red', 'yellow', 'blue'].includes(v) },
    text: { type: String, default: '' }
  },
  computed: {
    icon() {
      const item = ALARM_LEVELS.find(l => l.key === this.level)
      return item ? item.icon : 'el-icon-info'
    }
  }
}
</script>

<style lang="scss" scoped>
.alarm-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: $font-size-12;
  line-height: 20px;
  border: 1px solid;

  &--red {
    color: $alarm-red;
    background: rgba($alarm-red, 0.08);
    border-color: rgba($alarm-red, 0.3);
  }

  &--yellow {
    color: $alarm-yellow;
    background: rgba($alarm-yellow, 0.08);
    border-color: rgba($alarm-yellow, 0.3);
  }

  &--blue {
    color: $alarm-blue;
    background: rgba($alarm-blue, 0.08);
    border-color: rgba($alarm-blue, 0.3);
  }
}
</style>
