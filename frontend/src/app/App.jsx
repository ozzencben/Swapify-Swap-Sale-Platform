import { Toaster } from "sonner";
import AuthProvider from "../context/auth/AuthProvider";
import AppRoute from "../routes/AppRoute";
import { useSocketNotifications } from "../context/socket/SocketNotification";

function App() {
  useSocketNotifications();

  return (
    <AuthProvider>
      <AppRoute />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f1f1f",
            color: "#fff",
            fontFamily: "Montserrat, sans-serif",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#fff",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
