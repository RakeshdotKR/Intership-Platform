const express = require('express');
const {
  getStats,
  getAllStudents,
  exportStudentsByBatch,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/students', authenticateToken, requireAdmin, getAllStudents);
router.get('/export/:batchId', authenticateToken, requireAdmin, exportStudentsByBatch);
router.post('/students', authenticateToken, requireAdmin, createStudent);
router.put('/students/:id', authenticateToken, requireAdmin, updateStudent);
router.delete('/students/:id', authenticateToken, requireAdmin, deleteStudent);

module.exports = router;
