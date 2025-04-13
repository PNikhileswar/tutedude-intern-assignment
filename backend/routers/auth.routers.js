const express = require('express');
const { signup, login, validateToken } = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/validate', authMiddleware, validateToken);

module.exports = router;