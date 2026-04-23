const db = require('../config/db');

exports.followArea = async (req, res, next) => {
  try {
    const { area_id } = req.body;

    const { rows } = await db.query(
      'INSERT INTO follows(user_id, area_id) VALUES($1,$2) RETURNING *',
      [req.user.id, area_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Already following this area'
      });
    }
    next(err);
  }
};

exports.unfollowArea = async (req, res, next) => {
  try {
    await db.query(
      'DELETE FROM follows WHERE user_id=$1 AND area_id=$2',
      [req.user.id, req.params.area_id]
    );

    res.json({ message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
};

// get all follows for a user
exports.getUserFollows = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT f.id, a.id as area_id, a.name, a.current_status
       FROM follows f JOIN areas a ON f.area_id = a.id
       WHERE f.user_id=$1`,
      [req.user.id]
    );

    res.json(rows.map(r => ({
      id: r.id,
      area: {
        id: r.area_id,
        name: r.name,
        current_status: r.current_status
      }
    })));
  } catch (err) {
    next(err);
  }
};