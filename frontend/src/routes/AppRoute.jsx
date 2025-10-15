import { Route, Routes, useLocation } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";

import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

import AddProduct from "../pages/add-product/AddProduct";
import EditProduct from "../pages/edit-product/EditProduct";
import Home from "../pages/home/Home";
import Notification from "../pages/notification/Notification";
import ProductDetail from "../pages/product-detail/ProductDetail";
import MyProfile from "../pages/profile/myProfile/MyProfile";
import EditProfile from "../pages/profile/edit-profile/EditProfile";
import OtherUserProfile from "../pages/profile/OtherUserProfile/OtherUserProfile";

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
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/profile/:id" element={<OtherUserProfile />} />
      </Routes>
    </>
  );
};

export default AppRoute;
