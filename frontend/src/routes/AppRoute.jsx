import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";

import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

import AddProduct from "../pages/add-product/AddProduct";
import Home from "../pages/home/Home";

const AppRoute = () => {
  const location = useLocation();
  const hidingRoutes = ["/login", "/register"];

  const hideNavbar = hidingRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-product" element={<AddProduct />} />
      </Routes>
    </>
  );
};

export default AppRoute;
