import { useContext, useEffect, useState } from "react";
import { CiUser } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import AuthContext from "../../context/auth/AuthContext";
import { getUserById } from "../../services/auth";
import { getProductById } from "../../services/product";
import { createTrade, getExistingTrade } from "../../services/trades";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { user, navigate } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [productOwner, setProductOwner] = useState(null);

  const [mainImage, setMainImage] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        const owner = await getUserById(res.product.user_id);
        setProductOwner(owner);
        setProduct(res.product);
        if (res.product.images && res.product.images.length > 0) {
          setMainImage(res.product.images[0]);
        }
      } catch (error) {
        console.error("Error fetching product by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  const handleCreateTrade = async () => {
    try {
      // Önce var olan trade var mı kontrol et
      const existingTrade = await getExistingTrade(productOwner.id, product.id);

      let trade;
      if (existingTrade) {
        trade = existingTrade;
        console.log("trade", trade);
      } else {
        // Yeni trade oluştururken productId de gönder
        trade = await createTrade(productOwner.id, product.id);
        console.log("trade", trade);
      }

      navigate(`/make-an-offer/${trade.id}?productId=${product.id}`);
    } catch (error) {
      console.error("Error creating trade:", error);
    }
  };

  if (loading || !product) return <Loader />;

  return (
    <div className="product-detail-container">
      {user.id === product.user_id && (
        <div className="edit-container">
          <button
            className="edit-button"
            onClick={() => navigate(`/edit-product/${product.id}`)}
          >
            <MdEdit className="edit-svgIcon" />
          </button>
        </div>
      )}
      <div className="left-gallery">
        <div className="main-image-container">
          {mainImage && (
            <img
              src={mainImage}
              alt={product.title}
              className="main-image"
              onClick={() => setModalImage(mainImage)}
              loading="lazy"
            />
          )}
        </div>

        <div className="thumbnail-container">
          {product.images.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={product.title}
              className={`thumbnail ${imgUrl === mainImage ? "active" : ""}`}
              onClick={() => setMainImage(imgUrl)}
              loading="lazy"
            />
          ))}
        </div>

        {modalImage && (
          <div className="modal" onClick={() => setModalImage(null)}>
            <img src={modalImage} alt="Full size" className="full-image" />
          </div>
        )}
      </div>

      <div className="right-info">
        <h2 className="product-title">{product.title}</h2>
        <p className="product-description">{product.description}</p>
        <div className="owner-container">
          <div
            className="user-profile-image"
            onClick={() => navigate(`/profile/${productOwner.id}`)}
          >
            {productOwner && productOwner.profile_image ? (
              <img
                src={productOwner.profile_image}
                alt={productOwner.username}
                className="profile-image"
                loading="lazy"
              />
            ) : (
              <div className="user-box">
                <CiUser className="user-icon" />
              </div>
            )}
          </div>
          <div className="user-name">
            <div onClick={() => navigate(`/profile/${productOwner.id}`)}>
              <span>{productOwner && productOwner.firstname}</span>
              <span>{productOwner && productOwner.lastname}</span>
            </div>
            <span onClick={() => navigate(`/profile/${productOwner.id}`)}>
              ({productOwner && productOwner.username})
            </span>
          </div>
        </div>
        <p className="product-price">${product.price}</p>
        <div className="detail-tradeable-container">
          <span className="detail-tradeable-span">
            {product.is_tradeable ? "Tradeable" : "Not Tradeable"}

            <div className="detail-tipbox">
              {product.is_tradeable ? (
                <span>You can trade this product or make a cash offer</span>
              ) : (
                <span>
                  This product cannot be traded with your items, but you can
                  make a cash offer
                </span>
              )}
            </div>
          </span>
        </div>

        <div className="detail-buttons">
          <button className="button" onClick={handleCreateTrade}>
            <span className="button_lg">
              <span className="button_sl"></span>
              <span className="button_text">Make an Offer</span>
            </span>
          </button>
          <button className="button">
            <span className="button_lg">
              <span className="button_sl"></span>
              <span className="button_text">Send Message</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
