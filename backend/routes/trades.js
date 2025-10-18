const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { getIO, onlineUsers } = require('../config/socket');
require('../middleware/error');

// ---------------------------
// 1️⃣ Trade oluştur
// POST /api/trades
router.post('/', auth, async (req, res, next) => {
  try {
    const { receiver_id, product_id } = req.body; // product_id eklendi
    const sender_id = req.user.id;

    if (!receiver_id || !product_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newTrade = await pool.query(
      'INSERT INTO trades (sender_id, receiver_id, product_id) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, product_id],
    );

    const trade = newTrade.rows[0];

    // Socket ile anlık gönderim
    const io = getIO();
    io.to(trade.id).emit('trade_created', trade);

    // Karşı tarafa bildirim
    const targetSocketId = onlineUsers.get(String(receiver_id));
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', {
        sender_id,
        receiver_id,
        type: 'trade',
        message: 'You have a new trade request',
        related_product_id: trade.id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      trade,
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------
// 2️⃣ Teklif oluştur
// POST /api/trades/:trade_id/offers
router.post('/:trade_id/offers', auth, async (req, res, next) => {
  try {
    const { trade_id } = req.params;
    const { offer_details, product_id } = req.body;
    const sender_id = req.user.id;

    // Trade kontrol: sadece taraflar offer oluşturabilir
    const tradeResult = await pool.query('SELECT * FROM trades WHERE id = $1', [trade_id]);
    if (tradeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }
    const trade = tradeResult.rows[0];

    const receiver_id = trade.sender_id === sender_id ? trade.receiver_id : trade.sender_id;

    const newOffer = await pool.query(
      `INSERT INTO trade_offers (trade_id, sender_id, receiver_id, offer_details) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [trade_id, sender_id, receiver_id, offer_details],
    );
    const offer = newOffer.rows[0];

    // ---------------------------
    // Notification + Socket.io
    try {
      const message = `User ${sender_id} made you an offer`;
      const notificationResult = await pool.query(
        `INSERT INTO notifications (sender_id, receiver_id, type, content, product_id)
         VALUES ($1, $2, 'offer', $3, $4) RETURNING *`,
        [sender_id, receiver_id, message, product_id],
      );

      const io = getIO();
      const targetSocketId = onlineUsers.get(String(receiver_id));
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notificationResult.rows[0]);
      }

      io.to(trade_id).emit('offer_created', offer);
    } catch (err) {
      console.warn('Notification/socket error (ignored, offer still added):', err);
    }

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer,
    });
  } catch (error) {
    next(error);
  }
});

// Karşı Teklif Oluştur
router.post('/:trade_id/offers/:offer_id/counter', auth, async (req, res, next) => {
  try {
    const { trade_id, offer_id } = req.params;
    const { offer_details, product_id } = req.body;
    const sender_id = req.user.id;

    // Trade kontrol
    const tradeResult = await pool.query('SELECT * FROM trades WHERE id = $1', [trade_id]);
    if (tradeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }
    const trade = tradeResult.rows[0];

    // Orijinal teklif kontrol
    const offerResult = await pool.query('SELECT * FROM trade_offers WHERE id = $1', [offer_id]);
    if (offerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Original offer not found' });
    }
    const originalOffer = offerResult.rows[0];

    // Sadece diğer taraf karşı teklif yapabilir
    if (originalOffer.sender_id === sender_id) {
      return res.status(400).json({ success: false, message: 'Cannot counter your own offer' });
    }

    const receiver_id = originalOffer.sender_id;

    // Karşı teklif oluştur
    const newOffer = await pool.query(
      `INSERT INTO trade_offers
        (trade_id, sender_id, receiver_id, offer_details, status, created_at, updated_at, parent_offer_id)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW(), $5)
       RETURNING *`,
      [trade_id, sender_id, receiver_id, offer_details, offer_id],
    );

    const offer = newOffer.rows[0];

    // ---------------------------
    // Notification + Socket.io
    try {
      const message = `User ${sender_id} made a counter offer`;
      const notificationResult = await pool.query(
        `INSERT INTO notifications (sender_id, receiver_id, type, content, product_id)
         VALUES ($1, $2, 'counter_offer', $3, $4) RETURNING *`,
        [sender_id, receiver_id, message, product_id],
      );

      const io = getIO();
      const targetSocketId = onlineUsers.get(String(receiver_id));
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notificationResult.rows[0]);
      }

      io.to(trade_id).emit('offer_countered', offer);
    } catch (err) {
      console.warn('Notification/socket error (ignored, counter offer still added):', err);
    }

    res.status(201).json({
      success: true,
      message: 'Counter offer created successfully',
      offer,
    });
  } catch (error) {
    next(error);
  }
});

// karşı teklif listele
router.get('/:trade_id/offers/:offer_id/counters', auth, async (req, res, next) => {
  try {
    const { offer_id } = req.params;

    const counterOffers = await pool.query(
      'SELECT * FROM trade_offers WHERE parent_offer_id = $1 ORDER BY created_at ASC',
      [offer_id],
    );

    res.status(200).json({
      success: true,
      message: 'Counter offers fetched successfully',
      offers: counterOffers.rows,
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------
// 3️⃣ Teklifleri listele
// GET /api/trades/:trade_id/offers
router.get('/:trade_id/offers', auth, async (req, res, next) => {
  try {
    const { trade_id } = req.params;
    const offers = await pool.query(
      `SELECT * FROM trade_offers WHERE trade_id = $1 ORDER BY created_at ASC`,
      [trade_id],
    );

    res.status(200).json({
      success: true,
      message: 'Offers fetched successfully',
      offers: offers.rows,
    });
  } catch (error) {
    next(error);
  }
});

// ---------------------------
// 4️⃣ Teklif durumunu güncelle
// PUT /api/trades/offers/:id/status
router.put('/offers/:id/status', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    const offerResult = await pool.query('SELECT * FROM trade_offers WHERE id = $1', [id]);
    if (offerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    const offer = offerResult.rows[0];

    if (![offer.sender_id, offer.receiver_id].includes(user_id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this offer' });
    }

    const updatedResult = await pool.query(
      `UPDATE trade_offers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id],
    );
    const updatedOffer = updatedResult.rows[0];

    const io = getIO();
    io.to(updatedOffer.trade_id).emit('offer_updated', updatedOffer);

    const otherUserId =
      updatedOffer.sender_id === user_id ? updatedOffer.receiver_id : updatedOffer.sender_id;

    try {
      const message = `Offer status updated to ${status}`;
      const notificationResult = await pool.query(
        `INSERT INTO notifications (sender_id, receiver_id, type, content, product_id)
         VALUES ($1, $2, 'offer_status', $3, $4) RETURNING *`,
        [user_id, otherUserId, message, updatedOffer.trade_id],
      );

      const targetSocketId = onlineUsers.get(String(otherUserId));
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notificationResult.rows[0]);
      }
    } catch (err) {
      console.warn('Notification/socket error (ignored, status updated):', err);
    }

    res.status(200).json({ success: true, offer: updatedOffer });
  } catch (error) {
    next(error);
  }
});

// ---------------------------
// 5️⃣ Existing trade kontrolü
// GET /api/trades/existing
router.get('/existing', auth, async (req, res, next) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, product_id } = req.query;

    if (!receiver_id || !product_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingTradeQuery = await pool.query(
      `SELECT * FROM trades
       WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))
         AND product_id = $3`,
      [sender_id, receiver_id, product_id],
    );

    if (existingTradeQuery.rows.length > 0) {
      return res.status(200).json({ success: true, trade: existingTradeQuery.rows[0] });
    } else {
      return res.status(200).json({ success: true, trade: null });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
