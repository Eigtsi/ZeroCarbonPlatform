<template>
  <div class="data-table">
    <div v-if="title || $slots.toolbar" class="table-header">
      <span class="table-title">{{ title }}</span>
      <div class="table-toolbar">
        <slot name="toolbar"></slot>
        <el-button v-if="exportable" size="small" icon="el-icon-download" @click="handleExport">
          导出
        </el-button>
      </div>
    </div>
    <el-table
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :max-height="maxHeight"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <slot></slot>
    </el-table>
    <div v-if="pagination" class="table-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    title: { type: String, default: '' },
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    border: { type: Boolean, default: true },
    stripe: { type: Boolean, default: true },
    maxHeight: { type: Number, default: undefined },
    pagination: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    size: { type: Number, default: 20 },
    exportable: { type: Boolean, default: false }
  },
  data() {
    return {
      currentPage: this.page,
      pageSize: this.size
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.$emit('page-change', { page: this.currentPage, size: val })
    },
    handlePageChange(val) {
      this.currentPage = val
      this.$emit('page-change', { page: val, size: this.pageSize })
    },
    handleSelectionChange(val) {
      this.$emit('selection-change', val)
    },
    handleSortChange(val) {
      this.$emit('sort-change', val)
    },
    handleExport() {
      this.$emit('export')
    }
  }
}
</script>

<style lang="scss" scoped>
.data-table {
  background: $background-white;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $card-shadow;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  font-family: $font-title;
  font-size: $font-size-16;
  color: $text-primary;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
