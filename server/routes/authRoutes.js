const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
