import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all clients - simple endpoint for dropdowns and selections
router.get('/', async (req, res) => {
  try {
    const { simple } = req.query;

    if (simple === 'true') {
      // Simple endpoint for dropdowns - returns just essential client data
      const { search, limit = '50' } = req.query;
      const takeLimit = Math.min(parseInt(limit as string), 100); // Max 100 for performance

      let whereClause = {};

      // Add search functionality for large datasets
      if (search && typeof search === 'string') {
        whereClause = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      const clients = await prisma.client.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
        orderBy: [
          { name: 'asc' }
        ],
        take: takeLimit
      });

      console.log(`Fetched ${clients.length} clients for simple endpoint${search ? ` with search: "${search}"` : ''}`);
      return res.status(200).json(clients);
    }

    // Full paginated endpoint for client management
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const clients = await prisma.client.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.client.count();
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.status(200).json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    return res.status(500).json({ error: 'Failed to get clients' });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ // Fixed variable name from 'claim' to 'client'
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

// GEt  client massages
router.get('/:id/messages', async (req, res) => {
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


// Create new client
router.post('/', async (req, res) => {
  try {
    const newClient = await prisma.client.create({
      data: req.body,
    });
    return res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await prisma.client.update({
      where: { id },
      data: req.body,
    });
    return res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id },
    });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;