const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { getIO, onlineUsers } = require('../config/socket');

// --------------------------- CHECK IF FAVORITED ---------------------------
router.get('/check/:product_id', auth, async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!/^[0-9a-fA-F-]{36}$/.test(product_id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id],
    );

    res.status(200).json({
      success: true,
      isFavorited: result.rows.length > 0,
    });
  } catch (error) {
    console.error('Error in GET /products/check/:product_id:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// --------------------------- ADD TO FAVORITES ---------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const productRes = await pool.query('SELECT user_id, title FROM products WHERE id = $1', [
      product_id,
    ]);

    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productOwnerId = productRes.rows[0].user_id;
    const productTitle = productRes.rows[0].title;

    if (productOwnerId === user_id) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot favorite your own product' });
    }

    const exists = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id],
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already favorited' });
    }

    const favoriteResult = await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [user_id, product_id],
    );

    // Notification
    try {
      const message = `Your product "${productTitle}" was favorited by `;
      const notificationResult = await pool.query(
        `INSERT INTO notifications (sender_id, receiver_id, type, content, product_id)
         VALUES ($1, $2, 'favorite', $3, $4) RETURNING *`,
        [user_id, productOwnerId, message, product_id],
      );

      const io = getIO();
      const targetSocketId = onlineUsers.get(String(productOwnerId));
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notificationResult.rows[0]);
      }
    } catch (err) {
      console.warn('Notification/socket error (ignored, favorite still added):', err);
    }

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      favorite: favoriteResult.rows[0],
    });
  } catch (error) {
    console.error('Error in POST /products/favorites:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// --------------------------- REMOVE FROM FAVORITES ---------------------------
router.delete('/:product_id', auth, async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!/^[0-9a-fA-F-]{36}$/.test(product_id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const user_id = req.user.id;
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [user_id, product_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites',
    });
  } catch (error) {
    console.error('Error in DELETE /products/favorites/:product_id:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// --------------------------- GET USER FAVORITES ---------------------------
router.get('', auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        p.id AS product_id,
        p.title,
        p.description,
        p.price,
        p.user_id AS owner_id,
        p.status,
        p.is_tradeable,
        json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) AS images,
        MAX(f.created_at) AS favorited_at
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE f.user_id = $1
      GROUP BY p.id
      ORDER BY favorited_at DESC
      `,
      [user_id],
    );

    res.status(200).json({
      success: true,
      message: 'Favorites fetched successfully',
      favorites: result.rows,
    });
  } catch (error) {
    console.error('Error in GET /products/favorites:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/all-product-ids', async (req, res) => {
  try {
    const result = await pool.query('SELECT product_id FROM favorites');

    // sadece product_id'leri array olarak almak
    const productIds = result.rows.map((row) => row.product_id);

    res.status(200).json({
      success: true,
      productIds,
    });
  } catch (error) {
    console.error('Error fetching all favorite product IDs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
