class StateStack {
  static stateStack = [];

  static add(state) {
    this.stateStack.push(state);
  }

  static remove(state) {
    const stateIndex = this.stateStack.indexOf(state);
    this.stateStack.splice(stateIndex, 1);
  }

  static getState() {
    return this.stateStack;
  }
}

module.exports = StateStack;
