import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/api";
import { socket } from "../../socket";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    return storedAccessToken || null;
  });

  // Socket bağlantısı ve notification listener
  useEffect(() => {
    if (user?.id) {
      // Socket bağlantısını aç
      socket.connect();

      // Backend'e kullanıcıyı tanıt
      socket.emit("register", user.id);
      console.log("✅ Socket registered:", user.id);

      // Bildirimleri dinle
      socket.on("notification", (data) => {
        console.log("📩 New Notification:", data);
        toast.success(data.message);
      });

      // Disconnect veya unmount durumunda temizle
      return () => {
        socket.off("notification");
        if (socket.connected) socket.disconnect();
        console.log("❌ Socket disconnected");
      };
    }
  }, [user]);

  const login = async (email, password) => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const res = await api.post("/users/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      // State ve localStorage güncelle
      setUser(user);
      setAccessToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/");
      toast.success("Login successful! Welcome!");
      return res.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
      return null;
    }
  };

  const register = async (formData) => {
    const { email, password, firstname, lastname, username } = formData;
    if (!email || !password || !firstname || !lastname || !username) {
      toast.error("Please enter all required fields");
      return;
    }

    try {
      const res = await api.post("/users/register", formData);
      const { accessToken, refreshToken, user } = res.data;

      setUser(user);
      setAccessToken(accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/login");
      if (res.data.success) toast.success(res.data.message);
      return res.data;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
      return null;
    }
  };

  const logout = async () => {
    try {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      if (socket.connected) socket.disconnect();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, accessToken, login, register, logout, navigate }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
