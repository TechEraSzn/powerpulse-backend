const router = require('express').Router();
const {
  getAllAreas,
  getAreaById
} = require('../controllers/areaController.js');

router.get('/', getAllAreas);
router.get('/:id', getAreaById);

module.exports = router;