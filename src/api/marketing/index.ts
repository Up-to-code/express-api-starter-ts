/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { sendWhatsAppTemplate } from '../../services/sendWhatsAppTemplate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Send template to a specific client by ID
router.post('/send/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { templateName } = req.body;

    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const result = await sendWhatsAppTemplate(client.phone, templateName);

    await prisma.client.update({
      where: { id: clientId },
      data: {
        lastActive: new Date(),
        lastMessage: `Template: ${templateName}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Template ${templateName} sent to ${client.name}`,
    });
  } catch (error) {
    console.error('Error sending template:', error);
    return res.status(500).json({ error: 'Failed to send template' });
  }
});

// Send template to all clients based on type (client or broker)
router.post('/send_all', async (req, res) => {
  try {
    const { templateName, clientType, languageCode } = req.body;

    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!clientType || !['Client', 'Broker'].includes(clientType)) {
      return res.status(400).json({ error: 'Valid client type is required (Client or Broker)' });
    }

    const clients = await prisma.client.findMany({
      where: { type: clientType },
    });

    if (clients.length === 0) {
      return res.status(404).json({ error: `No clients found with type: ${clientType}` });
    }

    const results = [];

    for (const client of clients) {
      try {

        await sendWhatsAppTemplate(client.phone, templateName, languageCode);

        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastActive: new Date(),
            lastMessage: `Template: ${templateName}`,
          },
        });

        results.push({
          clientId: client.id,
          name: client.name,
          status: 'success',
        });
      } catch (error : any) {
        results.push({
          clientId: client.id,
          name: client.name,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Template ${templateName} broadcast to ${clientType}s`,
      sentCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    console.error('Error broadcasting template:', error);
    return res.status(500).json({ error: 'Failed to broadcast template' });
  }
});

// send  bay type of clients
router.post('/send_bay', async (req, res) => {
  try {
    const { templateName, bayType } = req.body;

    if (!templateName) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!bayType) {
      return res.status(400).json({ error: 'Bay type is required' });
    }

    const clients = await prisma.client.findMany({
      where: { type: bayType },
    });

    if (clients.length === 0) {
      return res.status(404).json({ error: `No clients found with type: ${bayType}` });
    }

    const results = [];

    for (const client of clients) {
      try {

        await sendWhatsAppTemplate(client.phone, templateName);

        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastActive: new Date(),
            lastMessage: `Template: ${templateName}`,
          },
        });

        results.push({
          clientId: client.id,
          name: client.name,
          status: 'success',
        });
      } catch (error : any) {
        results.push({
          clientId: client.id,
          name: client.name,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Template ${templateName} broadcast to ${bayType}s`,
      sentCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    console.error('Error broadcasting template:', error);
    return res.status(500).json({ error: 'Failed to broadcast template' });
  }
});




// Get WhatsApp templates for campaign creation
router.get('/templates', async (req, res) => {
  try {
    const { language } = req.query;
    console.log(`Fetching templates for language: ${language || 'all'}`);

    let whereClause = {};

    // Only filter by language if explicitly specified (not 'all' and not undefined)
    if (language && language !== 'all') {
      const validLanguage = (language === 'ar' || language === 'en') ? language : 'en';
      whereClause = { language: validLanguage as string };
      console.log(`Filtering by language: ${validLanguage}`);
    } else {
      console.log('Fetching templates from ALL languages');
    }

    // Check if we have templates in the database
    const dbTemplates = await prisma.template.findMany({
      where: whereClause,
      orderBy: [
        { language: 'asc' }, // Sort by language first (ar comes before en)
        { createdAt: 'desc' }
      ]
    });

    console.log(`Found ${dbTemplates.length} templates in database`);

    // If we have templates in the database, return those
    if (dbTemplates.length > 0) {
      return res.status(200).json(dbTemplates);
    }

    // Otherwise, return mock templates
    const mockTemplatesEn = [
      {
        id: 'hello_world_en',
        name: 'Hello World',
        content: 'Hello, {{1}}! Welcome to our service.',
        category: 'greeting',
        variables: ['name'],
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'appointment_reminder_en',
        name: 'Appointment Reminder',
        content: 'Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}.',
        category: 'reminder',
        variables: ['name', 'date', 'time'],
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'payment_confirmation_en',
        name: 'Payment Confirmation',
        content: 'Thank you, {{1}}! Your payment of {{2}} has been received.',
        category: 'payment',
        variables: ['name', 'amount'],
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const mockTemplatesAr = [
      {
        id: 'hello_world_ar',
        name: 'مرحبا بالعالم',
        content: 'مرحبًا، {{1}}! مرحبًا بك في خدمتنا.',
        category: 'greeting',
        variables: ['name'],
        language: 'ar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'appointment_reminder_ar',
        name: 'تذكير بالموعد',
        content: 'مرحبًا {{1}}، هذا تذكير بموعدك في {{2}} الساعة {{3}}.',
        category: 'reminder',
        variables: ['name', 'date', 'time'],
        language: 'ar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'payment_confirmation_ar',
        name: 'تأكيد الدفع',
        content: 'شكرًا لك، {{1}}! تم استلام دفعتك بقيمة {{2}}.',
        category: 'payment',
        variables: ['name', 'amount'],
        language: 'ar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Return appropriate mock templates based on language filter
    if (!language || language === 'all') {
      // Return all templates when no language specified or 'all' requested
      console.log('Returning all mock templates (Arabic + English)');
      return res.status(200).json([...mockTemplatesAr, ...mockTemplatesEn]); // Arabic first
    } else if (language === 'ar') {
      console.log('Returning Arabic mock templates only');
      return res.status(200).json(mockTemplatesAr);
    } else {
      console.log('Returning English mock templates only');
      return res.status(200).json(mockTemplatesEn);
    }
  } catch (error) {
    console.error('Error getting templates:', error);
    return res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find the template in the database
    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.status(200).json(template);
  } catch (error) {
    console.error(`Error getting template with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to get template' });
  }
});

// Create new template
router.post('/templates', async (req, res) => {
  try {
    console.log('Creating template with data:', req.body);
    const { name, content, category, variables, language = 'en' } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Template content is required' });
    }

    // Validate variables is an array
    if (variables !== undefined && !Array.isArray(variables)) {
      return res.status(400).json({ error: 'Variables must be an array' });
    }

    // Validate language code
    if (language !== 'en' && language !== 'ar') {
      return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
    }

    // Check if a template with the same name and language already exists
    // Trim the name to handle whitespace issues
    const trimmedName = name.trim();

    console.log(`Checking if template with name "${trimmedName}" and language "${language}" already exists`);

    const existingTemplate = await prisma.template.findFirst({
      where: {
        name: trimmedName,
        language
      }
    });

    if (existingTemplate) {
      console.log(`Template already exists: ${JSON.stringify(existingTemplate)}`);

      // Generate better suggestions
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const suggestions = [
        `${trimmedName}_${date}`,
        `${trimmedName}_v2`,
        `${trimmedName}_new`,
        `${trimmedName}_updated`,
        `${trimmedName}_${language}_v2`
      ];

      return res.status(409).json({
        error: language === 'ar'
          ? `يوجد قالب بالاسم "${trimmedName}" بالفعل للغة العربية`
          : `A template with the name "${trimmedName}" already exists for language "${language}"`,
        code: 'TEMPLATE_NAME_EXISTS',
        suggestions: suggestions,
        existingTemplate: {
          id: existingTemplate.id,
          name: existingTemplate.name,
          createdAt: existingTemplate.createdAt
        }
      });
    }

    // Create the template
    const newTemplate = await prisma.template.create({
      data: {
        name: trimmedName, // Use the trimmed name
        content,
        category: category || 'custom',
        variables: Array.isArray(variables) ? variables : [],
        language
      }
    });

    console.log('Template created successfully:', newTemplate);
    return res.status(201).json(newTemplate);
  } catch (error: any) {
    console.error('Error creating template:', error);

    // Provide more detailed error information
    let errorMessage = 'Failed to create template';

    if (error.code === 'P2002') {
      errorMessage = 'A template with this name and language already exists';
    } else if (error.message) {
      errorMessage = `Failed to create template: ${error.message}`;
    }

    return res.status(500).json({ error: errorMessage });
  }
});

// Update template
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, category, variables, language } = req.body;

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Validate language code if provided
    if (language !== undefined && language !== 'en' && language !== 'ar') {
      return res.status(400).json({ error: 'Language must be either "en" or "ar"' });
    }

    // If name or language is changing, check for duplicates
    if ((name !== undefined && name !== existingTemplate.name) ||
        (language !== undefined && language !== existingTemplate.language)) {

      const duplicateTemplate = await prisma.template.findFirst({
        where: {
          name: name || existingTemplate.name,
          language: language || existingTemplate.language,
          id: { not: id }
        }
      });

      if (duplicateTemplate) {
        return res.status(400).json({
          error: `A template with the name "${name || existingTemplate.name}" already exists for language "${language || existingTemplate.language}"`
        });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (variables !== undefined) updateData.variables = variables;
    if (language !== undefined) updateData.language = language;

    // Update the template
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error(`Error updating template with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Received delete request for template ID: ${id}`);

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      console.log(`Template with ID ${id} not found`);
      return res.status(404).json({ error: 'Template not found' });
    }

    console.log(`Found template to delete: ${JSON.stringify(existingTemplate)}`);

    // Delete the template
    await prisma.template.delete({
      where: { id }
    });

    console.log(`Template with ID ${id} deleted successfully`);
    return res.status(204).send();
  } catch (error: any) {
    console.error(`Error deleting template with ID ${req.params.id}:`, error);

    // Provide more detailed error information
    let errorMessage = 'Failed to delete template';

    if (error.code) {
      errorMessage = `Database error (${error.code}): ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
});

// Get client types for campaign audience selection
router.get('/client-types', async (_req, res) => {
  try {
    // Get distinct client types from the database
    const clients = await prisma.client.findMany({
      select: {
        type: true,
      },
      distinct: ['type'],
    });

    // Extract the types and count clients for each type
    const clientTypes = [];

    for (const client of clients) {
      const count = await prisma.client.count({
        where: {
          type: client.type,
        },
      });

      clientTypes.push({
        id: client.type,
        name: client.type,
        count,
      });
    }

    return res.status(200).json(clientTypes);
  } catch (error) {
    console.error('Error getting client types:', error);
    return res.status(500).json({ error: 'Failed to get client types' });
  }
});

// Get all campaigns
router.get('/campaigns', async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            phone: true,
            type: true
          }
        }
      }
    });
    return res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Get campaign by ID
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            phone: true,
            type: true
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    console.error(`Error getting campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to get campaign' });
  }
});

// Create new campaign
router.post('/campaigns', async (req, res) => {
  try {
    const {
      name,
      type,
      status = 'Draft',
      message,
      clientTypes = [],
      content,
      scheduledAt
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }

    // Find clients based on client types
    const clients = clientTypes.length > 0
      ? await prisma.client.findMany({
          where: {
            type: {
              in: clientTypes
            }
          }
        })
      : [];

    // Create the campaign
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        type: type || 'Template',
        status,
        audience: clientTypes.join(','),
        message: content || message,
        clients: {
          connect: clients.map(client => ({ id: client.id }))
        },
        ...(scheduledAt && { lastSentAt: new Date(scheduledAt) })
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            phone: true,
            type: true
          }
        }
      }
    });

    return res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      status,
      message,
      clientTypes,
      content,
      scheduledAt
    } = req.body;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (message !== undefined) updateData.message = message;
    if (content !== undefined) updateData.message = content;
    if (scheduledAt !== undefined) updateData.lastSentAt = new Date(scheduledAt);

    // Update client connections if clientTypes is provided
    let clientsToConnect: { id: string }[] = [];
    if (clientTypes && Array.isArray(clientTypes)) {
      updateData.audience = clientTypes.join(',');

      // Find clients based on client types
      clientsToConnect = await prisma.client.findMany({
        where: {
          type: {
            in: clientTypes
          }
        },
        select: {
          id: true
        }
      });
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...updateData,
        ...(clientsToConnect.length > 0 && {
          clients: {
            set: [], // First disconnect all clients
            connect: clientsToConnect // Then connect the new ones
          }
        })
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            phone: true,
            type: true
          }
        }
      }
    });

    return res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error(`Error updating campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Update campaign status
router.put('/campaigns/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update the campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        status,
        ...(status === 'Active' && { lastSentAt: new Date() })
      }
    });

    return res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error(`Error updating status for campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update campaign status' });
  }
});

// Delete campaign
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error(`Error deleting campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Execute campaign - send messages to all clients in the campaign
router.post('/campaigns/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { templateName } = req.body;

    // Check if campaign exists and include clients
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        clients: true
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.clients.length === 0) {
      return res.status(400).json({ error: 'Campaign has no clients' });
    }

    // Use either the provided template name or the campaign message
    const messageToSend = templateName || campaign.message;

    if (!messageToSend) {
      return res.status(400).json({ error: 'No message content or template specified' });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send message to each client
    for (const client of campaign.clients) {
      try {
        if (templateName) {
          // If a template name is provided, use the template sending function
          await sendWhatsAppTemplate(client.phone, templateName);
        } else {
          // Otherwise, send the campaign message directly
          // You would need to implement or import a direct message sending function
          // For now, we'll just use the template function as a placeholder
          await sendWhatsAppTemplate(client.phone, 'custom_message', undefined, {
            body: {
              message: campaign.message
            }
          });
        }

        // Update client's last message and activity
        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastActive: new Date(),
            lastMessage: templateName
              ? `Template: ${templateName}`
              : `Campaign: ${campaign.name}`
          }
        });

        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          status: 'success'
        });

        successCount++;
      } catch (err: any) {
        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          status: 'failed',
          error: err.message
        });

        failureCount++;
      }
    }

    // Update campaign stats
    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'Active',
        lastSentAt: new Date(),
        sentCount: {
          increment: successCount
        }
      }
    });

    return res.status(200).json({
      success: true,
      campaignId: id,
      campaignName: campaign.name,
      sentCount: successCount,
      failedCount: failureCount,
      totalClients: campaign.clients.length,
      results
    });
  } catch (error) {
    console.error(`Error executing campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to execute campaign' });
  }
});

// Send campaign to a specific client type without modifying the campaign
router.post('/campaigns/:id/send-to-type', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientType, templateName } = req.body;

    // Validate input
    if (!clientType) {
      return res.status(400).json({ error: 'Client type must be specified' });
    }

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Use either the provided template name or the campaign message
    const messageToSend = templateName || campaign.message;

    if (!messageToSend) {
      return res.status(400).json({ error: 'No message content or template specified' });
    }

    // Find clients of the specified type
    const clients = await prisma.client.findMany({
      where: {
        type: clientType
      }
    });

    if (clients.length === 0) {
      return res.status(400).json({ error: `No clients found with type: ${clientType}` });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send message to each client
    for (const client of clients) {
      try {
        if (templateName) {
          // If a template name is provided, use the template sending function
          await sendWhatsAppTemplate(client.phone, templateName);
        } else {
          // Otherwise, send the campaign message directly
          await sendWhatsAppTemplate(client.phone, 'custom_message', undefined, {
            body: {
              message: campaign.message
            }
          });
        }

        // Update client's last message and activity
        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastActive: new Date(),
            lastMessage: templateName
              ? `Template: ${templateName}`
              : `Campaign: ${campaign.name}`
          }
        });

        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          type: client.type,
          status: 'success'
        });

        successCount++;
      } catch (err: any) {
        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          type: client.type,
          status: 'failed',
          error: err.message
        });

        failureCount++;
      }
    }

    // Update campaign stats
    await prisma.campaign.update({
      where: { id },
      data: {
        sentCount: {
          increment: successCount
        }
      }
    });

    return res.status(200).json({
      success: true,
      campaignId: id,
      campaignName: campaign.name,
      clientType,
      sentCount: successCount,
      failedCount: failureCount,
      totalClients: clients.length,
      results
    });
  } catch (error) {
    console.error(`Error sending campaign with ID ${req.params.id} to client type:`, error);
    return res.status(500).json({ error: 'Failed to send campaign to client type' });
  }
});

// Activate campaign and send to specific client types
router.post('/campaigns/:id/activate-and-send', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientTypes, templateName } = req.body;

    // Validate input
    if (!clientTypes || !Array.isArray(clientTypes) || clientTypes.length === 0) {
      return res.status(400).json({ error: 'At least one client type must be specified' });
    }

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Use either the provided template name or the campaign message
    const messageToSend = templateName || campaign.message;

    if (!messageToSend) {
      return res.status(400).json({ error: 'No message content or template specified' });
    }

    // Find clients of the specified types
    const clients = await prisma.client.findMany({
      where: {
        type: {
          in: clientTypes
        }
      }
    });

    if (clients.length === 0) {
      return res.status(400).json({ error: `No clients found with the specified types: ${clientTypes.join(', ')}` });
    }

    // Update campaign to connect with these clients
    await prisma.campaign.update({
      where: { id },
      data: {
        clients: {
          connect: clients.map(client => ({ id: client.id }))
        },
        audience: clientTypes.join(','),
        status: 'Active'
      }
    });

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send message to each client
    for (const client of clients) {
      try {
        if (templateName) {
          // If a template name is provided, use the template sending function
          await sendWhatsAppTemplate(client.phone, templateName);
        } else {
          // Otherwise, send the campaign message directly
          await sendWhatsAppTemplate(client.phone, 'custom_message', undefined, {
            body: {
              message: campaign.message
            }
          });
        }

        // Update client's last message and activity
        await prisma.client.update({
          where: { id: client.id },
          data: {
            lastActive: new Date(),
            lastMessage: templateName
              ? `Template: ${templateName}`
              : `Campaign: ${campaign.name}`
          }
        });

        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          type: client.type,
          status: 'success'
        });

        successCount++;
      } catch (err: any) {
        results.push({
          clientId: client.id,
          name: client.name,
          phone: client.phone,
          type: client.type,
          status: 'failed',
          error: err.message
        });

        failureCount++;
      }
    }

    // Update campaign stats
    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'Active',
        lastSentAt: new Date(),
        sentCount: {
          increment: successCount
        }
      }
    });

    return res.status(200).json({
      success: true,
      campaignId: id,
      campaignName: campaign.name,
      clientTypes,
      sentCount: successCount,
      failedCount: failureCount,
      totalClients: clients.length,
      results
    });
  } catch (error) {
    console.error(`Error activating and sending campaign with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to activate and send campaign' });
  }
});

export default router;