const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@internhub.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@internhub.com',
      phone: '9000000000',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  // ── Courses ────────────────────────────────────────────────────────────────
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Full Stack Web Development',
        description: 'Build production-ready web apps using the MERN stack. Covers React, Node.js, Express, and MongoDB with real project deployments.',
        fee: 4500,
        duration: '4 Weeks',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
        techStack: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
        syllabus: [
          { week: 1, topics: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Git basics'] },
          { week: 2, topics: ['React fundamentals', 'Hooks', 'React Router', 'State management'] },
          { week: 3, topics: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB & Mongoose'] },
          { week: 4, topics: ['Authentication', 'Deployment', 'Project work', 'Code review'] },
        ],
      },
    }),

    prisma.course.create({
      data: {
        title: 'Python & Data Science',
        description: 'Master Python programming and data analysis with Pandas, NumPy, and Matplotlib. Hands-on projects with real datasets.',
        fee: 3999,
        duration: '3 Weeks',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
        techStack: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Jupyter'],
        syllabus: [
          { week: 1, topics: ['Python basics', 'Data types', 'Functions', 'OOP'] },
          { week: 2, topics: ['NumPy arrays', 'Pandas DataFrames', 'Data cleaning'] },
          { week: 3, topics: ['Matplotlib', 'Seaborn', 'EDA', 'Final project'] },
        ],
      },
    }),

    prisma.course.create({
      data: {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn design thinking, Figma, wireframing, and prototyping. Create beautiful, user-centered digital products from scratch.',
        fee: 2999,
        duration: '2 Weeks',
        image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80',
        techStack: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems'],
        syllabus: [
          { week: 1, topics: ['Design thinking', 'User research', 'Wireframing', 'Figma basics'] },
          { week: 2, topics: ['Prototyping', 'Usability testing', 'Handoff to dev', 'Portfolio'] },
        ],
      },
    }),

    prisma.course.create({
      data: {
        title: 'DevOps & Cloud Basics',
        description: 'Understand CI/CD pipelines, Docker, and AWS fundamentals. Get hands-on with real deployment workflows.',
        fee: 4999,
        duration: '3 Weeks',
        image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
        techStack: ['Docker', 'AWS', 'GitHub Actions', 'Linux', 'Nginx'],
        syllabus: [
          { week: 1, topics: ['Linux basics', 'Shell scripting', 'Git advanced', 'SSH'] },
          { week: 2, topics: ['Docker', 'Docker Compose', 'Container networking'] },
          { week: 3, topics: ['AWS EC2', 'S3', 'CI/CD with GitHub Actions', 'Final project'] },
        ],
      },
    }),
  ]);

  const [fullStack, dataSci, uiux, devops] = courses;

  // ── Batches ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.batch.create({
      data: {
        name: 'Summer Full Stack 2025',
        description: 'Intensive 4-week full-stack program with live mentorship and placement support.',
        fee: 4500,
        startDate: new Date('2025-06-02'),
        totalSeats: 60,
        status: 'NOT_STARTED',
        courses: { connect: [{ id: fullStack.id }] },
      },
    }),

    prisma.batch.create({
      data: {
        name: 'Tech Combo Batch — July 2025',
        description: 'Master both web development and data science in one power-packed batch.',
        fee: 7499,
        startDate: new Date('2025-07-07'),
        totalSeats: 40,
        status: 'NOT_STARTED',
        courses: { connect: [{ id: fullStack.id }, { id: dataSci.id }] },
      },
    }),

    prisma.batch.create({
      data: {
        name: 'Designer + Developer Batch',
        description: 'The complete product engineering track — design, build, and deploy.',
        fee: 8999,
        startDate: new Date('2025-07-21'),
        totalSeats: 30,
        status: 'NOT_STARTED',
        courses: { connect: [{ id: uiux.id }, { id: fullStack.id }, { id: devops.id }] },
      },
    }),

    prisma.batch.create({
      data: {
        name: 'Cloud & Data Batch — Aug 2025',
        description: 'Data science meets cloud infrastructure. Ship ML-powered apps to AWS.',
        fee: 8499,
        startDate: new Date('2025-08-04'),
        totalSeats: 35,
        status: 'NOT_STARTED',
        courses: { connect: [{ id: dataSci.id }, { id: devops.id }] },
      },
    }),
  ]);

  console.log('✅ Database seeded successfully');
  console.log('   Admin → admin@internhub.com / admin123');
  console.log(`   ${courses.length} courses, 4 batches created`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
