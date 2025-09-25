const router = require('express').Router();
const { signup, login, verifyToken } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const auth = require('../Middlewares/auth');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/verify', auth, verifyToken);

module.exports = router;