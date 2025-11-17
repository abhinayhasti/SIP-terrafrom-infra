import axios from "axios";

import { getSession, removeSession } from "../../utils/clientSession";

const { REACT_APP_SERVER_URL, REACT_APP_TOKEN } = process.env;

const axiosInstance = axios.create({
  baseURL: REACT_APP_SERVER_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(getSession(REACT_APP_TOKEN) || {})?.access_token;

    if (!!token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => {
    return Promise.resolve(res);
  },
  async (error) => {
    const errConfig = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 || error.response.status === 403) {
      //removeSession(REACT_APP_TOKEN);

      //window.location.href = "/";

      return Promise.reject(error.response);
    }

    return Promise.reject(error.response);
  }
);

export default axiosInstance;
