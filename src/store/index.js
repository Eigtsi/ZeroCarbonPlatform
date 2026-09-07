import Vue from 'vue'
import Vuex from 'vuex'
import energy from './modules/energy'
import carbon from './modules/carbon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sidebarCollapsed: false,
    assistantVisible: false,
    // 多页签系统
    visitedViews: [],
    cachedViews: []
  },
  mutations: {
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    TOGGLE_ASSISTANT(state) {
      state.assistantVisible = !state.assistantVisible
    },
    ADD_VISITED_VIEW(state, view) {
      if (state.visitedViews.some(v => v.path === view.path)) return
      state.visitedViews.push({ ...view })
    },
    DEL_VISITED_VIEW(state, view) {
      const idx = state.visitedViews.findIndex(v => v.path === view.path)
      if (idx > -1) state.visitedViews.splice(idx, 1)
    },
    DEL_ALL_VISITED_VIEWS(state) {
      state.visitedViews = state.visitedViews.filter(v => v.meta?.affix)
    },
    SET_VISITED_VIEWS(state, views) {
      state.visitedViews = views
    }
  },
  actions: {
    addVisitedView({ commit }, view) {
      commit('ADD_VISITED_VIEW', view)
    },
    delVisitedView({ commit, state }, view) {
      commit('DEL_VISITED_VIEW', view)
      return [...state.visitedViews]
    },
    delAllVisitedViews({ commit }) {
      commit('DEL_ALL_VISITED_VIEWS')
    },
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    toggleAssistant({ commit }) {
      commit('TOGGLE_ASSISTANT')
    }
  },
  modules: {
    energy,
    carbon
  }
})
