import { useContext, useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../../components/loader/Loader";
import AuthContext from "../../context/auth/AuthContext";
import { getUserById } from "../../services/auth";
import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../../services/notification";
import { getExistingTrade } from "../../services/trades";
import { socket } from "../../socket";
import "./Notification.css";

const Notification = () => {
  const { user, navigate } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bildirimleri fetch et ve sender bilgilerini ekle
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const rawNotifications = await getUserNotifications(user.id);

      const uniqueSenderIds = [
        ...new Set(rawNotifications.map((n) => n.sender_id)),
      ];
      const senderUsers = await Promise.all(
        uniqueSenderIds.map((id) => getUserById(id))
      );

      const senderMap = Object.fromEntries(senderUsers.map((u) => [u.id, u]));

      const notificationsWithSender = rawNotifications.map((n) => ({
        ...n,
        sender: senderMap[n.sender_id] || null,
      }));

      setNotifications(notificationsWithSender);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket ile real-time notification
    socket.on("notification", (data) => {
      if (data.receiver_id === user.id) {
        toast.success(data.message);
        setNotifications((prev) => [{ ...data, sender: data.sender }, ...prev]);
      }
    });

    return () => {
      socket.off("notification");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleItemClick = async (
    productId,
    offerOwnerId,
    type,
    notificationId
  ) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    if (type === "offer") {
      try {
        const result = await getExistingTrade(offerOwnerId, productId);
        navigate(`/trade-chain/${result.id}?productId=${productId}`);
      } catch (err) {
        console.error(err);
      }
    }

    if (type === "favorite") {
      navigate(`/product-detail/${productId}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formattedTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = (now - past) / 1000; // saniye cinsinden

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const day = String(past.getDate()).padStart(2, "0");
    const month = String(past.getMonth() + 1).padStart(2, "0");
    const year = past.getFullYear();
    const hours = String(past.getHours()).padStart(2, "0");
    const minutes = String(past.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="notification-container">
      {notifications.length === 0 && <p>No notifications</p>}
      <div className="notification-items">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-item ${n.is_read ? "read" : "unread"}`}
            onClick={() =>
              handleItemClick(n.product_id, n.sender_id, n.type, n.id)
            }
            onContextMenu={(e) => {
              e.preventDefault();
              handleDelete(n.id);
            }}
          >
            <div className="sender-box">
              {n.sender.profile_image ? (
                <img
                  src={n.sender.profile_image}
                  alt={n.sender.name}
                  className="sender-image"
                />
              ) : (
                <div className="user-box notification-box">
                  <CiUser className="user-icon" />
                </div>
              )}
            </div>
            <div className="notification-message-box">
              <div className="notification-message">
                <Link
                  to={`/product-detail/${n.product_id}`}
                  className="not-content"
                >
                  {n.content}
                </Link>{" "}
                <a href="#" className="not-sender-name">
                  {n.sender.firstname} {n.sender.lastname}
                </a>
              </div>
            </div>
            <div className="notification-time">
              {formattedTime(n.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
