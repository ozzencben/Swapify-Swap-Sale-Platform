import api from "../api/api";

export const getAllCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getCategoryById = async (id) => {
  try {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
