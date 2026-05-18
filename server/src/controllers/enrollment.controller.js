const prisma = require("../config/prisma");


const BATCH_INCLUDE = { courses: true };

// enrollment.controller.js

const enrollInBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const studentId = req.user.id;

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { studentId, batchId: parseInt(batchId) },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this batch' });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(batchId) },
      include: { enrollments: true, courses: true },
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    if (batch.enrollments.length >= batch.totalSeats) {
      return res.status(400).json({ error: 'Batch is full' });
    }

    const { enrollment, payment } = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: { studentId, batchId: parseInt(batchId) },
        include: { batch: { include: { courses: true } } },
      });

      const payment = await tx.payment.create({
        data: {
          enrollmentId: enrollment.id,
          amount: batch.fee ?? 0,  // ✅ FIXED: Use batch.fee directly
          status: 'PENDING',
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      });

      return { enrollment, payment };
    });

    res.status(201).json({
      message: 'Enrolled successfully. Payment pending admin approval.',
      enrollment,
      payment: {
        id: payment.id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        batch: { include: BATCH_INCLUDE },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

const getEnrollmentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { batchId: parseInt(batchId) },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            branch: true,
            year: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Get batch enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

module.exports = {
  enrollInBatch,
  getMyEnrollments,
  getEnrollmentsByBatch,
};
