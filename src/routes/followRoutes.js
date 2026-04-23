const router = require('express').Router();
const auth = require('../middleware/auth');

const {
  followArea,
  unfollowArea,
  getUserFollows
} = require('../controllers/followController');

router.post('/', auth, followArea);
router.delete('/:area_id', auth, unfollowArea);
router.get('/', auth, getUserFollows);

module.exports = router;