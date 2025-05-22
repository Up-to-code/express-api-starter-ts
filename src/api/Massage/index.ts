import express from 'express';
import { prisma } from '../../lib/prisma';
const router = express.Router();
// clint id get massages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      // Fixed variable name from 'claim' to 'client'
      where: { id },
      include: {
        messages: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    return res.status(500).json({ error: 'Failed to get client' });
  }
});

export default router;
