const express = require('express');
const {
  initiatePayment,
  confirmPayment
} = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/initiate', authenticateToken, initiatePayment);
router.post('/confirm', authenticateToken, confirmPayment);

module.exports = router;