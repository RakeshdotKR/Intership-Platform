const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BATCH_INCLUDE = {
  courses: true,
  enrollments: true,
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: BATCH_INCLUDE,
      orderBy: { startDate: 'asc' },
    });
    const batchesWithStats = batches.map(b => ({
      ...b,
      enrolledCount: b.enrollments.length,
      seatsLeft: b.totalSeats - b.enrollments.length,
    }));
    res.json({ batches: batchesWithStats });
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

const getBatchesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const batches = await prisma.batch.findMany({
      where: { courses: { some: { id: parseInt(courseId) } } },
      include: BATCH_INCLUDE,
      orderBy: { startDate: 'asc' },
    });
    const batchesWithStats = batches.map(b => ({
      ...b,
      enrolledCount: b.enrollments.length,
      seatsLeft: b.totalSeats - b.enrollments.length,
    }));
    res.json({ batches: batchesWithStats });
  } catch (error) {
    console.error('Get batches by course error:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

const createBatch = async (req, res) => {
  try {
    const { name, description, fee, courseIds, startDate, totalSeats } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Batch name is required' });
    }
    if (!courseIds || courseIds.length === 0) {
      return res.status(400).json({ error: 'At least one course is required' });
    }

    const batch = await prisma.batch.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        fee: parseFloat(fee) || 0,
        courses: { connect: courseIds.map(id => ({ id: parseInt(id) })) },
        startDate: new Date(startDate),
        totalSeats: parseInt(totalSeats) || 100,
      },
      include: BATCH_INCLUDE,
    });

    res.status(201).json({ batch });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A batch with this name already exists' });
    }
    console.error('Create batch error:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, fee, courseIds, startDate, totalSeats } = req.body;

    const batch = await prisma.batch.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        description: description?.trim() || null,
        ...(fee !== undefined && { fee: parseFloat(fee) }),
        ...(courseIds && { courses: { set: courseIds.map(id => ({ id: parseInt(id) })) } }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(totalSeats && { totalSeats: parseInt(totalSeats) }),
      },
      include: BATCH_INCLUDE,
    });

    res.json({ batch });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A batch with this name already exists' });
    }
    console.error('Update batch error:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.batch.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};

const updateBatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['NOT_STARTED', 'ONGOING', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const batch = await prisma.batch.update({
      where: { id: parseInt(id) },
      data: { status },
      include: BATCH_INCLUDE,
    });

    res.json({ batch });
  } catch (error) {
    console.error('Update batch status error:', error);
    res.status(500).json({ error: 'Failed to update batch status' });
  }
};

module.exports = {
  getAllBatches,
  getBatchesByCourse,
  createBatch,
  updateBatch,
  deleteBatch,
  updateBatchStatus,
};
