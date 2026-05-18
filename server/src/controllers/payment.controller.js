const prisma = require("../config/prisma");

const initiatePayment = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: { batch: true } // batch has fee directly, not nested in course
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { enrollmentId: parseInt(enrollmentId) }
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already initiated' });
    }

    const payment = await prisma.payment.create({
      data: {
        enrollmentId: parseInt(enrollmentId),
        amount: enrollment.batch.fee, // Use batch.fee directly
        status: 'PENDING',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

    res.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        status: payment.status
      },
      enrollment
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

// ✅ NEW: Admin confirms payment (replaces automatic confirm)
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        enrollment: {
          include: {
            batch: true,
            student: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: 'SUCCESS',
        paidAt: new Date()
      },
      include: {
        enrollment: {
          include: {
            batch: true,
            student: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    res.json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// ✅ NEW: Get all pending payments for admin
const getPendingPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        enrollment: {
          include: {
            batch: { select: { id: true, name: true, fee: true } },
            student: { select: { id: true, name: true, email: true, phone: true } }
          }
        }
      },
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
};

// ✅ NEW: Reject payment (optional)
const rejectPayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: { status: 'FAILED' }
    });

    res.json({ message: 'Payment rejected', payment: updated });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
};

module.exports = {
  initiatePayment,
  confirmPayment,
  getPendingPayments,
  rejectPayment
};