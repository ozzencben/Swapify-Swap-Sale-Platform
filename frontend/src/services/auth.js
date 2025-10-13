import { toast } from "sonner";
import api from "../api/api";

export const getUserById = async (id) => {
  try {
    const res = await api.get(`/users/profile/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error(error.response.data.message || "Failed to fetch user profile");
  }
};

export const updateUser = async (formData) => {
  try {
    const res = await api.put("/users/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to update profile");
  }
};

export const checkEmail = async (email) => {
  if (!email?.trim()) return null;
  try {
    const res = await api.post("/users/check-email", { email });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const checkUsername = async (username) => {
  if (!username?.trim()) return null;
  try {
    const res = await api.post("/users/check-username", { username });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
