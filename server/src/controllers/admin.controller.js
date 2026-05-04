const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getStats = async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

    const payments = await prisma.payment.findMany({ where: { status: 'SUCCESS' } });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const activeBatches = await prisma.batch.count({
      where: { status: { in: ['NOT_STARTED', 'ONGOING'] } },
    });

    const completedBatches = await prisma.batch.count({ where: { status: 'COMPLETED' } });

    res.json({ stats: { totalStudents, totalRevenue, activeBatches, completedBatches } });
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

module.exports = { getStats, getAllStudents, exportStudentsByBatch };
