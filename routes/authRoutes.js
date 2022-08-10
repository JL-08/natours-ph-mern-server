const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router
  .route('/refresh-token')
  .post(authController.protect, authController.createRefreshToken);
router
  .route('/revoke-refresh-token')
  .post(authController.protect, authController.revokeRefreshToken);
router
  .route('/:id/refresh-token')
  .get(authController.protect, authController.getRefreshToken);

module.exports = router;
