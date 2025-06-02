import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all QA pairs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      language,
      search,
      isActive = 'true',
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    let whereClause: any = {};

    if (isActive !== 'all') {
      whereClause.isActive = isActive === 'true';
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (language && language !== 'all') {
      whereClause.language = language;
    }

    if (search) {
      whereClause.OR = [
        { question: { contains: search as string, mode: 'insensitive' } },
        { answer: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } }
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    if (sortBy === 'priority') {
      orderBy = [
        { priority: sortOrder },
        { createdAt: 'desc' }
      ];
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === 'updatedAt') {
      orderBy = { updatedAt: sortOrder };
    } else {
      orderBy = { [sortBy as string]: sortOrder };
    }

    const qaPairs = await prisma.qAPair.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limitNum,
    });

    const total = await prisma.qAPair.count({ where: whereClause });
    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      data: qaPairs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error getting QA pairs:', error);
    return res.status(500).json({ error: 'Failed to get QA pairs' });
  }
});

// Get QA pair by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const qaPair = await prisma.qAPair.findUnique({
      where: { id },
    });

    if (!qaPair) {
      return res.status(404).json({ error: 'QA pair not found' });
    }

    return res.status(200).json(qaPair);
  } catch (error) {
    console.error('Error getting QA pair:', error);
    return res.status(500).json({ error: 'Failed to get QA pair' });
  }
});

// Create new QA pair
router.post('/', async (req, res) => {
  try {
    const { question, answer, category, language, tags, priority, isActive } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const newQAPair = await prisma.qAPair.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category || 'general',
        language: language || 'en',
        tags: tags || [],
        priority: priority || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return res.status(201).json(newQAPair);
  } catch (error) {
    console.error('Error creating QA pair:', error);
    return res.status(500).json({ error: 'Failed to create QA pair' });
  }
});

// Update QA pair
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, language, tags, priority, isActive } = req.body;

    const existingQAPair = await prisma.qAPair.findUnique({ where: { id } });
    if (!existingQAPair) {
      return res.status(404).json({ error: 'QA pair not found' });
    }

    const updatedQAPair = await prisma.qAPair.update({
      where: { id },
      data: {
        ...(question && { question: question.trim() }),
        ...(answer && { answer: answer.trim() }),
        ...(category && { category }),
        ...(language && { language }),
        ...(tags && { tags }),
        ...(priority !== undefined && { priority }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.status(200).json(updatedQAPair);
  } catch (error) {
    console.error('Error updating QA pair:', error);
    return res.status(500).json({ error: 'Failed to update QA pair' });
  }
});

// Delete QA pair
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingQAPair = await prisma.qAPair.findUnique({ where: { id } });
    if (!existingQAPair) {
      return res.status(404).json({ error: 'QA pair not found' });
    }

    await prisma.qAPair.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting QA pair:', error);
    return res.status(500).json({ error: 'Failed to delete QA pair' });
  }
});

// Get categories and statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      total,
      active,
      categories,
      languages
    ] = await Promise.all([
      prisma.qAPair.count(),
      prisma.qAPair.count({ where: { isActive: true } }),
      prisma.qAPair.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      }),
      prisma.qAPair.groupBy({
        by: ['language'],
        _count: { language: true },
        orderBy: { _count: { language: 'desc' } }
      })
    ]);

    return res.status(200).json({
      total,
      active,
      inactive: total - active,
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.category
      })),
      languages: languages.map(l => ({
        name: l.language,
        count: l._count.language
      }))
    });
  } catch (error) {
    console.error('Error getting QA stats:', error);
    return res.status(500).json({ error: 'Failed to get QA statistics' });
  }
});

// Search QA pairs for AI responses
router.get('/search/ai', async (req, res) => {
  try {
    const { query, language = 'en', limit = '5' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const qaPairs = await prisma.qAPair.findMany({
      where: {
        isActive: true,
        OR: [
          { language: language as string },
          { language: 'both' }
        ],
        AND: {
          OR: [
            { question: { contains: query as string, mode: 'insensitive' } },
            { tags: { has: query as string } },
            { answer: { contains: query as string, mode: 'insensitive' } }
          ]
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    return res.status(200).json(qaPairs);
  } catch (error) {
    console.error('Error searching QA pairs for AI:', error);
    return res.status(500).json({ error: 'Failed to search QA pairs' });
  }
});

export default router;
