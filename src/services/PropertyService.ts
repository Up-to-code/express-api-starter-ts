import { PrismaClient, Property, PropertyType, PropertyStatus } from '@prisma/client';
import { logWithTimestamp } from '../utils/logger';

/**
 * Property Service for managing real estate properties
 * Follows SOLID principles with clean separation of concerns
 */

export interface PropertyCreateInput {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency?: string;
  type: PropertyType;
  status?: PropertyStatus;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location: string;
  locationAr?: string;
  address: string;
  addressAr?: string;
  city: string;
  cityAr?: string;
  country?: string;
  countryAr?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  features?: string[];
  featuresAr?: string[];
  amenities?: string[];
  amenitiesAr?: string[];
  yearBuilt?: number;
  parking?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  utilities?: string;
  utilitiesAr?: string;
  contactInfo?: string;
  agentId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PropertyUpdateInput extends Partial<PropertyCreateInput> {
  id: string;
}

export interface PropertyFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  agentId?: string;
  search?: string;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PropertyService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new property
   */
  async createProperty(data: PropertyCreateInput): Promise<Property> {
    try {
      logWithTimestamp(`Creating new property: ${data.title}`, 'info');

      // Validate price range
      if (data.price && (data.price < 0 || data.price > 100000000000)) {
        throw new Error('Price must be between 0 and 100 billion');
      }

      const property = await this.prisma.property.create({
        data: {
          ...data,
          currency: data.currency || 'USD',
          country: data.country || 'UAE',
          status: data.status || PropertyStatus.AVAILABLE,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFeatured: data.isFeatured || false,
          images: data.images || [],
          features: data.features || [],
          featuresAr: data.featuresAr || [],
          amenities: data.amenities || [],
          amenitiesAr: data.amenitiesAr || [],
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logWithTimestamp(`Property created successfully: ${property.id}`, 'info');
      return property;
    } catch (error: any) {
      logWithTimestamp(`Error creating property: ${error.message}`, 'error');
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          appointments: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (property) {
        // Increment view count
        await this.prisma.property.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      }

      return property;
    } catch (error: any) {
      logWithTimestamp(`Error fetching property ${id}: ${error.message}`, 'error');
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  /**
   * Update property
   */
  async updateProperty(data: PropertyUpdateInput): Promise<Property> {
    try {
      const { id, ...updateData } = data;

      logWithTimestamp(`Updating property: ${id}`, 'info');

      // Validate price range if price is being updated
      if (updateData.price && (updateData.price < 0 || updateData.price > 100000000000)) {
        throw new Error('Price must be between 0 and 100 billion');
      }

      const property = await this.prisma.property.update({
        where: { id },
        data: updateData,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logWithTimestamp(`Property updated successfully: ${id}`, 'info');
      return property;
    } catch (error: any) {
      logWithTimestamp(`Error updating property ${data.id}: ${error.message}`, 'error');
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<void> {
    try {
      logWithTimestamp(`Deleting property: ${id}`, 'info');

      await this.prisma.property.delete({
        where: { id },
      });

      logWithTimestamp(`Property deleted successfully: ${id}`, 'info');
    } catch (error: any) {
      logWithTimestamp(`Error deleting property ${id}: ${error.message}`, 'error');
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  /**
   * Get properties with filters and pagination
   */
  async getProperties(
    filters: PropertyFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PropertyListResponse> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
      }
      if (filters.minBedrooms !== undefined) where.bedrooms = { gte: filters.minBedrooms };
      if (filters.maxBedrooms !== undefined) where.bedrooms = { ...where.bedrooms, lte: filters.maxBedrooms };
      if (filters.minBathrooms !== undefined) where.bathrooms = { gte: filters.minBathrooms };
      if (filters.maxBathrooms !== undefined) where.bathrooms = { ...where.bathrooms, lte: filters.maxBathrooms };
      if (filters.minArea !== undefined || filters.maxArea !== undefined) {
        where.area = {};
        if (filters.minArea !== undefined) where.area.gte = filters.minArea;
        if (filters.maxArea !== undefined) where.area.lte = filters.maxArea;
      }
      if (filters.furnished !== undefined) where.furnished = filters.furnished;
      if (filters.petFriendly !== undefined) where.petFriendly = filters.petFriendly;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
      if (filters.agentId) where.agentId = filters.agentId;

      // Search functionality
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { titleAr: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { descriptionAr: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
          { locationAr: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } },
          { addressAr: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.property.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        properties,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      logWithTimestamp(`Error fetching properties: ${error.message}`, 'error');
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    try {
      return await this.prisma.property.findMany({
        where: {
          isFeatured: true,
          isActive: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error: any) {
      logWithTimestamp(`Error fetching featured properties: ${error.message}`, 'error');
      throw new Error(`Failed to fetch featured properties: ${error.message}`);
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<{
    total: number;
    available: number;
    sold: number;
    rented: number;
    featured: number;
    byType: Record<PropertyType, number>;
  }> {
    try {
      const [total, available, sold, rented, featured, byType] = await Promise.all([
        this.prisma.property.count({ where: { isActive: true } }),
        this.prisma.property.count({ where: { status: PropertyStatus.AVAILABLE, isActive: true } }),
        this.prisma.property.count({ where: { status: PropertyStatus.SOLD, isActive: true } }),
        this.prisma.property.count({ where: { status: PropertyStatus.RENTED, isActive: true } }),
        this.prisma.property.count({ where: { isFeatured: true, isActive: true } }),
        this.prisma.property.groupBy({
          by: ['type'],
          where: { isActive: true },
          _count: { type: true },
        }),
      ]);

      const typeStats: Record<PropertyType, number> = {} as Record<PropertyType, number>;
      Object.values(PropertyType).forEach(type => {
        typeStats[type] = 0;
      });

      byType.forEach(item => {
        typeStats[item.type] = item._count.type;
      });

      return {
        total,
        available,
        sold,
        rented,
        featured,
        byType: typeStats,
      };
    } catch (error: any) {
      logWithTimestamp(`Error fetching property stats: ${error.message}`, 'error');
      throw new Error(`Failed to fetch property stats: ${error.message}`);
    }
  }
}

export default PropertyService;
