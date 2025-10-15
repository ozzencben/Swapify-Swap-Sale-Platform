const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { getIO, onlineUsers } = require('../config/socket');

// --------------------------- GET PRODUCTS WITH FAVORITES ---------------------------
router.get('/with-favorites', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id AS product_id,
        p.title,
        p.description,
        p.price,
        p.user_id AS owner_id,
        json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) AS images,
        COUNT(f.user_id) AS favorites_count
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN favorites f ON p.id = f.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.status(200).json({
      success: true,
      message: 'Products with favorites fetched successfully',
      products: result.rows,
    });
  } catch (error) {
    console.error('Error in GET /products/with-favorites:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
