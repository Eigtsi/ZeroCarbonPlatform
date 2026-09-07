<template>
  <div class="main-layout">
    <TopBar />
    <div class="main-body">
      <SideBar />
      <div class="main-content">
        <div class="breadcrumb-wrapper">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/energy/query' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.parent">{{ $route.meta.parent }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <TabBar />
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from './TopBar.vue'
import SideBar from './SideBar.vue'
import TabBar from './TabBar.vue'

export default {
  name: 'MainLayout',
  components: { TopBar, SideBar, TabBar },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.meta?.title) {
          this.$store.dispatch('addVisitedView', {
            path: to.path,
            name: to.name,
            meta: { ...to.meta },
            query: { ...to.query }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $background-color;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px $spacing-lg;
  background: $background-white;
  border-bottom: 1px solid $divider-color;
  flex-shrink: 0;

  .el-breadcrumb {
    font-size: $font-size-14;
    font-family: $font-body;
  }
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-lg;
}
</style>
