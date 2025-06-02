/**
 * إتجاه العقارية (Etjahh Real Estate) - Property Search Service
 * خدمة البحث العقاري لشركة إتجاه العقارية
 */

import { PrismaClient } from '@prisma/client';
import { logWithTimestamp } from '../../../utils/logger';
import {
  PropertySearchCriteria,
  PropertySearchResult,
  PropertyWithScore,
  SEARCH_KEYWORDS_AR,
  SEARCH_KEYWORDS_EN,
  SAUDI_CITIES
} from '../types/AITypes';

/**
 * Property Search Service Class
 * فئة خدمة البحث العقاري
 */
export class PropertySearchService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Extract property search criteria from user message
   * استخراج معايير البحث العقاري من رسالة المستخدم
   */
  extractSearchCriteria(userMessage: string, language: string): PropertySearchCriteria | null {
    const message = userMessage.toLowerCase();

    // Check for search intent
    const searchKeywords = language === 'ar' ? SEARCH_KEYWORDS_AR : SEARCH_KEYWORDS_EN;
    const hasSearchIntent = searchKeywords.some(keyword => message.includes(keyword.toLowerCase()));

    if (!hasSearchIntent) return null;

    const criteria: PropertySearchCriteria['criteria'] = {};

    // Extract city
    criteria.city = this.extractCity(message);

    // Extract bedrooms
    criteria.bedrooms = this.extractBedrooms(message);

    // Extract bathrooms
    criteria.bathrooms = this.extractBathrooms(message);

    // Extract area
    criteria.area = this.extractArea(message);

    // Extract property type
    criteria.property_type = this.extractPropertyType(message);

    // Extract features
    criteria.features = this.extractFeatures(message);

    // Extract price range
    criteria.price_range = this.extractPriceRange(message);

    // Extract furnished status
    criteria.furnished = this.extractFurnishedStatus(message);

    // Extract parking requirement
    criteria.parking = this.extractParkingRequirement(message);

    return {
      type: 'property_search',
      criteria,
      action: 'search_properties'
    };
  }

  /**
   * Enhanced property search with scoring
   * البحث العقاري المحسن مع التقييم
   */
  async searchProperties(criteria: PropertySearchCriteria['criteria']): Promise<PropertySearchResult> {
    const startTime = Date.now();

    try {
      logWithTimestamp(`Starting enhanced property search with criteria: ${JSON.stringify(criteria)}`, 'info');

      // Try direct search first
      let properties = await this.performDirectSearch(criteria);
      let searchStrategy: PropertySearchResult['searchStrategy'] = 'direct_match';

      // If no results, try broader search
      if (properties.length === 0) {
        properties = await this.performBroaderSearch(criteria);
        searchStrategy = 'fallback_search';
      }

      // Score and rank properties
      const scoredProperties = this.scoreProperties(properties, criteria);
      searchStrategy = scoredProperties.length > 0 ? 'scored_ranking' : searchStrategy;

      // Update view counts
      if (scoredProperties.length > 0) {
        await this.updateViewCounts(scoredProperties.map(p => p.id));
      }

      const processingTime = Date.now() - startTime;

      logWithTimestamp(
        `Enhanced search completed: ${scoredProperties.length} properties found in ${processingTime}ms`,
        'info'
      );

      return {
        properties: scoredProperties.slice(0, 3), // Limit to top 3
        total: scoredProperties.length,
        searchCriteria: criteria,
        searchStrategy,
        processingTime
      };
    } catch (error: any) {
      logWithTimestamp(`Enhanced property search error: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Perform direct search with exact criteria
   * تنفيذ البحث المباشر بمعايير دقيقة
   */
  private async performDirectSearch(criteria: PropertySearchCriteria['criteria']): Promise<any[]> {
    const where: any = {
      isActive: true,
      status: 'AVAILABLE',
    };

    // City search
    if (criteria.city) {
      where.OR = [
        { city: { contains: criteria.city, mode: 'insensitive' } },
        { cityAr: { contains: criteria.city, mode: 'insensitive' } },
        { location: { contains: criteria.city, mode: 'insensitive' } },
        { locationAr: { contains: criteria.city, mode: 'insensitive' } }
      ];
    }

    // Bedrooms
    if (criteria.bedrooms) {
      where.bedrooms = criteria.bedrooms;
    }

    // Bathrooms
    if (criteria.bathrooms) {
      where.bathrooms = criteria.bathrooms;
    }

    // Area with tolerance
    if (criteria.area) {
      const tolerance = 0.2; // 20% tolerance
      where.area = {
        gte: criteria.area * (1 - tolerance),
        lte: criteria.area * (1 + tolerance)
      };
    }

    // Property type
    if (criteria.property_type) {
      where.type = criteria.property_type;
    }

    // Price range
    if (criteria.price_range) {
      where.price = {
        gte: criteria.price_range.min,
        lte: criteria.price_range.max
      };
    }

    // Furnished
    if (criteria.furnished !== undefined) {
      where.furnished = criteria.furnished;
    }

    // Parking
    if (criteria.parking) {
      where.parking = { gt: 0 };
    }

    return await this.prisma.property.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });
  }

  /**
   * Perform broader search with relaxed criteria
   * تنفيذ البحث الأوسع بمعايير مرنة
   */
  private async performBroaderSearch(criteria: PropertySearchCriteria['criteria']): Promise<any[]> {
    const where: any = {
      isActive: true,
      status: 'AVAILABLE',
    };

    // Only use city and property type for broader search
    if (criteria.city) {
      where.OR = [
        { city: { contains: criteria.city, mode: 'insensitive' } },
        { cityAr: { contains: criteria.city, mode: 'insensitive' } }
      ];
    }

    if (criteria.property_type) {
      where.type = criteria.property_type;
    }

    return await this.prisma.property.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });
  }

  /**
   * Score properties based on criteria match
   * تقييم العقارات بناءً على مطابقة المعايير
   */
  private scoreProperties(
    properties: any[],
    criteria: PropertySearchCriteria['criteria']
  ): PropertyWithScore[] {
    return properties.map(property => {
      let score = 0;
      const matchReasons: string[] = [];

      // City match (30 points)
      if (criteria.city && this.cityMatches(property, criteria.city)) {
        score += 30;
        matchReasons.push('موقع مطابق');
      }

      // Bedroom match (25 points)
      if (criteria.bedrooms && property.bedrooms === criteria.bedrooms) {
        score += 25;
        matchReasons.push('عدد غرف مطابق');
      }

      // Area match (20 points)
      if (criteria.area && this.areaMatches(property.area, criteria.area)) {
        score += 20;
        matchReasons.push('مساحة مطابقة');
      }

      // Property type (20 points)
      if (criteria.property_type && property.type === criteria.property_type) {
        score += 20;
        matchReasons.push('نوع عقار مطابق');
      }

      // Features match (5 points each)
      if (criteria.features) {
        const matchedFeatures = this.getMatchedFeatures(property, criteria.features);
        score += matchedFeatures.length * 5;
        if (matchedFeatures.length > 0) {
          matchReasons.push(`${matchedFeatures.length} مميزات مطابقة`);
        }
      }

      // Price range match (15 points)
      if (criteria.price_range && this.priceInRange(property.price, criteria.price_range)) {
        score += 15;
        matchReasons.push('سعر مناسب');
      }

      // Featured property bonus (3 points)
      if (property.isFeatured) {
        score += 3;
        matchReasons.push('عقار مميز');
      }

      return {
        ...property,
        matchScore: score,
        matchReasons
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  // Helper methods for extraction
  private extractCity(message: string): string | undefined {
    for (const city of SAUDI_CITIES) {
      if (message.includes(city.toLowerCase())) {
        return city;
      }
    }
    return undefined;
  }

  private extractBedrooms(message: string): number | undefined {
    // Enhanced Arabic number extraction
    const patterns = [
      /(\d+)\s*(غرف|غرفة|bedroom|bedrooms)/,
      /(واحد|واحدة|1)\s*(غرفة|bedroom)/,
      /(اثنين|اثنان|2)\s*(غرف|bedrooms)/,
      /(ثلاث|ثلاثة|3)\s*(غرف|bedrooms)/,
      /(أربع|أربعة|4)\s*(غرف|bedrooms)/,
      /(خمس|خمسة|5)\s*(غرف|bedrooms)/,
      /(ست|ستة|6)\s*(غرف|bedrooms)/
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const numberText = match[1];
        // Convert Arabic numbers to digits
        const arabicToNumber: { [key: string]: number } = {
          'واحد': 1, 'واحدة': 1, '1': 1,
          'اثنين': 2, 'اثنان': 2, '2': 2,
          'ثلاث': 3, 'ثلاثة': 3, '3': 3,
          'أربع': 4, 'أربعة': 4, '4': 4,
          'خمس': 5, 'خمسة': 5, '5': 5,
          'ست': 6, 'ستة': 6, '6': 6
        };

        return arabicToNumber[numberText] || parseInt(numberText);
      }
    }
    return undefined;
  }

  private extractBathrooms(message: string): number | undefined {
    const match = message.match(/(\d+)\s*(حمام|حمامات|bathroom|bathrooms)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractArea(message: string): number | undefined {
    const match = message.match(/(\d+)\s*(متر|meter|sqm|m2)/);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractPropertyType(message: string): string | undefined {
    // Enhanced property type detection with variations
    const propertyTypes = [
      { keywords: ['فيلا', 'فيلة', 'villa', 'فلل'], type: 'VILLA' },
      { keywords: ['شقة', 'شقق', 'apartment', 'flat'], type: 'APARTMENT' },
      { keywords: ['تاون هاوس', 'تاونهاوس', 'townhouse', 'town house'], type: 'TOWNHOUSE' },
      { keywords: ['استوديو', 'ستوديو', 'studio'], type: 'STUDIO' },
      { keywords: ['دوبلكس', 'duplex'], type: 'DUPLEX' },
      { keywords: ['بنتهاوس', 'penthouse'], type: 'PENTHOUSE' },
      { keywords: ['بيت', 'منزل', 'house', 'home'], type: 'VILLA' }
    ];

    for (const { keywords, type } of propertyTypes) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return type;
      }
    }
    return undefined;
  }

  private extractFeatures(message: string): string[] {
    const features: string[] = [];
    if (message.includes('مسبح') || message.includes('pool')) features.push('مسبح');
    if (message.includes('حديقة') || message.includes('garden')) features.push('حديقة');
    if (message.includes('مواقف') || message.includes('parking')) features.push('مواقف سيارات');
    if (message.includes('مصعد') || message.includes('elevator')) features.push('مصعد');
    return features;
  }

  private extractPriceRange(message: string): { min: number; max: number } | undefined {
    const match = message.match(/(\d+)\s*(ألف|مليون|thousand|million|k|m)/);
    if (!match) return undefined;

    let price = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes('مليون') || unit.includes('million') || unit === 'm') {
      price *= 1000000;
    } else if (unit.includes('ألف') || unit.includes('thousand') || unit === 'k') {
      price *= 1000;
    }

    return { min: price * 0.8, max: price * 1.2 };
  }

  private extractFurnishedStatus(message: string): boolean | undefined {
    if (message.includes('مفروش') || message.includes('furnished')) return true;
    if (message.includes('غير مفروش') || message.includes('unfurnished')) return false;
    return undefined;
  }

  private extractParkingRequirement(message: string): boolean {
    return message.includes('مواقف') || message.includes('parking') || message.includes('جراج') || message.includes('garage');
  }

  // Helper methods for scoring
  private cityMatches(property: any, city: string): boolean {
    const cityLower = city.toLowerCase();
    return [property.city, property.cityAr, property.location, property.locationAr]
      .some(field => field && field.toLowerCase().includes(cityLower));
  }

  private areaMatches(propertyArea: number, targetArea: number): boolean {
    if (!propertyArea) return false;
    const tolerance = 0.3; // 30% tolerance
    return propertyArea >= targetArea * (1 - tolerance) &&
           propertyArea <= targetArea * (1 + tolerance);
  }

  private getMatchedFeatures(property: any, targetFeatures: string[]): string[] {
    const propertyFeatures = [
      ...(property.features || []),
      ...(property.featuresAr || []),
      ...(property.amenities || []),
      ...(property.amenitiesAr || [])
    ];

    return targetFeatures.filter(feature =>
      propertyFeatures.some(pf =>
        pf.toLowerCase().includes(feature.toLowerCase()) ||
        feature.toLowerCase().includes(pf.toLowerCase())
      )
    );
  }

  private priceInRange(price: number, range: { min: number; max: number }): boolean {
    return price >= range.min && price <= range.max;
  }

  /**
   * Update view counts for properties
   * تحديث عدد المشاهدات للعقارات
   */
  private async updateViewCounts(propertyIds: string[]): Promise<void> {
    try {
      await this.prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: { viewCount: { increment: 1 } }
      });
    } catch (error: any) {
      logWithTimestamp(`Error updating view counts: ${error.message}`, 'error');
    }
  }

  /**
   * Cleanup - disconnect Prisma
   * تنظيف - قطع اتصال Prisma
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
