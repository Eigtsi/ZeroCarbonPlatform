<template>
  <div class="tab-bar">
    <div class="tab-list">
      <span
        v-for="view in visitedViews"
        :key="view.path"
        :class="['tab-item', { active: isActive(view) }]"
        @click="handleClick(view)"
      >
        <span class="tab-label">{{ view.meta?.title || view.name }}</span>
        <i
          v-if="!view.meta?.affix"
          class="el-icon-close tab-close"
          @click.stop="handleClose(view)"
        />
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TabBar',
  computed: {
    ...mapState(['visitedViews'])
  },
  methods: {
    isActive(view) {
      return view.path === this.$route.path
    },
    handleClick(view) {
      if (view.path !== this.$route.path) {
        this.$router.push(view.path).catch(() => {})
      }
    },
    async handleClose(view) {
      const views = await this.$store.dispatch('delVisitedView', view)
      if (this.isActive(view)) {
        // 关闭当前页签，跳到最后一个
        const last = views[views.length - 1]
        if (last) {
          this.$router.push(last.path).catch(() => {})
        } else {
          this.$router.push('/energy/query').catch(() => {})
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  height: 36px;
  background: $background-white;
  border-bottom: 1px solid $divider-color;
  display: flex;
  align-items: center;
  padding: 0 8px;
  flex-shrink: 0;
}

.tab-list {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;

  &::-webkit-scrollbar { height: 0; }
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: $font-size-12;
  color: $text-secondary;
  background: #F5F5F5;
  border: 1px solid $divider-color;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    color: $primary-color;
    background: rgba($primary-color, 0.05);
  }

  &.active {
    color: $primary-color;
    background: rgba($primary-color, 0.08);
    border-color: $primary-color;
  }
}

.tab-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 10px;
  color: $text-placeholder;

  &:hover {
    color: $danger-color;
  }
}
</style>
