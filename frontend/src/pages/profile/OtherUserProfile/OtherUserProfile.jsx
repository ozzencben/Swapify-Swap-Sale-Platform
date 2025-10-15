import { useContext, useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { useParams } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import AuthContext from "../../../context/auth/AuthContext";
import { getUserById } from "../../../services/auth";
import { getAllProducts } from "../../../services/product";
import "./OtherUserProfile.css";

const OtherUserProfile = () => {
  const { id } = useParams();
  const { user, navigate } = useContext(AuthContext);

  const [otherUser, setOtherUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(id);
        console.log("user", res);
        setOtherUser(res);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await getAllProducts();
        const productList = Array.isArray(res) ? res : res.products || [];
        setProducts(productList);
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);
  console.log("products", products);

  if (loading) return <Loader />;

  return (
    <div className="other-user-profile">
      <div className="other-user-infoSection">
        <div className="other-user-userInfoBox">
          {otherUser?.profile_image ? (
            <img
              src={otherUser.profile_image}
              alt="Profile"
              className="other-user-avatar"
            />
          ) : (
            <div className="other-user-iconWrapper">
              <CiUser className="other-user-icon" />
            </div>
          )}

          <div className="other-user-textInfo">
            <h2 className="other-user-name">
              {otherUser?.firstname} {otherUser?.lastname}
            </h2>
            <p className="other-user-email">{otherUser?.email}</p>
            <p className="other-user-username">@{otherUser?.username}</p>
          </div>
        </div>
      </div>

      {/* My Products */}
      <div className="my-products-container show">
        <div className="other-user-profile-line"></div>
        <div className="other-user-product-list">
          {products
            .filter((product) => product.user_id === user.id)
            .map((product) => (
              <div
                className="other-user-product-item"
                key={product.id}
                onClick={() => navigate(`/product-detail/${product.id}`)}
              >
                <div className="block"></div>
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="other-user-product-image"
                  loading="lazy"
                />
                <div className="other-user-product-info">
                  <p className="other-user-product-item-title">
                    {product.title}
                  </p>
                  <p>${product.price}</p>
                  <p>{product.is_tradeable ? "Tradeable" : "Not Tradeable"}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfile;
