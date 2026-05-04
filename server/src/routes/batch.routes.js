const express = require('express');
const {
  getAllBatches,
  getBatchesByCourse,
  createBatch,
  updateBatch,
  deleteBatch,
  updateBatchStatus,
} = require('../controllers/batch.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/', getAllBatches);
router.get('/course/:courseId', getBatchesByCourse);
router.post('/', authenticateToken, requireAdmin, createBatch);
router.put('/:id', authenticateToken, requireAdmin, updateBatch);
router.delete('/:id', authenticateToken, requireAdmin, deleteBatch);
router.patch('/:id/status', authenticateToken, requireAdmin, updateBatchStatus);

module.exports = router;
