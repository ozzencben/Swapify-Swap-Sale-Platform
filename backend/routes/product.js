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
// --------------------------- UPDATE PRODUCT ---------------------------
router.put('/update/:id', auth, upload.array('images', 10), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Mevcut ürünü al
    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Product does not exist' });
    }

    const product = existingProduct.rows[0];

    // FormData’dan gelen değerleri al, yoksa mevcut üründen al
    const title = req.body.title || product.title;
    const description = req.body.description || product.description;
    const price = req.body.price ? Number(req.body.price) : product.price;
    const category_id = req.body.category_id || product.category_id;
    const condition = req.body.condition || product.condition;
    const is_tradeable =
      req.body.is_tradeable === 'true' || req.body.is_tradeable === true || product.is_tradeable;
    const status = req.body.status || product.status;

    // Ürünü güncelle
    const updatedProduct = await pool.query(
      `UPDATE products
       SET title=$1, description=$2, price=$3, category_id=$4, condition=$5, is_tradeable=$6, status=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [title, description, price, category_id, condition, is_tradeable, status, id],
    );

    // Yeni görselleri ekle
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

    // Silinen görselleri kaldır
    let removedImages = [];
    if (req.body.removedImages) {
      try {
        removedImages = JSON.parse(req.body.removedImages);
      } catch (err) {
        removedImages = [];
      }
    }

    if (Array.isArray(removedImages) && removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (url) => {
          // DB’den sil
          await pool.query('DELETE FROM product_images WHERE product_id=$1 AND image_url=$2', [
            id,
            url,
          ]);

          // Cloudinary’den sil
          const publicId = url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`product_images/${publicId}`);
        }),
      );
    }

    // Güncellenmiş ürünü ve görselleri getir
    const productWithImages = await pool.query(
      `SELECT p.*, COALESCE(json_agg(pi.image_url ORDER BY pi.is_primary DESC) FILTER (WHERE pi.image_url IS NOT NULL), '[]') AS images
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
    console.error('Error updating product:', error);
    next(error);
  }
});

// --------------------------- REMOVE SINGLE IMAGE ---------------------------
router.post('/remove-image/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params; // ürün id
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL required' });
    }

    // 1️⃣ product_images tablosundan sil
    await pool.query('DELETE FROM product_images WHERE product_id = $1 AND image_url = $2', [
      id,
      imageUrl,
    ]);

    // 2️⃣ Cloudinary'den de sil (public_id'yi URL'den çıkarıyoruz)
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`product_images/${publicId}`);

    res.status(200).json({
      success: true,
      message: 'Image removed successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Error removing image:', error);
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
