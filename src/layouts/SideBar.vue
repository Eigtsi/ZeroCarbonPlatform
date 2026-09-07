<template>
  <div :class="['sidebar', { collapsed: collapsed }]">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#1B6B9C"
      text-color="rgba(255,255,255,0.85)"
      active-text-color="#FFFFFF"
      @select="handleSelect"
    >
      <el-menu-item index="/energy/query">
        <i class="el-icon-search"></i>
        <span slot="title">能耗查询</span>
      </el-menu-item>
      <el-submenu index="energy-mgmt">
        <template slot="title">
          <i class="el-icon-s-data"></i>
          <span>能源消费量与强度</span>
        </template>
        <el-menu-item index="/energy/consumption">
          <i class="el-icon-s-data"></i>
          <span slot="title">能源消费量</span>
        </el-menu-item>
        <el-menu-item index="/energy/intensity">
          <i class="el-icon-s-marketing"></i>
          <span slot="title">能源强度</span>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="energy-analysis">
        <template slot="title">
          <i class="el-icon-data-analysis"></i>
          <span>能源分析与策略</span>
        </template>
        <el-menu-item index="/energy/analysis">
          <i class="el-icon-data-analysis"></i>
          <span slot="title">能源分析</span>
        </el-menu-item>
        <el-menu-item index="/energy/strategy">
          <i class="el-icon-s-opportunity"></i>
          <span slot="title">能源策略推荐</span>
        </el-menu-item>
      </el-submenu>
      <el-menu-item index="/energy/benchmark">
        <i class="el-icon-sort"></i>
        <span slot="title">能效对标</span>
      </el-menu-item>
      <el-menu-item index="/energy/flow">
        <i class="el-icon-share"></i>
        <span slot="title">能流分析</span>
      </el-menu-item>
      <el-menu-item index="/energy/balance">
        <i class="el-icon-s-operation"></i>
        <span slot="title">能效平衡与优化</span>
      </el-menu-item>
      <el-menu-item index="/energy/budget">
        <i class="el-icon-wallet"></i>
        <span slot="title">用能与碳排预算</span>
      </el-menu-item>
      <el-menu-item index="/carbon/accounting">
        <i class="el-icon-document-checked"></i>
        <span slot="title">碳排放核算</span>
      </el-menu-item>
      <el-menu-item index="/carbon/footprint">
        <i class="el-icon-place"></i>
        <span slot="title">产品碳足迹</span>
      </el-menu-item>
      <el-menu-item index="/carbon/supply-chain">
        <i class="el-icon-connection"></i>
        <span slot="title">供应链碳管理</span>
      </el-menu-item>
      <el-menu-item index="/carbon/verification">
        <i class="el-icon-s-check"></i>
        <span slot="title">碳核查支撑</span>
      </el-menu-item>
      <el-menu-item index="/carbon/asset">
        <i class="el-icon-coin"></i>
        <span slot="title">碳资产管理</span>
      </el-menu-item>
      <el-submenu index="system">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span>系统设置</span>
        </template>
        <el-menu-item index="/system/alarm">
          <i class="el-icon-warning-outline"></i>
          <span slot="title">告警阈值设置</span>
        </el-menu-item>
        <el-menu-item index="/system/factor">
          <i class="el-icon-s-operation"></i>
          <span slot="title">折标系数管理</span>
        </el-menu-item>
        <el-menu-item index="/system/collect">
          <i class="el-icon-connection"></i>
          <span slot="title">采集参数配置</span>
        </el-menu-item>
        <el-menu-item index="/system/notify">
          <i class="el-icon-message"></i>
          <span slot="title">通知配置</span>
        </el-menu-item>
        <el-menu-item index="/system/users">
          <i class="el-icon-user"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
        <el-menu-item index="/system/roles">
          <i class="el-icon-s-custom"></i>
          <span slot="title">角色管理</span>
        </el-menu-item>
        <el-menu-item index="/system/equipment">
          <i class="el-icon-cpu"></i>
          <span slot="title">用能设备管理</span>
        </el-menu-item>
        <el-menu-item index="/system/targets">
          <i class="el-icon-aim"></i>
          <span slot="title">强度目标设置</span>
        </el-menu-item>
        <el-menu-item index="/system/org">
          <i class="el-icon-s-operation"></i>
          <span slot="title">组织架构设置</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <div class="collapse-btn" @click="toggleCollapse">
      <i :class="collapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    handleSelect(index) {
      if (this.$route.path !== index) {
        this.$router.push(index)
      }
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  height: 100%;
  background: $sidebar-dark-bg;
  display: flex;
  flex-direction: column;
  transition: width $transition-duration;
  overflow: hidden;
  flex-shrink: 0;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }

  .el-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0;
    }
  }

  .el-menu-item {
    height: 48px;
    line-height: 48px;
    font-size: $font-size-14;
    font-family: $font-body;
    padding: 0 16px !important;

    i {
      font-size: 18px;
      margin-right: 10px;
    }

    &:hover {
      background-color: $sidebar-dark-item !important;
    }

    &.is-active {
      background-color: $primary-color !important;
    }
  }

  .collapse-btn {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    transition: all $transition-duration;

    &:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.1);
    }

    i {
      font-size: 18px;
    }
  }

  // 子菜单：深色背景 + 缩进
  ::v-deep .el-submenu {
    .el-submenu__title {
      height: 48px; line-height: 48px;
      font-size: $font-size-14; font-family: $font-body;
      padding: 0 16px !important;
      i { font-size: 18px; margin-right: 10px; }
      &:hover { background-color: $sidebar-dark-item !important; }
    }
    .el-menu {
      background: #155575 !important;
      .el-menu-item {
        padding-left: 50px !important;
        background: #155575 !important;
        &:hover { background-color: $sidebar-dark-item !important; }
        &.is-active { background-color: $primary-color !important; }
      }
    }
  }
}
</style>
