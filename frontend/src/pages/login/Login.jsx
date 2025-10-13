import { useContext, useState } from "react";
import { RxEyeClosed } from "react-icons/rx";
import { TfiEye } from "react-icons/tfi";
import { toast } from "sonner";
import AuthContext from "../../context/auth/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  const isDaisable = !email || !password;

  return (
    <div className="login-container">
      <div className="auth-form-heading">
        <h1>Welcome Back</h1>
        <p>Please login to continue</p>
      </div>
      <div className="auth-form">
        <div className="auth-item">
          <input
            type="text"
            placeholder="Email"
            name="email"
            className="auth-input"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="auth-item">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            className="auth-input"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <TfiEye onClick={togglePassword} className="eye-icon" />
          ) : (
            <RxEyeClosed onClick={togglePassword} className="eye-icon" />
          )}
        </div>
        <button
          disabled={isDaisable}
          onClick={handleLogin}
          className="auth-btn"
        >
          Login
        </button>
        <p className="auth-prompt">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
