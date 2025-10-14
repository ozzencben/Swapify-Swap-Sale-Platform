import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/api";
import { getUserNotifications } from "../../services/notification";
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

  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // -------------------- SOCKET BAĞLANTI & NOTIFICATIONS --------------------
  useEffect(() => {
    if (!user?.id) return;

    // Socket bağlan
    if (!socket.connected) socket.connect();

    // Kullanıcıyı socket'e register et
    const registerUser = () => {
      socket.emit("register", user.id);
      console.log("✅ Socket registered:", user.id);
    };

    registerUser();

    // Reconnect durumunda tekrar register et
    socket.on("connect", registerUser);

    // Yeni bildirim geldiğinde çalışır
    socket.on("notification", (data) => {
      console.log("📩 New Notification:", data);
      toast.success(data.message);

      // Yeni bildirim geldiğinde sayacı +1 yap
      setNotificationCount((prev) => prev + 1);
    });

    // Temizlik
    return () => {
      socket.off("notification");
      socket.off("connect", registerUser);
    };
  }, [user]);

  // -------------------- NOTIFICATION COUNT FETCH --------------------
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setLoadingNotifications(true);
        const notifications = await getUserNotifications(user.id);
        const unread = notifications.filter((n) => !n.is_read).length;
        setNotificationCount(unread);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // -------------------- LOGIN --------------------
  const login = async (email, password) => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      const res = await api.post("/users/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

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

  // -------------------- REGISTER --------------------
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

  // -------------------- LOGOUT --------------------
  const logout = async () => {
    try {
      setAccessToken(null);
      setUser(null);
      setNotificationCount(0);
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
      value={{
        user,
        setUser,
        accessToken,
        login,
        register,
        logout,
        navigate,
        notificationCount,
        setNotificationCount,
        loadingNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
