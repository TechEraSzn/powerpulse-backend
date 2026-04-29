const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { name, email, password, area_id } = req.body;

    if (!name || !email || !password || !area_id) {
      return res.status(400).json({
        error: 'name, email, password and area_id are required'
      });
    }

    // validate area
    const areaCheck = await db.query(
      'SELECT id FROM areas WHERE id=$1',
      [area_id]
    );

    if (!areaCheck.rows.length) {
      return res.status(400).json({ error: 'Invalid area' });
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await db.query(
      `INSERT INTO users(name, email, password_hash, area_id)
       VALUES($1,$2,$3,$4)
       RETURNING id`,
      [name, email, hash, area_id]
    );

    const userId = rows[0].id;

      const userWithArea = await db.query(
      `SELECT u.id, u.name, u.email, a.name AS area, a.city
       FROM users u
       JOIN areas a ON u.area_id = a.id
       WHERE u.id = $1`,
      [userId]
    );

    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: userWithArea.rows[0]
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }

    return res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userWithArea = await db.query(
      `SELECT u.id, u.name, u.email, a.name AS area, a.city
       FROM users u
       JOIN areas a ON u.area_id = a.id
       WHERE u.id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: userWithArea.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};