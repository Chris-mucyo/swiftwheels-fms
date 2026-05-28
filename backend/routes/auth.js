const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
    register,
    login,
    getMe,
    getUsers,
    updateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], register);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], login);

router.get('/me', protect, getMe);
router.get('/users', protect, authorize('administrator'), getUsers);
router.put('/users/:id', protect, authorize('administrator'), updateUser);

module.exports = router;