const db = require('../config/db');

exports.createReport = async (req, res, next) => {
  const { area_id, status } = req.body;

  if (!area_id || !['ON', 'OFF'].includes(status)) {
    return res.status(400).json({
      error: 'area_id and status (ON or OFF) are required'
    });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'INSERT INTO reports(area_id, user_id, status) VALUES($1,$2,$3) RETURNING *',
      [area_id, req.user.id, status]
    );

    await client.query(
      'UPDATE areas SET current_status=$1, last_updated=NOW() WHERE id=$2',
      [status, area_id]
    );

    await client.query('COMMIT');

    // fire and forget
    notifyFollowers(area_id, status).catch(console.error);

    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.getReportsByArea = async (req, res, next) => {
  const { area_id } = req.query;

  if (!area_id) {
    return res.status(400).json({
      error: 'area_id query param required'
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT r.id, r.status, r.created_at, u.name as user_name
       FROM reports r JOIN users u ON r.user_id = u.id
       WHERE r.area_id=$1 ORDER BY r.created_at DESC LIMIT 50`,
      [area_id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// helper
async function notifyFollowers(area_id, status) {
  const { rows: [area] } = await db.query(
    'SELECT name FROM areas WHERE id=$1',
    [area_id]
  );

  const emoji = status === 'ON' ? '⚡' : '❌';
  const action = status === 'ON' ? 'restored in' : 'outage detected in';
  const message = `${emoji} Power ${action} ${area.name}`;

  const { rows: followers } = await db.query(
    'SELECT user_id FROM follows WHERE area_id=$1',
    [area_id]
  );

  for (const f of followers) {
    await db.query(
      'INSERT INTO notifications(user_id, message) VALUES($1,$2)',
      [f.user_id, message]
    );
  }
}