const express = require('express');
const {
  enrollInBatch,
  getMyEnrollments,
  getEnrollmentsByBatch
} = require('../controllers/enrollment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/', authenticateToken, enrollInBatch);
router.get('/my', authenticateToken, getMyEnrollments);
router.get('/batch/:batchId', authenticateToken, requireAdmin, getEnrollmentsByBatch);

module.exports = router;