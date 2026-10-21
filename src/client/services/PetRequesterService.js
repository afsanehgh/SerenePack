const api = require('./api');

exports.register = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

exports.login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

exports.setAccessToken = (token) => {
  api.setAccessToken(token);
};

exports.createPet = async (petData) => {
  return api.post('/pet', petData);
};

exports.getAllPets = async () => {
  const response = await api.get('/pet');
  return response.data;
};

exports.deletePet = (id) => api.delete(`/pet/${id}`);

exports.updatePet = (id, petData) => api.put(`/pet/${id}`, petData);
