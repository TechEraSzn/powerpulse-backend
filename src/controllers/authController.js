const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      'INSERT INTO users(name, email, password_hash) VALUES($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    );
    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: rows[0] });
  } catch (err) {
    if (err.code === '23505') // unique violation
      return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: rows[0].id, name: rows[0].name, email: rows[0].email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};