import { useContext, useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { useLocation, useParams } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import AuthContext from "../../../context/auth/AuthContext";
import { getAllProducts, getProductById } from "../../../services/product";
import { createOffer } from "../../../services/trades";
import "./MakeAnOffer.css";

const MakeAnOffer = () => {
  const { user, navigate } = useContext(AuthContext);
  const { id: tradeId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [products, setProducts] = useState([]);

  const [offerDetails, setOfferDetails] = useState({
    offeredProducts: [],
    offerMoney: 0,
    requestMoney: 0,
    offerMessage: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfferDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckBoxChange = (pId) => {
    setOfferDetails((prev) => {
      const isSelected = prev.offeredProducts.includes(pId);
      return {
        ...prev,
        offeredProducts: isSelected
          ? prev.offeredProducts.filter((id) => id !== pId)
          : [...prev.offeredProducts, pId],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await createOffer(
        tradeId,
        productDetail.product.user_id,
        offerDetails,
        productId
      );
      console.log("Offer created:", res);
      navigate(`/product-detail/${productId}`);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // fetch all products
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

  // fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const res = await getProductById(productId);
        setProductDetail(res);
      } catch (error) {
        console.error("Error fetching product by ID:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  if (loading) return <Loader />;

  return (
    <div className="make-offer-container">
      <div
        className="requested-product-container"
        onClick={() => navigate(`/product-detail/${productId}`)}
      >
        <img
          src={productDetail?.product.images[0]}
          alt="product"
          className="requested-product-image"
        />
        <p className="requested-product-title">
          {productDetail?.product.title}
        </p>
        <span className="requested-product-price">
          {productDetail?.product.price}
        </span>
        <div className="request-product-info">
          <span>{productDetail?.product.condition}</span>
          <span>
            {productDetail?.product.is_tradeable
              ? "Tradeable"
              : "Not Tradeable"}
          </span>
        </div>
      </div>

      <div className="offer-form">
        {/* OFFER MONEY */}
        <div className="offer-form-item">
          <div className="offer-tips">
            <CiCircleInfo />
            <p>Enter the amount you’d like to offer for this product.</p>
          </div>
          <input
            type="number"
            placeholder="Enter amount"
            className="offer-form-input"
            value={offerDetails.offerMoney}
            name="offerMoney"
            onChange={handleChange}
          />
        </div>

        {productDetail.is_tradeable ? (
          <>
            {/* REQUEST MONEY */}
            <div className="offer-form-item">
              <div className="offer-tips">
                <CiCircleInfo />
                <p>
                  Enter the amount of money you’d like to request for this
                  trade.
                </p>
              </div>
              <input
                type="number"
                placeholder="Enter amount"
                className="offer-form-input"
                value={offerDetails.requestMoney}
                name="requestMoney"
                onChange={handleChange}
              />
            </div>

            {/* OFFERED PRODUCTS */}
            <div className="offer-form-item">
              <div className="offer-tips">
                <CiCircleInfo />
                <p>
                  Select a product(s) you’d like to include in your trade offer.
                </p>
              </div>
              <div className="my-product-list">
                {products
                  ?.filter((product) => product.user_id === user.id)
                  .map((product) => (
                    <div className="my-product-item" key={product.id}>
                      <div
                        className="name-image"
                        onClick={() =>
                          navigate(`/product-detail/${product.id}`)
                        }
                      >
                        <img
                          src={product.images[0]}
                          alt="product"
                          className="my-product-image"
                        />
                        <p className="my-product-title">{product.title}</p>
                      </div>
                      <div className="content">
                        <label className="checkBox">
                          <input
                            type="checkbox"
                            onChange={() => handleCheckBoxChange(product.id)}
                            checked={offerDetails.offeredProducts.includes(
                              product.id
                            )}
                          />
                          <div className="transition"></div>
                        </label>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : null}

        {/* MESSAGE */}
        <div className="offer-form-item">
          <div className="offer-tips">
            <CiCircleInfo />
            <p>Add a message to explain your offer (optional).</p>
          </div>
          <textarea
            rows={5}
            placeholder="Enter message"
            className="offer-form-input"
            value={offerDetails.offerMessage}
            name="offerMessage"
            onChange={handleChange}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="offer-form-item">
          <button onClick={handleSubmit} className="offer-form-button">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeAnOffer;
