const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const getStats = async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

    const payments = await prisma.payment.findMany({ where: { status: 'SUCCESS' } });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const [upcomingBatches, ongoingBatches, completedBatches, totalBatches] = await Promise.all([
      prisma.batch.count({ where: { status: 'NOT_STARTED' } }),
      prisma.batch.count({ where: { status: 'ONGOING' } }),
      prisma.batch.count({ where: { status: 'COMPLETED' } }),
      prisma.batch.count(),
    ]);

    res.json({ stats: { totalStudents, totalRevenue, upcomingBatches, ongoingBatches, completedBatches, totalBatches } });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        branch: true,
        year: true,
        createdAt: true,
        enrollments: {
          include: {
            batch: { include: { courses: true } },
            payment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

const exportStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { batchId: parseInt(batchId) },
      include: {
        student: true,
        payment: true,
        batch: { include: { courses: true } },
      },
    });

    const batchName = enrollments[0]?.batch?.name || `batch_${batchId}`;
    const courseNames = enrollments[0]?.batch?.courses?.map(c => c.title).join('; ') || '';

    const csvHeaders = 'Name,Email,Phone,College,Branch,Year,Batch,Courses,Payment Status,Enrollment Date\n';
    const csvRows = enrollments.map(e => {
      const s = e.student;
      return `"${s.name}","${s.email}","${s.phone}","${s.college || ''}","${s.branch || ''}","${s.year || ''}","${batchName}","${courseNames}","${e.payment?.status || 'PENDING'}","${e.createdAt.toISOString().split('T')[0]}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=batch_${batchId}_students.csv`);
    res.send(csvHeaders + csvRows);
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ error: 'Failed to export students' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, phone, college, branch, year, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const student = await prisma.user.create({
      data: { name, email, phone: phone || '', college, branch, year, passwordHash, role: 'STUDENT' },
      select: { id: true, name: true, email: true, phone: true, college: true, branch: true, year: true, createdAt: true, enrollments: { include: { batch: { include: { courses: true } }, payment: true } } },
    });
    res.status(201).json({ student });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, college, branch, year } = req.body;
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id: parseInt(id) } } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use by another account.' });
    }
    const student = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, phone, college, branch, year },
      select: { id: true, name: true, email: true, phone: true, college: true, branch: true, year: true, createdAt: true, enrollments: { include: { batch: { include: { courses: true } }, payment: true } } },
    });
    res.json({ student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const enrollments = await prisma.enrollment.findMany({ where: { studentId: userId }, select: { id: true } });
    const enrollmentIds = enrollments.map((e) => e.id);
    await prisma.payment.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
    await prisma.enrollment.deleteMany({ where: { studentId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

module.exports = { getStats, getAllStudents, exportStudentsByBatch, createStudent, updateStudent, deleteStudent };
