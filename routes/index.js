const router = require('koa-router')()
const home = require('../controllers/home');

router.get('/api', home.index);
router.post('/api/auth', home.auth);
router.get('/api/get-user-info', home.getUserInfo);

module.exports = router;
