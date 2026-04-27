const db = require('../config/db');

exports.insights = async (req, res) => {
  const { area_id } = req.query;

  // Always validate inputs before hitting the DB
  if (!area_id) {
    return res.status(400).json({ error: 'area_id query param is required' });
  }

  try {
    // --- Query 1: Today's uptime ---
    // Each report represents a snapshot at that moment.
    // We assume each ON report = roughly 30 mins of power (0.5 hrs).
    // This is the MVP heuristic — good enough for now.
    const { rows: todayRows } = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'ON') * 0.5 AS uptime_hours
       FROM reports
       WHERE area_id = $1
         AND created_at >= CURRENT_DATE`,
      [area_id]
    );

    // --- Query 2: Weekly trend ---
    // Group reports by day, count ON reports per day.
    // DATE() strips the time part so "2025-01-01 14:32" becomes "2025-01-01"
    // AT TIME ZONE converts UTC (how postgres stores it) to Lagos local time
    const { rows: weeklyRows } = await db.query(
      `SELECT
        DATE(created_at AT TIME ZONE 'Africa/Lagos') AS date,
        COUNT(*) FILTER (WHERE status = 'ON') * 0.5 AS uptime_hours
       FROM reports
       WHERE area_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY date
       ORDER BY date ASC`,
      [area_id]
    );

    res.json({
      today_uptime_hours: parseFloat(todayRows[0].uptime_hours) || 0,
      weekly_trend: weeklyRows.map(r => ({
        date: r.date,
        uptime_hours: parseFloat(r.uptime_hours) || 0
      })),
      prediction: null // placeholder — we'll fill this next
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

