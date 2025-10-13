const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { getIO, onlineUsers } = require('../config/socket');

// --------------------------- ADD TO FAVORITES ---------------------------
router.post('/', auth, async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) return res.status(400).json({ success: false, message: 'Product ID is required' });

    // Aynı favori varsa hata dön
    const exists = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );
    if (exists.rows.length > 0) return res.status(400).json({ success: false, message: 'Already favorited' });

    // Favoriye ekle
    const result = await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [user_id, product_id]
    );

    // 🔹 Notification
    const productRes = await pool.query('SELECT user_id, title FROM products WHERE id=$1', [product_id]);
    if (productRes.rows.length > 0) {
      const productOwnerId = productRes.rows[0].user_id;
      const productTitle = productRes.rows[0].title;
      if (productOwnerId !== user_id) { // Kendi ürününü favorileme bildirimini engelle
        const message = `Your product "${productTitle}" was favorited by a user.`;
        const newNotification = await pool.query(
          `INSERT INTO notifications (sender_id, receiver_id, type, message, related_product_id)
           VALUES ($1, $2, 'favorite', $3, $4) RETURNING *`,
          [user_id, productOwnerId, message, product_id]
        );
        const io = getIO();
        const targetSocketId = onlineUsers.get(String(productOwnerId));
        if (targetSocketId) io.to(targetSocketId).emit('notification', newNotification.rows[0]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      favorite: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- REMOVE FROM FAVORITES ---------------------------
router.delete('/:product_id', auth, async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [user_id, product_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Favorite not found' });

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites',
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- GET USER FAVORITES ---------------------------
router.get('/', auth, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `
      SELECT 
        p.*, 
        json_agg(pi.image_url) AS images
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE f.user_id = $1
      GROUP BY p.id
      ORDER BY f.created_at DESC
      `,
      [user_id]
    );
    res.status(200).json({
      success: true,
      message: 'Favorites fetched successfully',
      favorites: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- CHECK IF FAVORITED ---------------------------
router.get('/check/:product_id', auth, async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );
    res.status(200).json({
      success: true,
      isFavorited: result.rows.length > 0,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
