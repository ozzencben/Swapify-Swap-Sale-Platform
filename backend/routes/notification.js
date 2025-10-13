const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { getIO, onlineUsers } = require('../config/socket');

// 🔹 Bildirim oluştur
router.post('/', auth, async (req, res, next) => {
  try {
    const { receiver_id, type, message, related_product_id } = req.body;
    const sender_id = req.user.id;

    const newNotification = await pool.query(
      `INSERT INTO notifications (sender_id, receiver_id, type, message, related_product_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sender_id, receiver_id, type, message, related_product_id]
    );

    const notification = newNotification.rows[0];

    // Socket ile anlık gönderim
    const io = getIO();
    const targetSocketId = onlineUsers.get(String(receiver_id));
    if (targetSocketId) {
      io.to(targetSocketId).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification,
    });
  } catch (error) {
    next(error);
  }
});

// 🔹 Kullanıcının tüm bildirimleri
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notifications = await pool.query(
      `SELECT n.*, u.username AS sender_name
       FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       WHERE receiver_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      notifications: notifications.rows,
    });
  } catch (error) {
    next(error);
  }
});

// 🔹 Bildirimi okundu olarak işaretle
router.put('/:id/read', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// 🔹 Bildirimi sil
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
