const router = require('express').Router();
const auth = require('../middleware/auth');

const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController.js');

router.get('/', auth, getNotifications);
router.patch('/:id/read', auth, markAsRead);

module.exports = router;