const axios = require('axios');

const BASE_URL = `${process.env.BACKEND_URL || 'http://localhost:8000'}`;
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.setAccessToken = (token) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

if (process.env.API_TOKEN) {
  api.setAccessToken(process.env.API_TOKEN);
}

module.exports = api;
