{
  offers.map((offer) => (
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

        {/* Offer details */}
        <div className="offer-details">
          {offer.offer_details?.offerMoney && (
            <div className="offer-cash-box">
              <p className="offer-cash-label">Offered Money :</p>
              <span>{offer.offer_details.offerMoney}</span>
            </div>
          )}
          {offer.offer_details?.offerMessage && (
            <div className="offer-message-box">
              <p className="offer-message-label">Offer Message:</p>
              <p>{offer.offer_details.offerMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Offered products */}
      <div className="offered-products">
        {offer.offeredProducts.map((prod) => (
          <div
            key={prod.id}
            className="offered-product"
            onClick={() => navigate(`/product-detail/${prod.id}`)}
          >
            <p className="offered-product-label">Offered Product</p>
            <img
              src={prod.images[0]}
              alt={prod.title}
              className="offered-product-image"
            />
            <p>{prod.title}</p>
            <span>{prod.price}</span>
          </div>
        ))}
      </div>

      <div className="vertical"></div>
    </div>
  ));
}
