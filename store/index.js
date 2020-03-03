export const strict = false

export const state = () => ({
  username: null,
  status: 0,
  answerValue: "",
  input: "",
  isClick_start: false,
  isClick_exit: false,
  isClick_editProfileDialog: false,
  gameOver: false
})

export const mutations = {
  onClick_setUsername(state, payload) {
    state.username = payload
  },
  setAnswerValue(state, payload) {
    state.answerValue = payload
  },
  onClick_newInput(state, payload) {
    state.input = payload
  },
  set_status(state, payload) {
    state.status = payload
  },
  onClick_start(state, payload) {
    state.isClick_start = !state.isClick_start
  },
  onClick_exit(state, payload) {
    state.isClick_exit = !state.isClick_exit
  },
  onClick_editProfileDialog(state) {
    state.isClick_editProfileDialog = !state.isClick_editProfileDialog
  },
  gameOver(state, payload) {
    state.gameOver = !state.gameOver
  }
}

export const actions = {
  onClick_setUsername({
    commit
  }, payload) {
    commit('onClick_setUsername', payload)
  },
  setAnswerValue({
    commit
  }, payload) {
    commit('setAnswerValue', payload)
  },
  onClick_newInput({
    commit
  }, payload) {
    commit('onClick_newInput', payload)
  },
  set_status({
    commit
  }, payload) {
    commit('set_status', payload)
  },
  onClick_start({
    commit
  }, payload) {
    commit('onClick_start', payload)
  },
  onClick_exit({
    commit
  }, payload) {
    commit('onClick_exit', payload)
  },
  onClick_editProfileDialog({
    commit
  }) {
    commit('onClick_editProfileDialog')
  },
  gameOver({
    commit
  }, payload) {
    commit('gameOver')
  }
}

export const getters = {
  isClick_setUsername(state) {
    return state.username
  },
  answerValue(state) {
    return state.answerValue
  },
  isClick_newInput(state) {
    return state.input
  },
  status(state) {
    return state.status
  },
  isClick_start(state) {
    return state.isClick_start
  },
  isClick_exit(state) {
    return state.isClick_exit
  },
  gameOver(state) {
    return state.gameOver
  }
}
