const db = require('../config/db');

exports.getAllAreas = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, city, current_status, last_updated FROM areas ORDER BY city, name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAreaById = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM areas WHERE id=$1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Area not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};