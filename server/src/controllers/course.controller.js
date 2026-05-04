const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        batches: {
          where: {
            status: {
              in: ['NOT_STARTED', 'ONGOING']
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });

    // Add enrollment count and seats left for each batch
    const coursesWithStats = courses.map(course => ({
      ...course,
      batches: course.batches.map(batch => {
        const enrollmentCount = batch.enrollments?.length || 0;
        return {
          ...batch,
          enrolledCount: enrollmentCount,
          seatsLeft: batch.totalSeats - enrollmentCount
        };
      })
    }));

    res.json({ courses: coursesWithStats });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        batches: {
          where: {
            status: {
              in: ['NOT_STARTED', 'ONGOING']
            }
          },
          include: {
            enrollments: true
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Add enrollment stats
    const courseWithStats = {
      ...course,
      batches: course.batches.map(batch => ({
        ...batch,
        enrolledCount: batch.enrollments.length,
        seatsLeft: batch.totalSeats - batch.enrollments.length
      }))
    };

    res.json({ course: courseWithStats });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, fee, duration, syllabus, techStack, image } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        fee: parseFloat(fee),
        duration,
        syllabus,
        techStack,
        ...(image && { image })
      }
    });

    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fee, duration, syllabus, techStack, image } = req.body;

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        fee: parseFloat(fee),
        duration,
        syllabus,
        techStack,
        image: image === '' ? null : image, 
      }
    });

    res.json({ course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};