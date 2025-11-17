import ls from "localstorage-slim";

const { REACT_APP_TOKEN, REACT_APP_CREDENTIALS } = process.env;

const save = (name, value) => ls.set(name, value, { ttl: 3600 });

const remove = (name) => ls.remove(name);

const get = (name) => ls.get(name, { ttl: 3600 });

const clearSession = () => {
  remove(REACT_APP_TOKEN);
  remove(REACT_APP_CREDENTIALS);
  window.location.reload();
};

export {
  save as saveSession,
  remove as removeSession,
  get as getSession,
  clearSession,
};
