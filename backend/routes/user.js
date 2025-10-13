require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { cloudinary, upload } = require('../config/cloudinary');

// ================= REGISTER =================
router.post('/register', async (req, res, next) => {
  const { firstname, lastname, username, email, password } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const refreshToken = crypto.randomBytes(64).toString('hex');

    const newUser = await pool.query(
      'INSERT INTO users (firstname, lastname, username, email, password, refresh_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [firstname, lastname, username, email, hashedPassword, refreshToken],
    );

    const accessToken = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: newUser.rows[0],
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
    }

    const user = existingUser.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Yeni refresh token üret ve DB’ye kaydet
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// ================= REFRESH TOKEN =================
router.post('/refresh-token', async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [token]);

    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// ================= ME =================
router.get('/me', auth, async (req, res, next) => {
  try {
    const userResult = await pool.query(
      'SELECT id, firstname, lastname, username, email, profile_image, phone, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id],
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// ================= PROFILE =================
router.get('/profile/:id', auth, async (req, res, next) => {
  const userId = req.params.id;
  try {
    const userResult = await pool.query(
      'SELECT id, firstname, lastname, username, email, profile_image, phone, created_at, updated_at FROM users WHERE id = $1',
      [userId],
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// ================= UPDATE =================
router.put('/update', auth, upload.single('profile_image'), async (req, res, next) => {
  const { firstname, lastname, username, email, phone } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const currentUser = userResult.rows[0];

    let imageUrl = currentUser.profile_image;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_images',
        resource_type: 'image',
      });
      imageUrl = uploadResult.secure_url;
    }

    const updatedUser = await pool.query(
      'UPDATE users SET firstname = $1, lastname = $2, username = $3, email = $4, phone = $5, profile_image = $6 WHERE id = $7 RETURNING *',
      [firstname, lastname, username, email, phone, imageUrl, req.user.id],
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// ================= CHECK EMAIL =================
router.post('/check-email', async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (user) {
      return res.status(200).json({
        success: false,
        message: 'Email already exists',
        available: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email is available',
      available: true,
    });
  } catch (error) {
    next(error);
  }
});

// ================= CHECK USERNAME =================
router.post('/check-username', async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required',
    });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (user) {
      return res.status(200).json({
        success: false,
        message: 'Username already exists',
        available: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Username is available',
      available: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
