import api from '../api/api'; // axios instance

// ------------------- ADD TO FAVORITES -------------------
export const addToFavorites = async (productId) => {
  try {
    const res = await api.post('/favorites', { product_id: productId });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ------------------- REMOVE FROM FAVORITES -------------------
export const removeFromFavorites = async (productId) => {
  try {
    const res = await api.delete(`/favorites/${productId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ------------------- GET USER FAVORITES -------------------
export const getUserFavorites = async () => {
  try {
    const res = await api.get('/favorites');
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// ------------------- CHECK IF FAVORITED -------------------
export const isProductFavorited = async (productId) => {
  try {
    const res = await api.get(`/favorites/check/${productId}`);
    return res.data.isFavorited;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
