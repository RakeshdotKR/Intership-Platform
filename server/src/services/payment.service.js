// Dummy payment service for simulation
// In production, integrate with actual payment gateway like Razorpay

const simulatePayment = async (amount, transactionId) => {
  // Simulate payment processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        resolve({
          success: true,
          transactionId,
          amount,
          status: 'SUCCESS'
        });
      } else {
        reject({
          success: false,
          transactionId,
          amount,
          status: 'FAILED',
          error: 'Payment failed'
        });
      }
    }, 2000); // 2 second delay
  });
};

module.exports = {
  simulatePayment
};