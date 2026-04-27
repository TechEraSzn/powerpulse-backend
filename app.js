const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
const morgan = require('morgan');

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

app.get("/", (req, res) => {
  res.send("PowerPulse api running...");
});

module.exports = app;