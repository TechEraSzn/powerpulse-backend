const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
const morgan = require('morgan');
const pool = require("./src/config/db");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/areas', require('./src/routes/areaRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/follows',  require('./src/routes/followRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/insight',  require('./src/routes/insightRoutes'));

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("PowerPulse api running...");
});

module.exports = app;