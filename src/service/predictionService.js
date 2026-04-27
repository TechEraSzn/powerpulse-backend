const db = require('../config/db');

// Why a separate service file?
// Because prediction logic doesn't belong in the route.
// Routes handle HTTP (request/response).
// Services handle business logic.
// This separation makes your code easier to test and reuse.

exports.getPrediction = async (area_id) => {
  // Step 1: Pull last 7 days of reports, grouped by hour and status
  // EXTRACT(HOUR FROM ...) pulls just the hour: 14, 15, 16 etc.
  const { rows } = await db.query(
    `SELECT
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'Africa/Lagos') AS hour,
      status,
      COUNT(*) AS count
     FROM reports
     WHERE area_id = $1
       AND created_at > NOW() - INTERVAL '7 days'
     GROUP BY hour, status
     ORDER BY hour`,
    [area_id]
  );

  // Step 2: Build a map of { hour -> { on: N, off: N } }
  // e.g. { 14: { on: 5, off: 2 }, 15: { on: 7, off: 1 } }
  const hourMap = {};
  for (const row of rows) {
    const h = parseInt(row.hour);
    if (!hourMap[h]) hourMap[h] = { on: 0, off: 0 };
    hourMap[h][row.status.toLowerCase()] += parseInt(row.count);
  }

  // Step 3: Get current Lagos hour
  const lagosHour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })
  ).getHours();

  // Step 4: Look ahead up to 12 hours for a likely ON window
  // "Likely" = power was ON > 60% of the time at that hour historically
  for (let hoursAhead = 1; hoursAhead <= 12; hoursAhead++) {
    const nextHour = (lagosHour + hoursAhead) % 24;
    const slot = hourMap[nextHour];

    if (slot) {
      const total = slot.on + slot.off;
      const onRate = slot.on / total;

      if (onRate > 0.6) {
        return `Likely back in ~${hoursAhead} hour${hoursAhead > 1 ? 's' : ''} based on area history`;
      }
    }
  }

  // Not enough data or no clear pattern found
  return 'No prediction available — not enough historical data for this area';
};