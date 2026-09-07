<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <span class="system-title">野风集团能碳数字化管理平台</span>
    </div>
    <div class="top-bar-center">
      <div
        v-for="item in navModules"
        :key="item.key"
        :class="['nav-item', { active: activeModule === item.key }]"
        @click="handleNavClick(item)"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </div>
    </div>
    <div class="top-bar-right">
      <el-badge :value="3" :max="99" class="alarm-badge">
        <i class="el-icon-bell top-icon"></i>
      </el-badge>
      <el-dropdown @command="handleUserCommand">
        <span class="user-info">
          <i class="el-icon-user-solid"></i>
          <span>管理员</span>
          <i class="el-icon-arrow-down"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="profile">个人设置</el-dropdown-item>
          <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',
  data() {
    return {
      navModules: [
        { key: 'energy', label: '能源管理', icon: 'el-icon-lightning', path: '/energy/query' },
        { key: 'carbon', label: '碳管理', icon: 'el-icon-cloudy', path: '/carbon/accounting' }
      ]
    }
  },
  computed: {
    activeModule() {
      const path = this.$route.path
      if (path.startsWith('/energy')) return 'energy'
      if (path.startsWith('/carbon')) return 'carbon'
      return 'energy'
    }
  },
  methods: {
    handleNavClick(item) {
      if (this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
    },
    handleUserCommand(command) {
      if (command === 'logout') {
        this.$message.info('退出登录')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.top-bar {
  height: $topbar-height;
  background: $topbar-bg;
  display: flex;
  align-items: center;
  padding: 0 $spacing-lg;
  flex-shrink: 0;
}

.top-bar-left {
  .system-title {
    font-family: $font-title;
    font-size: $font-size-20;
    color: #FFFFFF;
    letter-spacing: 2px;
  }
}

.top-bar-center {
  display: flex;
  align-items: center;
  margin-left: 48px;
  flex: 1;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 20px;
    height: $topbar-height;
    color: rgba(255, 255, 255, 0.65);
    font-size: $font-size-14;
    cursor: pointer;
    transition: all $transition-duration;
    border-bottom: 2px solid transparent;

    &:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      color: #FFFFFF;
      border-bottom-color: $primary-color;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: $spacing-lg;

  .top-icon {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;

    &:hover {
      color: #FFFFFF;
    }
  }

  .alarm-badge {
    line-height: 1;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: $font-size-14;
    cursor: pointer;

    &:hover {
      color: #FFFFFF;
    }
  }
}
</style>
