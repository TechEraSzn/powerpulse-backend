const router = require('express').Router();
const {insights} = require ('../controllers/insightControllers');

router.get('/', insights);
module.exports = router;