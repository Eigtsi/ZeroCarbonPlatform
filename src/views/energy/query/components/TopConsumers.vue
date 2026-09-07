<template>
  <div class="top-consumers">
    <div class="tc-header">
      <span class="tc-title">能耗排名 Top5（{{ periodLabel }}）</span>
    </div>
    <div class="tc-list">
      <div v-for="(item, index) in displayData" :key="item.name" class="tc-item">
        <div class="tc-item__left">
          <span :class="['tc-rank', `rank--${index + 1}`]">{{ index + 1 }}</span>
          <span class="tc-name">{{ item.name }}</span>
        </div>
        <div class="tc-item__right">
          <div class="tc-bar-wrap">
            <div class="tc-bar" :style="{ width: (item.percent / maxPercent * 100) + '%', background: item.color }"></div>
          </div>
          <span class="tc-value font-d-din">{{ item.value }}</span>
          <span class="tc-unit">tce</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopConsumers',
  props: {
    data: { type: Array, default: () => [] },
    period: { type: String, default: 'month' }
  },
  computed: {
    periodLabel() {
      const map = { week:'本周', month:'本月', year:'本年' }
      return map[this.period] || '本月'
    },
    displayData() {
      return this.data.length ? this.data : this.getDefaultData()
    },
    maxPercent() {
      return Math.max(...this.displayData.map(d => d.percent || 0), 1)
    }
  },
  methods: {
    getDefaultData() {
      return [
        { name: '一车间A线', value: '325.6', percent: 22.8, color: '#1890FF' },
        { name: '一车间B线', value: '268.4', percent: 18.8, color: '#2FC25B' },
        { name: '二车间C线', value: '245.2', percent: 17.2, color: '#FACC14' },
        { name: '空压站', value: '198.7', percent: 13.9, color: '#FA8C16' },
        { name: '冷冻站', value: '156.3', percent: 10.9, color: '#722ED1' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.top-consumers {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.tc-header {
  margin-bottom: 16px;
}

.tc-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}

.tc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
  }

  &__right {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.tc-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: $font-size-12;
  font-weight: 600;
  color: $text-secondary;
  background: #F0F0F0;

  &--1 { color: #fff; background: #FF4D4F; }
  &--2 { color: #fff; background: #FA541C; }
  &--3 { color: #fff; background: #FAAD14; }
}

.tc-name {
  font-size: $font-size-14;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-bar-wrap {
  flex: 1;
  height: 8px;
  background: #F0F0F0;
  border-radius: 4px;
  overflow: hidden;
}

.tc-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  min-width: 4px;
}

.tc-value {
  font-size: $font-size-14;
  color: $text-primary;
  min-width: 60px;
  text-align: right;
}

.tc-unit {
  font-size: $font-size-12;
  color: $text-placeholder;
  min-width: 30px;
}
</style>
