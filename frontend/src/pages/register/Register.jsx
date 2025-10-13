import debounce from "lodash.debounce";
import { useCallback, useContext, useState } from "react";
import { RxEyeClosed } from "react-icons/rx";
import { TfiEye } from "react-icons/tfi";
import { toast } from "sonner";
import AuthContext from "../../context/auth/AuthContext";
import { checkEmail, checkUsername } from "../../services/auth";
import "./Register.css";

const Register = () => {
  const { register, navigate } = useContext(AuthContext);

  const [emailAvailable, setEmailAvailable] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  });
  const [passwordAgain, setPasswordAgain] = useState("");
  const [isMatchPassword, setIsMatchPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const checkPasswordMatch = () => {
    if (formData.password !== "" && passwordAgain !== "")
      setIsMatchPassword(formData.password === passwordAgain);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") debouncedCheckEmail(value);
    if (name === "username") debouncedCheckUsername(value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckEmail = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return;
      try {
        const res = await checkEmail(value);
        if (res?.available === false) {
          toast.error(res.message);
          setEmailAvailable(false);
        } else {
          toast.success(res.message);
          setEmailAvailable(true);
        }
      } catch {
        toast.error("Error checking email availability");
      }
    }, 600),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckUsername = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return;
      try {
        const res = await checkUsername(value);
        if (res?.available === false) {
          toast.error(res.message);
          setUsernameAvailable(false);
        } else {
          toast.success(res.message);
          setUsernameAvailable(true);
        }
      } catch {
        toast.error("Error checking username availability");
      }
    }, 600),
    []
  );

  const isFormValid = () => {
    return (
      formData.firstname &&
      formData.lastname &&
      formData.username &&
      formData.email &&
      formData.password &&
      emailAvailable &&
      usernameAvailable &&
      isMatchPassword
    );
  };

  const handleRegister = async () => {
    try {
      const res = await register(formData);
      console.log("register result", res);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <div className="auth-form-heading">
        <h1>Let's Get Started</h1>
        <p>Create an account to continue</p>
      </div>
      <div className="auth-form">
        <div
          className={`auth-item ${
            formData.username !== ""
              ? usernameAvailable
                ? "valid"
                : "invalid"
              : ""
          }`}
        >
          <input
            type="text"
            placeholder="Username"
            onChange={handleChange}
            name="username"
            value={formData.username}
            className="auth-input"
          />
        </div>
        <div className="auth-item">
          <input
            type="text"
            placeholder="First Name"
            onChange={handleChange}
            name="firstname"
            value={formData.firstname}
            className="auth-input"
          />
        </div>
        <div className="auth-item">
          <input
            type="text"
            placeholder="Last Name"
            onChange={handleChange}
            name="lastname"
            value={formData.lastname}
            className="auth-input"
          />
        </div>
        <div
          className={`auth-item ${
            formData.email !== "" ? (emailAvailable ? "valid" : "invalid") : ""
          }`}
        >
          <input
            type="email"
            placeholder="Email"
            onChange={handleChange}
            name="email"
            value={formData.email}
            className="auth-input"
          />
        </div>
        <div
          className={`auth-item ${
            formData.password !== "" ? (isMatchPassword ? "" : "invalid") : ""
          }`}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            name="password"
            value={formData.password}
            className="auth-input"
          />
          {showPassword ? (
            <RxEyeClosed onClick={togglePassword} className="eye-icon" />
          ) : (
            <TfiEye onClick={togglePassword} className="eye-icon" />
          )}
        </div>
        <div
          className={`auth-item ${
            passwordAgain !== "" ? (isMatchPassword ? "" : "invalid") : ""
          }`}
        >
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setPasswordAgain(e.target.value)}
            value={passwordAgain}
            onBlur={checkPasswordMatch}
            className="auth-input"
          />
          {showConfirmPassword ? (
            <RxEyeClosed onClick={toggleConfirmPassword} className="eye-icon" />
          ) : (
            <TfiEye onClick={toggleConfirmPassword} className="eye-icon" />
          )}
        </div>
        <button
          className="auth-btn"
          disabled={!isFormValid()}
          onClick={handleRegister}
        >
          <span className="spn2" >Sign Up</span>
        </button>
      </div>
      <div className="auth-prompt" >
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
