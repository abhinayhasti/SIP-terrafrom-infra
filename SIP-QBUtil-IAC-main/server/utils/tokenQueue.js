class TokenQueue {
  static tokens = {};

  static enqueueToken(state, token) {
    this.tokens[state] = token;
  }

  static dequeueToken(state) {
    delete this.tokens[state];
  }

  static getToken(state) {
    return this.tokens[state];
  }
}

module.exports = TokenQueue;
