export const users = [];
export const posts = [];
let currentSession = null;

export const session = {
  get() {
    return currentSession;
  },
  set(user) {
    currentSession = user;
  },
  clear() {
    currentSession = null;
  },
};
