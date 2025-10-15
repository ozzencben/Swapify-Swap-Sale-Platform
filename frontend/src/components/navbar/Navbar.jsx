import { useContext, useState } from "react";
import { CiLogout, CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { RiAddFill, RiNotification3Line, RiUser4Line } from "react-icons/ri";
import AuthContext from "../../context/auth/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { logout, navigate, notificationCount } = useContext(AuthContext);

  const [showRightMenu, setShowRightMenu] = useState(false);
  const [openOverlay, setOpenOverlay] = useState(false);

  const toggleShowRightMenu = () => {
    setShowRightMenu((prev) => !prev);
    setOpenOverlay((prev) => !prev);
  };

  const closeAllMenu = (path) => {
    setOpenOverlay(false);
    setShowRightMenu(false);
    if (path) navigate(path);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-logo" onClick={() => closeAllMenu("/")}>
        <h2>SWAPIFY</h2>
      </div>

      {/* -------- Mobil Menü -------- */}
      <label className="hamburger">
        <input
          type="checkbox"
          checked={showRightMenu}
          onChange={toggleShowRightMenu}
        />
        <svg viewBox="0 0 32 32">
          <path
            className="line line-top-bottom"
            d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          ></path>
          <path className="line" d="M7 16 27 16"></path>
        </svg>
      </label>

      <div className={`navbar-right-menu ${showRightMenu ? "open" : ""}`}>
        <ul>
          <li onClick={() => closeAllMenu("/")}>Home</li>
          <li onClick={() => closeAllMenu("/products")}>Products</li>
          <li onClick={() => closeAllMenu("/contact")}>Contact</li>
        </ul>

        <div className="navbar-line"></div>

        <div className="right-menu-buttons">
          <div className="radio-button" onClick={() => navigate("/settings")}>
            <CiSettings className="radio-button-icon" />
          </div>

          <div
            className="radio-button notification-btn"
            onClick={() => navigate("/notification")}
          >
            <IoIosNotificationsOutline className="radio-button-icon" />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>

          <div className="radio-button" onClick={logout}>
            <CiLogout className="radio-button-icon" />
          </div>
        </div>
      </div>

      <div
        onClick={closeAllMenu}
        className={`navbar-overlay ${openOverlay ? "open" : ""}`}
      ></div>

      {/* -------- Masaüstü Menü -------- */}
      <div className="navbar-routes">
        <a href="/">Home</a>
        <a href="#">Product</a>
        <a href="#">Contact</a>
        <a href="#">About</a>
      </div>

      <div className="navbar-buttons-row">
        <button
          className="radio-button"
          onClick={() => navigate("/add-product")}
        >
          <RiAddFill className="radio-button-icon" />
        </button>

        <button
          className="radio-button notification-btn"
          onClick={() => navigate("/notification")}
        >
          <RiNotification3Line className="radio-button-icon" />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>

        <button className="radio-button" onClick={() => navigate("/my-profile")}>
          <RiUser4Line className="radio-button-icon" />
        </button>

        <button className="radio-button" onClick={logout}>
          <CiLogout className="radio-button-icon" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
