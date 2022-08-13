const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token', authController.createToken);

// router.post(
//   '/refresh-token',
//   authController.protect,
//   authController.createRefreshToken
// );
router.post(
  '/revoke-refresh-token',
  authController.protect,
  authController.revokeRefreshToken
);
router.get(
  '/:id/refresh-token',
  authController.protect,
  authController.getRefreshToken
);

module.exports = router;
