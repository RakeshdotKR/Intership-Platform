const express = require('express');
const {
  getStats,
  getAllStudents,
  exportStudentsByBatch
} = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/students', authenticateToken, requireAdmin, getAllStudents);
router.get('/export/:batchId', authenticateToken, requireAdmin, exportStudentsByBatch);

module.exports = router;