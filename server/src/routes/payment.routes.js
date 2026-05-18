// routes/payment.routes.js
const express = require('express');
const {
  initiatePayment,
  confirmPayment,
  getPendingPayments,
  rejectPayment
} = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/initiate', authenticateToken, initiatePayment);
router.post('/confirm', authenticateToken, requireAdmin, confirmPayment); // Admin only
router.post('/reject', authenticateToken, requireAdmin, rejectPayment);   // Admin only
router.get('/pending', authenticateToken, requireAdmin, getPendingPayments); // Admin only

module.exports = router;