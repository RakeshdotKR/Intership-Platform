const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initiatePayment = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    // Find enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        batch: {
          include: {
            course: true
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { enrollmentId: parseInt(enrollmentId) }
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already initiated' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: parseInt(enrollmentId),
        amount: enrollment.batch.course.fee,
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

const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        enrollment: {
          include: {
            batch: {
              include: {
                course: true
              }
            }
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

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: 'SUCCESS',
        paidAt: new Date()
      },
      include: {
        enrollment: {
          include: {
            batch: {
              include: {
                course: true
              }
            }
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

module.exports = {
  initiatePayment,
  confirmPayment
};