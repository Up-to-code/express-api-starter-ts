import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all clients with pagination
router.get('/', async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1; // Default to first page
    const limit = parseInt(req.query.limit as string) || 50; // Default to 50 clients per page
    const skip = (page - 1) * limit; // Fixed the syntax error here
    
    // Query to get paginated clients
    const clients = await prisma.client.findMany({
      skip,
      take: limit,
    });
    
    // Get total count for pagination metadata
    const total = await prisma.client.count();
    
    // Calculate pagination metadata
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