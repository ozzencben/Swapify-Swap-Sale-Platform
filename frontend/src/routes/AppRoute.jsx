import { Route, Routes } from "react-router-dom";

import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

const AppRoute = () => {
  // const hidingRoutes = ["/login", "/register"];

  // if (hidingRoutes.includes(window.location.pathname)) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoute;
