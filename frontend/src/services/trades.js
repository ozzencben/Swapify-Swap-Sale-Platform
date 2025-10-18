import api from "../api/api";

// ---------------------------
// 1️⃣ Yeni Trade Oluştur
export const createTrade = async (receiver_id, product_id) => {
  try {
    const res = await api.post("/trades", { receiver_id, product_id });
    return res.data.trade;
  } catch (error) {
    console.error("Error creating trade:", error);
    throw error;
  }
};

// ---------------------------
// 2️⃣ Teklif Oluştur
export const createOffer = async (
  trade_id,
  receiver_id,
  offer_details,
  product_id
) => {
  try {
    const res = await api.post(`/trades/${trade_id}/offers`, {
      receiver_id,
      offer_details,
      product_id,
    });
    return res.data.offer;
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error;
  }
};

// trades/:trade_id/offers/:offer_id/counter
export const createCounterOffer = async (
  trade_id,
  offer_id,
  offer_details,
  product_id
) => {
  try {
    const res = await api.post(
      `/trades/${trade_id}/offers/${offer_id}/counter`,
      {
        offer_details,
        product_id,
      }
    );
    return res.data.offer; // yeni oluşturulan counter offer
  } catch (error) {
    console.error("Error creating counter offer:", error);
    throw error;
  }
};

// trades/:trade_id/offers/:offer_id/counters
export const getCounterOffers = async (trade_id, offer_id) => {
  try {
    const res = await api.get(
      `/trades/${trade_id}/offers/${offer_id}/counters`
    );
    return res.data.offers; // array şeklinde counter offers
  } catch (error) {
    console.error("Error fetching counter offers:", error);
    throw error;
  }
};

// ---------------------------
// 3️⃣ Teklifleri Listele
export const getOffers = async (trade_id) => {
  try {
    const res = await api.get(`/trades/${trade_id}/offers`);
    return res.data.offers;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};

// ---------------------------
// 4️⃣ Teklif Durumunu Güncelle
export const updateOfferStatus = async (offer_id, status) => {
  try {
    const res = await api.put(`/trades/offers/${offer_id}/status`, { status });
    return res.data.offer;
  } catch (error) {
    console.error("Error updating offer status:", error);
    throw error;
  }
};

// ---------------------------
// 5️⃣ Existing Trade Kontrolü
export const getExistingTrade = async (receiver_id, product_id) => {
  try {
    const res = await api.get("/trades/existing", {
      params: { receiver_id, product_id },
    });
    return res.data.trade; // trade objesi veya null
  } catch (error) {
    console.error("Error fetching existing trade:", error);
    throw error;
  }
};
