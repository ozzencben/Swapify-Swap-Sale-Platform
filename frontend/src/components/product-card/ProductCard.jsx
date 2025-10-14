import { useContext, useEffect, useState } from "react";
import { CiBookmark } from "react-icons/ci";
import { toast } from "sonner";
import AuthContext from "../../context/auth/AuthContext";
import {
  addToFavorites,
  isProductFavorited,
  removeFromFavorites,
} from "../../services/favorite";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Başlangıçta favori durumunu kontrol et
  useEffect(() => {
    const fetchFavorited = async () => {
      try {
        const isFav = await isProductFavorited(product.id);
        setFavorited(isFav);
      } catch (err) {
        console.error("Error fetching favorite status:", err);
      }
    };
    fetchFavorited();
  }, [product.id]);

  const toggleAddToFavorites = async () => {
    if (loading) return; // Önceki isteğin bitmesini bekle
    setLoading(true);

    try {
      if (user.id === product.user_id) {
        toast.error("You cannot favorite your own product!");
        setLoading(false);
        return;
      }

      if (favorited) {
        await removeFromFavorites(product.id).catch((err) => {
          if (err.response?.status === 404) {
            console.warn("Favorite not found, ignoring 404");
          } else {
            throw err;
          }
        });
        toast.success("Removed from favorites!");
      } else {
        const res = await addToFavorites(product.id);
        toast.success("Added to favorites!");
        // Opsiyonel: bildirim bilgisi varsa konsola logla
        if (res.notification) {
          console.log("Notification sent:", res.notification);
        }
      }

      setFavorited(!favorited);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-container">
      {user.id === product.user_id && (
        <span className="your-product-badge">Your Item</span>
      )}
      <div className="image-wrapper">
        <img
          src={product?.images?.[0] || "/placeholder.jpg"}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-image-overlay">
          <a href={`/product-detail/${product.id}`} className="overlay-text">
            View Details
          </a>
        </div>
      </div>

      <div className="product-card-title">{product.title}</div>

      <div className="product-card-price">
        <span className="price-span">{product.price}</span>

        {/* Tradeable tooltip */}
        <div className="tradeable-container">
          <span className="tradeable-span">
            {product.is_tradeable ? "Tradeable" : "Not Tradeable"}
          </span>
          <div className="tradeable-tipbox">
            {product.is_tradeable ? (
              <span>You can trade this product or make a cash offer</span>
            ) : (
              <span>
                This product cannot be traded with your items, but you can make
                a cash offer
              </span>
            )}
          </div>
        </div>

        {/* Favorite button */}
        <div
          className={`favorite-button ${loading ? "loading" : ""}`}
          onClick={toggleAddToFavorites}
        >
          <input
            id={`bookmark-${product.id}`}
            type="checkbox"
            checked={favorited}
            readOnly
          />
          <label className="bookmark" htmlFor={`bookmark-${product.id}`}>
            <CiBookmark className="icon" />
            <div className="shimmer"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
