const express = require('express');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Kullanıcının tüm adreslerini getir
router.get('/', auth, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT * FROM address WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id],
    );
    res.status(200).json({ success: true, addresses: result.rows });
  } catch (error) {
    next(error);
  }
});

// Tek bir adresi getir
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query('SELECT * FROM address WHERE id = $1 AND user_id = $2', [
      id,
      user_id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Address not found' });

    res.status(200).json({ success: true, address: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Yeni adres oluştur
router.post('/', auth, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const {
      province,
      district,
      neighborhood,
      street,
      building_number,
      apartment_number,
      postal_code,
      address_note,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO address 
      (user_id, province, district, neighborhood, street, building_number, apartment_number, postal_code, address_note)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        user_id,
        province,
        district,
        neighborhood || null,
        street,
        building_number || null,
        apartment_number || null,
        postal_code || null,
        address_note || null,
      ],
    );

    res.status(201).json({ success: true, address: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Adres güncelle
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const {
      province,
      district,
      neighborhood,
      street,
      building_number,
      apartment_number,
      postal_code,
      address_note,
    } = req.body;

    const result = await pool.query(
      `UPDATE address SET
        province = $1,
        district = $2,
        neighborhood = $3,
        street = $4,
        building_number = $5,
        apartment_number = $6,
        postal_code = $7,
        address_note = $8,
        updated_at = NOW()
      WHERE id = $9 AND user_id = $10
      RETURNING *`,
      [
        province,
        district,
        neighborhood || null,
        street,
        building_number || null,
        apartment_number || null,
        postal_code || null,
        address_note || null,
        id,
        user_id,
      ],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Address not found' });

    res.status(200).json({ success: true, address: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Adres sil
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM address WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Address not found' });

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
