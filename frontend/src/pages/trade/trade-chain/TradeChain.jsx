import { useContext, useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { IoIosAdd, IoIosClose } from "react-icons/io";
import { useLocation, useParams } from "react-router-dom";
import Loader from "../../../components/loader/Loader";
import AuthContext from "../../../context/auth/AuthContext";
import { getUserById } from "../../../services/auth";
import { getAllProducts, getProductById } from "../../../services/product";
import {
  createCounterOffer,
  getOffers,
  updateOfferStatus,
} from "../../../services/trades";
import "./TradeChain.css";

const TradeChain = () => {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const productId = params.get("productId");
  const { navigate } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [requestedProduct, setRequestedProduct] = useState(null);
  const [bidderProducts, setBidderProducts] = useState([]);
  const [senderUser, setSenderUser] = useState(null);
  const [dynamicOffers, setDynamicOffers] = useState({});
  const [offeredMoney, setOfferedMoney] = useState("");
  const [requestedMoney, setRequestedMoney] = useState("");
  const [offerUpdateMessage, setOfferUpdateMessage] = useState("");
  const [isTradeable, setIsTradeable] = useState(false);
  const [tradeId, setTradeId] = useState("");
  const [offerId, setOfferId] = useState("");

  // Fetch requested product
  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const res = await getProductById(productId);
        setRequestedProduct(res.product);
        setIsTradeable(res.product.is_tradeable);
      } catch (error) {
        console.error("Error fetching requested product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductById();
  }, [productId]);

  // Fetch all offers and their products
  useEffect(() => {
    const fetchAllOffers = async () => {
      try {
        setLoading(true);
        const offersRes = await getOffers(id);
        console.log("offerres", offersRes);

        const offersWithProducts = await Promise.all(
          offersRes.map(async (offer) => {
            const offeredProducts = await Promise.all(
              (offer.offer_details.offeredProducts || []).map(async (pid) => {
                const prodRes = await getProductById(pid);
                return prodRes.product;
              })
            );

            setOfferId(offer.id);
            setTradeId(offer.trade_id);

            const offeredMoneyValue = offer.offer_details.offerMoney;
            setOfferedMoney(offeredMoneyValue);

            const requestedMoneyValue = offer.offer_details.requestMoney;
            setRequestedMoney(requestedMoneyValue);

            const sender = await getUserById(offer.sender_id);
            return { ...offer, offeredProducts, sender };
          })
        );

        setOffers(offersWithProducts);

        // 💡 Her offer için başlangıç state'ini oluştur
        const stateMap = {};
        offersWithProducts.forEach((offer) => {
          stateMap[offer.id] = offer.offeredProducts.map((p) => p.id);
        });
        setDynamicOffers(stateMap);

        if (offersWithProducts.length > 0) {
          setSenderUser(offersWithProducts[0].sender);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAllOffers();
  }, [id]);

  // Fetch bidder's all products
  useEffect(() => {
    const fetchBidderProducts = async () => {
      try {
        if (!senderUser?.id) return;
        setLoading(true);
        const res = await getAllProducts();
        const productList = Array.isArray(res) ? res : res.products || [];
        const bidderProductList = productList.filter(
          (p) => p.user_id === senderUser.id
        );
        setBidderProducts(bidderProductList);
      } catch (error) {
        console.error("Error fetching bidder products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBidderProducts();
  }, [senderUser]);

  const handleCreateCounterOffer = async () => {
    try {
      const offer_details = {
        offerMoney: offeredMoney,
        requestMoney: requestedMoney,
        offeredProducts: dynamicOffers[id],
        offerMessage: offerUpdateMessage,
      };
      const product_id = productId;
      const trade_id = tradeId;
      const offer_id = offerId;
      await updateOfferStatus(offer_id, "offer_updated");
      await createCounterOffer(trade_id, offer_id, offer_details, product_id);
      navigate(`/trade/${id}?productId=${productId}`);
    } catch (error) {
      console.error("Error creating counter offer:", error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      }
    }
  };

  const handleCancelOffer = async () => {
    try {
      await updateOfferStatus(offerId, "declined");
      navigate(`/trade/${id}?productId=${productId}`);
    } catch (error) {
      console.error("Error cancelling offer:", error);
    }
  };

  const handleAcceptOffer = async () => {
    try {
      await updateOfferStatus(offerId, "accepted");
      navigate(`/trade/${id}?productId=${productId}`);
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  // 💡 Ürün ekleme/çıkarma fonksiyonları
  const handleAddProduct = (offerId, productId) => {
    setDynamicOffers((prev) => ({
      ...prev,
      [offerId]: [...(prev[offerId] || []), productId],
    }));
  };

  const handleRemoveProduct = (offerId, productId) => {
    setDynamicOffers((prev) => ({
      ...prev,
      [offerId]: prev[offerId].filter((id) => id !== productId),
    }));
  };

  // 💡 Sağda gösterilmesi gereken ürünleri hesapla
  const getAvailableBidderProducts = (offerId) => {
    const selectedIds = dynamicOffers[offerId] || [];
    return bidderProducts.filter((p) => !selectedIds.includes(p.id));
  };

  if (loading) return <Loader />;

  return (
    <div className="chain-container">
      {/* Requested Product */}
      {requestedProduct && (
        <div
          className="requested-product-container"
          onClick={() => navigate(`/product-detail/${requestedProduct.id}`)}
        >
          <p className="requested-product-label">Requested Product</p>
          <img
            src={requestedProduct.images[0]}
            alt="product"
            className="requested-product-image"
          />
          <p className="requested-product-title">{requestedProduct.title}</p>
        </div>
      )}

      {/* Offers */}
      <div className="offer-container">
        {offers.map((offer) => {
          const currentOfferedIds = dynamicOffers[offer.id] || [];
          const currentOfferedProducts = bidderProducts.filter((p) =>
            currentOfferedIds.includes(p.id)
          );
          const availableProducts = getAvailableBidderProducts(offer.id);

          return (
            <div className="offer-item" key={offer.id}>
              {/* Sender info */}
              <div className="sender-user-card">
                <img
                  src={offer.sender?.profile_image}
                  alt="user"
                  className="sender-user-image"
                />
                <p className="sender-user-name">
                  {offer.sender?.firstname} {offer.sender?.lastname}
                </p>
              </div>

              {/* Offered Products */}
              <div className="offer-update-form">
                {isTradeable ? (
                  <>
                    <div className="offer-update-form-item">
                      <div className="update-form-tips">
                        <span>
                          <CiCircleInfo />
                        </span>
                        <p>
                          You can update your offer by adding or removing
                          products.
                        </p>
                      </div>
                      <div className="product-preview-container">
                        <div className="products-box">
                          {/* Mevcut teklif edilen ürünler */}
                          <p className="offered-product-preview-label">
                            Offered Products
                          </p>
                          <div className="preview-row">
                            {currentOfferedProducts.map((prod) => (
                              <div key={prod.id} className="preview">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="offered-product-preview-image"
                                  onClick={() =>
                                    navigate(`/product-detail/${prod.id}`)
                                  }
                                />
                                <div
                                  className="remove-button-box"
                                  onClick={() =>
                                    handleRemoveProduct(offer.id, prod.id)
                                  }
                                >
                                  <IoIosClose className="remove-button" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="products-box">
                          {/* Sağ tarafta gösterilen ürünler */}
                          <p className="offered-product-preview-label">
                            Bidder’s Other Products
                          </p>
                          <div className="preview-row">
                            {availableProducts.map((prod) => (
                              <div key={prod.id} className="preview">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="offered-product-preview-image"
                                  onClick={() =>
                                    navigate(`/product-detail/${prod.id}`)
                                  }
                                />
                                <div
                                  className="remove-button-box"
                                  onClick={() =>
                                    handleAddProduct(offer.id, prod.id)
                                  }
                                >
                                  <IoIosAdd className="remove-button" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="offer-update-form-item">
                  <div className="update-form-tips">
                    <span>
                      <CiCircleInfo />
                    </span>
                    <p>
                      You can change the amount that has been offered to you if
                      you wish.
                    </p>
                  </div>
                  <input
                    type="number"
                    value={offeredMoney}
                    onChange={(e) => setOfferedMoney(e.target.value)}
                  />
                </div>

                {isTradeable ? (
                  <>
                    <div className="offer-update-form-item">
                      <div className="update-form-tips">
                        <span>
                          <CiCircleInfo />
                        </span>
                        <p>
                          If you want to make a cash offer to the other party,
                          enter the amount here.
                        </p>
                      </div>
                      <input
                        type="number"
                        value={requestedMoney}
                        onChange={(e) => setRequestedMoney(e.target.value)}
                      />
                    </div>
                  </>
                ) : null}

                <div className="offer-update-form-item">
                  <div className="update-form-tips">
                    <span>
                      <CiCircleInfo />
                    </span>
                    <p>The offer message sent to you.</p>
                  </div>
                  <input
                    type="text"
                    value={offer.offer_details.offerMessage}
                    readOnly
                  />
                </div>

                <div className="offer-update-form-item">
                  <div className="update-form-tips">
                    <span>
                      <CiCircleInfo />
                    </span>
                    <p>
                      If you want to send message to the other party, enter the
                      message here.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Send message"
                    value={offerUpdateMessage}
                    onChange={(e) => setOfferUpdateMessage(e.target.value)}
                  />
                </div>

                {offer.status === "active" ? (
                  <div className="offer-update-form-item buttons ">
                    <button
                      onClick={handleCancelOffer}
                      className="reject-button"
                    >
                      Reject
                    </button>
                    <button
                      className="submit-button"
                      onClick={handleCreateCounterOffer}
                    >
                      Update Offer
                    </button>
                    <button
                      onClick={handleAcceptOffer}
                      className="accept-button"
                    >
                      Accept
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeChain;
