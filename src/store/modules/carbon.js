const state = {
  emissionSummary: {},
  quotaBalance: {}
}

const mutations = {
  SET_EMISSION_SUMMARY(state, data) {
    state.emissionSummary = data
  },
  SET_QUOTA_BALANCE(state, data) {
    state.quotaBalance = data
  }
}

const actions = {
  fetchEmissionSummary({ commit }) {
    commit('SET_EMISSION_SUMMARY', {})
  },
  fetchQuotaBalance({ commit }) {
    commit('SET_QUOTA_BALANCE', {})
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
