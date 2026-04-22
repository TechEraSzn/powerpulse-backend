const express = require("express");
const helmet = require('helmet');
const cors = require("cors");
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',          require('./src/routes/auth'));
// app.use('/api/areas',         require('./routes/areas'));
// app.use('/api/reports',       require('./routes/reports'));
// app.use('/api/follows',       require('./routes/follows'));
// app.use('/api/notifications', require('./routes/notifications'));


app.get("/", (req, res) => {
  res.send("PowerPulse api running...");
});

module.exports = app;