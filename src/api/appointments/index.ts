import express from 'express';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting appointments:', error);
    return res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(`Error getting appointment with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to get appointment' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledAt,
      location,
      type,
      status = 'SCHEDULED',
      clientId
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!scheduledAt) {
      return res.status(400).json({ error: 'Scheduled date/time is required' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        location,
        type,
        status,
        clientId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      scheduledAt,
      location,
      type,
      status,
      clientId
    } = req.body;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // If clientId is being updated, check if new client exists
    if (clientId && clientId !== existingAppointment.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(status && { status }),
        ...(clientId && { clientId })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(`Error updating appointment with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting appointment with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update status
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error(`Error updating appointment status with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

export default router;
