const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
require('dotenv').config();
require('../middleware/error');

//------ getCategories
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      categories: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// ---- getCategoryById
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    res.status(200).json({
      success: true,
      message: 'Category fetched successfully',
      category: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
