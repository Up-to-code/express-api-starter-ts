import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all QA pairs
router.get('/', async (req, res) => {
  try {
    const qaPairs = await prisma.qAPair.findMany({
      orderBy: {
        category: 'asc',
      },
    });
    
    return res.status(200).json(qaPairs);
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
    const newQAPair = await prisma.qAPair.create({
      data: req.body,
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
    const updatedQAPair = await prisma.qAPair.update({
      where: { id },
      data: req.body,
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
    await prisma.qAPair.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting QA pair:', error);
    return res.status(500).json({ error: 'Failed to delete QA pair' });
  }
});

export default router;
