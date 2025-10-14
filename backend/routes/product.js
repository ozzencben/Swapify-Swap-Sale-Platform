const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const auth = require('../middleware/auth');
require('dotenv').config();
require('../middleware/error');
const { pool } = require('../config/db');

// --------------------------- CREATE PRODUCT ---------------------------
router.post('/create', auth, upload.array('images', 10), async (req, res, next) => {
  console.log('➡️ USER ID:', req.user.id);
  console.log('➡️ BODY:', req.body);
  console.log('➡️ FILES:', req.files);

  const { title, description, price, category_id, condition, is_tradeable, status } = req.body;
  const user_id = req.user.id; // ✅ auth middleware uyumlu

  try {
    const product = await pool.query(
      'INSERT INTO products (title, description, price, category_id, condition, is_tradeable, status, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [title, description, price, category_id, condition, is_tradeable, status, user_id],
    );

    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'product_images',
            resource_type: 'image',
          }),
        ),
      );

      await Promise.all(
        uploadResults.map((r, index) =>
          pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [product.rows[0].id, r.secure_url, index === 0],
          ),
        ),
      );
    }

    res.status(200).json({
      success: true,
      message: 'Product created successfully',
      product: product.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- GET PRODUCTS ---------------------------
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category_id, user_id, tradeable, status, condition } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*, 
        COALESCE(json_agg(pi.image_url ORDER BY pi.is_primary DESC) FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
    `;

    let conditions = [];
    let params = [];

    if (category_id) {
      conditions.push(`p.category_id = $${params.length + 1}`);
      params.push(category_id);
    }
    if (user_id) {
      conditions.push(`p.user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    if (tradeable) {
      conditions.push(`p.is_tradeable = $${params.length + 1}`);
      params.push(tradeable === 'true' || tradeable === true);
    }
    if (status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }
    if (condition) {
      conditions.push(`p.condition = $${params.length + 1}`);
      params.push(condition);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const products = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      products: products.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// --------------------------- GET SINGLE PRODUCT ---------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, json_agg(pi.image_url ORDER BY pi.is_primary DESC) AS images
       FROM products p
       LEFT JOIN product_images pi ON pi.product_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Product does not exist' });
    }

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      product: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- UPDATE PRODUCT ---------------------------
router.put('/update/:id', auth, upload.array('images', 10), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, condition, is_tradeable, status } = req.body;

    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Product does not exist' });
    }

    const updatedProduct = await pool.query(
      'UPDATE products SET title=$1, description=$2, price=$3, category_id=$4, condition=$5, is_tradeable=$6, status=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [title, description, price, category_id, condition, is_tradeable, status, id],
    );

    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'product_images',
            resource_type: 'image',
          }),
        ),
      );

      await Promise.all(
        uploadResults.map((urlObj) =>
          pool.query(
            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
            [id, urlObj.secure_url, false],
          ),
        ),
      );
    }

    const productWithImages = await pool.query(
      `SELECT p.*, json_agg(pi.image_url ORDER BY pi.is_primary DESC) AS images
       FROM products p
       LEFT JOIN product_images pi ON pi.product_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id],
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: productWithImages.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------- DELETE PRODUCT ---------------------------
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Product does not exist' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
