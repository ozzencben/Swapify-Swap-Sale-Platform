import { toast } from "sonner";
import api from "../api/api";

export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    for (let key in productData) {
      if (key === "images") {
        productData.images.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, productData[key]);
      }
    }
    const res = await api.post("/products/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      toast.success(res.data.message);
    }
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();
    for (let key in productData) {
      if (key === "images") {
        productData.images.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, productData[key]);
      }
    }
    const res = await api.put(`/products/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      toast.success(res.data.message);
    }
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
