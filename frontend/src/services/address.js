import api from "../api/api";

// Tüm adresleri çek
export const getUserAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data.addresses;
};

// Tek bir adresi çek
export const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data.address;
};

// Yeni adres oluştur
export const createAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data.address;
};

// Adres güncelle
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data.address;
};

// Adres sil
export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data.message;
};
