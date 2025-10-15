import { useContext, useEffect, useRef, useState } from "react";
import { CiUser } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import Loader from "../../../components/loader/Loader";
import AuthContext from "../../../context/auth/AuthContext";
import {
  getAllFavoriteProductIds,
  getUserFavorites,
} from "../../../services/favorite";
import { getAllProducts } from "../../../services/product";
import "./MyProfile.css";

const MyProfile = () => {
  const { user, navigate } = useContext(AuthContext);

  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const navRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    "My Products",
    "Messages",
    "Trades",
    "Favorites",
    "Settings",
  ];

  // ürünleri çek
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

  // favori ürün idlerini çek
  useEffect(() => {
    const fetchFavoriteProductIds = async () => {
      try {
        const favoriteProductIds = await getAllFavoriteProductIds();
        setFavoriteProductIds(favoriteProductIds);
      } catch (error) {
        console.error("Favorite product IDs fetch error:", error);
      }
    };

    fetchFavoriteProductIds();
  }, []);

  // favori ürünleri çek
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getUserFavorites();
        console.log("favorites", res);

        const favorites = Array.isArray(res) ? res : res.favorites || [];
        setFavorites(favorites);
      } catch (error) {
        console.error("Favorite product ids fetch error:", error);
      }
    };

    fetchFavorites();
  }, [products]);

  // underline pozisyonunu ayarla
  useEffect(() => {
    const navLinks = navRef.current.querySelectorAll("a");
    const activeLink = navLinks[activeIndex];
    if (activeLink) {
      setUnderlineStyle({
        left: activeLink.offsetLeft + "px",
        width: activeLink.offsetWidth + "px",
      });
    }
  }, [activeIndex]);

  if (loading) return <Loader />;

  return (
    <div className="myProfile-container">
      <div className="edit-container">
        <button
          className="edit-button"
          onClick={() => navigate("/edit-profile")}
        >
          <MdEdit className="edit-svgIcon" />
        </button>
      </div>

      <div className="myProfile-infoSection">
        <div className="myProfile-userInfoBox">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt="Profile"
              className="myProfile-avatar"
            />
          ) : (
            <div className="myProfile-iconWrapper">
              <CiUser className="myProfile-icon" />
            </div>
          )}

          <div className="myProfile-textInfo">
            <h2 className="myProfile-name">
              {user?.firstname} {user?.lastname}
            </h2>
            <p className="myProfile-email">{user?.email}</p>
            <p className="myProfile-username">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Navigasyon menüsü */}
      <div className="myProfile-navWrapper">
        <nav className="myProfile-nav" ref={navRef}>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={
                    index === activeIndex
                      ? "myProfile-link active"
                      : "myProfile-link"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveIndex(index);
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <span className="myProfile-underline" style={underlineStyle}></span>
        </nav>
      </div>

      {/* navigation sections */}
      <div className="navigation-section-container">
        {/* My Products */}
        {activeIndex === 0 && (
          <div className="my-products-container show">
            <div className="product-list">
              {products
                .filter((product) => product.user_id === user.id)
                .map((product) => (
                  <div
                    className="product-item"
                    key={product.id}
                    onClick={() => navigate(`/product-detail/${product.id}`)}
                  >
                    <div className="block"></div>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="product-info">
                      <p className="product-item-title">{product.title}</p>
                      <div className="tips-box">
                        <div className="tip tip1">
                          {
                            favoriteProductIds.filter(
                              (favId) => favId === product.id
                            ).length
                          }{" "}
                          Favorites
                        </div>
                        <div className="tip tip1">0 Trade Request</div>
                      </div>
                    </div>
                    <div className="chevron-box">
                      <div className="chevron">››</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {activeIndex === 1 && (
          <div className="my-messages-container show">
            <p>No messages yet.</p>
          </div>
        )}

        {/* Trades */}
        {activeIndex === 2 && (
          <div className="my-messages-container show">
            <p>No trades yet.</p>
          </div>
        )}

        {/* Favorites */}
        {activeIndex === 3 && (
          <div className="my-favorites-container show">
            <div className="product-list">
              {favorites.map((product) => (
                <>
                  <div
                    key={product.id}
                    className="product-item"
                    id={product.id}
                    onClick={() =>
                      navigate(`/product-detail/${product.product_id}`)
                    }
                  >
                    <div className="block"></div>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="product-info">
                      <p className="product-item-title">{product.title}</p>
                      <div className="tips-box">
                        <div className="tip">
                          <p>{product.status}</p>
                        </div>
                        <div className="tip">
                          <p>
                            {product.is_tradeable
                              ? "Tradeable"
                              : "Not Tradeable"}
                          </p>
                        </div>
                        <div className="chevron-box">
                          <div className="chevron">››</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeIndex === 4 && (
          <div className="my-settings-container show">
            <p>Settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
