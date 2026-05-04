// Service for generating CSV exports

const generateStudentCSV = (enrollments) => {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'College',
    'Branch',
    'Year',
    'Payment Status',
    'Enrollment Date'
  ];

  const rows = enrollments.map(enrollment => {
    const student = enrollment.student;
    const payment = enrollment.payment;
    return [
      student.name,
      student.email,
      student.phone,
      student.college || '',
      student.branch || '',
      student.year || '',
      payment?.status || 'PENDING',
      enrollment.createdAt.toISOString().split('T')[0]
    ];
  });

  // Convert to CSV format
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
};

module.exports = {
  generateStudentCSV
};