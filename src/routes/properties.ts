import express, { Request, Response } from 'express';
import { PrismaClient, PropertyType, PropertyStatus } from '@prisma/client';
import PropertyService, { PropertyCreateInput, PropertyUpdateInput, PropertyFilters } from '../services/PropertyService';
import { logWithTimestamp } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();
const propertyService = new PropertyService(prisma);

/**
 * GET /api/properties
 * Get all properties with optional filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      type,
      status,
      city,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minArea,
      maxArea,
      furnished,
      petFriendly,
      isActive,
      isFeatured,
      agentId,
      search,
    } = req.query;

    const filters: PropertyFilters = {};
    
    if (type) filters.type = type as PropertyType;
    if (status) filters.status = status as PropertyStatus;
    if (city) filters.city = city as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minBedrooms) filters.minBedrooms = parseInt(minBedrooms as string);
    if (maxBedrooms) filters.maxBedrooms = parseInt(maxBedrooms as string);
    if (minBathrooms) filters.minBathrooms = parseInt(minBathrooms as string);
    if (maxBathrooms) filters.maxBathrooms = parseInt(maxBathrooms as string);
    if (minArea) filters.minArea = parseFloat(minArea as string);
    if (maxArea) filters.maxArea = parseFloat(maxArea as string);
    if (furnished) filters.furnished = furnished === 'true';
    if (petFriendly) filters.petFriendly = petFriendly === 'true';
    if (isActive) filters.isActive = isActive === 'true';
    if (isFeatured) filters.isFeatured = isFeatured === 'true';
    if (agentId) filters.agentId = agentId as string;
    if (search) filters.search = search as string;

    const result = await propertyService.getProperties(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching properties: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message,
    });
  }
});

/**
 * GET /api/properties/featured
 * Get featured properties
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const { limit = '6' } = req.query;
    
    const properties = await propertyService.getFeaturedProperties(parseInt(limit as string));

    res.json({
      success: true,
      data: properties,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching featured properties: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured properties',
      message: error.message,
    });
  }
});

/**
 * GET /api/properties/stats
 * Get property statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await propertyService.getPropertyStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching property stats: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property stats',
      message: error.message,
    });
  }
});

/**
 * GET /api/properties/:id
 * Get property by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const property = await propertyService.getPropertyById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching property: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message,
    });
  }
});

/**
 * POST /api/properties
 * Create a new property
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const propertyData: PropertyCreateInput = req.body;

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.price || 
        !propertyData.type || !propertyData.location || !propertyData.address || !propertyData.city) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'description', 'price', 'type', 'location', 'address', 'city'],
      });
    }

    const property = await propertyService.createProperty(propertyData);

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully',
    });
  } catch (error: any) {
    logWithTimestamp(`Error creating property: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to create property',
      message: error.message,
    });
  }
});

/**
 * PUT /api/properties/:id
 * Update property
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: PropertyUpdateInput = { ...req.body, id };

    const property = await propertyService.updateProperty(updateData);

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully',
    });
  } catch (error: any) {
    logWithTimestamp(`Error updating property: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to update property',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/properties/:id
 * Delete property
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await propertyService.deleteProperty(id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    logWithTimestamp(`Error deleting property: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to delete property',
      message: error.message,
    });
  }
});

/**
 * GET /api/properties/types/list
 * Get available property types
 */
router.get('/types/list', async (req: Request, res: Response) => {
  try {
    const types = Object.values(PropertyType);
    
    res.json({
      success: true,
      data: types,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching property types: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property types',
      message: error.message,
    });
  }
});

/**
 * GET /api/properties/statuses/list
 * Get available property statuses
 */
router.get('/statuses/list', async (req: Request, res: Response) => {
  try {
    const statuses = Object.values(PropertyStatus);
    
    res.json({
      success: true,
      data: statuses,
    });
  } catch (error: any) {
    logWithTimestamp(`Error fetching property statuses: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property statuses',
      message: error.message,
    });
  }
});

export default router;
