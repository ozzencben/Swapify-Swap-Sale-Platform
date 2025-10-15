import { toast } from "sonner";
import api from "../api/api";

// --------------------------- GET ALL PRODUCTS ---------------------------
export const getAllProducts = async (filters = {}) => {
  try {
    const params = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.tradeable !== undefined) params.tradeable = filters.tradeable;
    if (filters.status) params.status = filters.status;
    if (filters.condition) params.condition = filters.condition;

    const response = await api.get("/products", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// --------------------------- CREATE PRODUCT ---------------------------
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => {
          // file objesi File tipindeyse direkt ekle
          // { file, url } şeklindeyse içinden file'ı al
          const actualFile = file instanceof File ? file : file.file;
          if (actualFile) {
            formData.append("images", actualFile);
          }
        });
      } else {
        formData.append(key, value);
      }
    });

    // ⚠️ Content-Type'i el ile verme!
    const res = await api.post("/products/create", formData);

    if (res.data.success) {
      toast.success(res.data.message);
    }

    return res.data;
  } catch (error) {
    console.error("❌ Error creating product:", error);
    toast.error("Product creation failed!");
    throw error;
  }
};

// --------------------------- GET PRODUCT BY ID ---------------------------
export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

// --------------------------- UPDATE PRODUCT ---------------------------
export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value);
      }
    });

    const res = await api.put(`/products/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.success) toast.success(res.data.message);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// --------------------------- REMOVE IMAGE ---------------------------
export const removeProductImage = async (id, imageUrl) => {
  try {
    const res = await api.post(`/products/remove-image/${id}`, { imageUrl });
    return res.data;
  } catch (error) {
    console.error("Error removing image:", error);
    throw error;
  }
};


// --------------------------- DELETE PRODUCT ---------------------------
export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
