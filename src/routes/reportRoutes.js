const router = require('express').Router();
const auth = require('../middleware/auth');

const {
  createReport,
  getReportsByArea
} = require('../controllers/reportController.js');

router.post('/', auth, createReport);
router.get('/', getReportsByArea);

module.exports = router;