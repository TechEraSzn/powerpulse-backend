const db = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `UPDATE notifications
       SET is_read=TRUE
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({ id: rows[0].id, is_read: true });
  } catch (err) {
    next(err);
  }
};