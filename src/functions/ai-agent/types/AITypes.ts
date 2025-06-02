/**
 * إتجاه العقارية (Etjahh Real Estate) - AI Agent Type Definitions
 * تعريفات الأنواع للمساعد الذكي لشركة إتجاه العقارية
 */

/**
 * AI Response Interface
 * واجهة استجابة الذكاء الاصطناعي
 */
export interface AIResponse {
  response: string;
  confidence: number;
  source: 'ai_agent' | 'openai_agent' | 'property_search' | 'appointment_booking' | 'enhanced_property_search';
  propertySearchResult?: PropertySearchResult;
  appointmentId?: string;
  error?: string;
  processingTime?: number;
  language?: string;
}

/**
 * Property Search Criteria Interface
 * واجهة معايير البحث العقاري
 */
export interface PropertySearchCriteria {
  type: 'property_search';
  criteria: {
    city?: string;
    bedrooms?: number;
    area?: number;
    features?: string[];
    price_range?: { min: number; max: number };
    property_type?: string;
    bathrooms?: number;
    furnished?: boolean;
    parking?: boolean;
  };
  action: 'search_properties';
}

/**
 * Property Search Result Interface
 * واجهة نتائج البحث العقاري
 */
export interface PropertySearchResult {
  properties: PropertyWithScore[];
  total: number;
  searchCriteria: PropertySearchCriteria['criteria'];
  searchStrategy: 'direct_match' | 'scored_ranking' | 'fallback_search';
  processingTime?: number;
}

/**
 * Property with Match Score
 * العقار مع نقاط المطابقة
 */
export interface PropertyWithScore {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency: string;
  city: string;
  cityAr?: string;
  country?: string;
  countryAr?: string;
  type: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  features?: string[];
  featuresAr?: string[];
  amenities?: string[];
  amenitiesAr?: string[];
  images?: string[];
  address?: string;
  addressAr?: string;
  location?: string;
  locationAr?: string;
  furnished?: boolean;
  petFriendly?: boolean;
  parking?: number;
  yearBuilt?: number;
  isFeatured?: boolean;
  viewCount?: number;
  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  matchScore?: number;
  matchReasons?: string[];
}

/**
 * WhatsApp Media Message Interface
 * واجهة رسائل الوسائط في واتساب
 */
export interface WhatsAppMediaMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "image";
  image: {
    link: string;
    caption?: string;
  };
}

/**
 * Appointment Creation Result
 * نتيجة إنشاء الموعد
 */
export interface AppointmentResult {
  success: boolean;
  appointment?: {
    id: string;
    title: string;
    description: string;
    scheduledAt: Date;
    type: string;
    status: string;
    clientId: string;
    propertyId?: string | null;
    location: string;
  };
  error?: string;
}

/**
 * Client Information
 * معلومات العميل
 */
export interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: string;
  lastMessage?: string;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Language Detection Result
 * نتيجة كشف اللغة
 */
export interface LanguageDetection {
  language: 'ar' | 'en';
  confidence: number;
  detectedKeywords: string[];
}

/**
 * OpenAI Configuration
 * تكوين OpenAI
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  apiUrl: string;
}

/**
 * WhatsApp Configuration
 * تكوين واتساب
 */
export interface WhatsAppConfig {
  accessToken: string;
  apiUrl: string;
  phoneNumberId: string;
  verifyToken: string;
}

/**
 * Property Type Mapping
 * تطابق أنواع العقارات
 */
export const PROPERTY_TYPE_MAPPING: Record<string, string> = {
  'APARTMENT': 'شقة',
  'VILLA': 'فيلا',
  'TOWNHOUSE': 'تاون هاوس',
  'PENTHOUSE': 'بنتهاوس',
  'STUDIO': 'استوديو',
  'OFFICE': 'مكتب',
  'SHOP': 'محل تجاري',
  'WAREHOUSE': 'مستودع',
  'LAND': 'أرض',
  'BUILDING': 'مبنى'
};

/**
 * Property Status Mapping
 * تطابق حالات العقارات
 */
export const PROPERTY_STATUS_MAPPING: Record<string, string> = {
  'AVAILABLE': 'متاح',
  'SOLD': 'مباع',
  'RENTED': 'مؤجر',
  'RESERVED': 'محجوز',
  'OFF_MARKET': 'خارج السوق'
};

/**
 * Booking Keywords for Arabic
 * كلمات الحجز باللغة العربية
 */
export const BOOKING_KEYWORDS_AR = [
  'أريد حجز موعد', 'حجز موعد', 'أريد موعد', 'احجز موعد', 'موعد معاينة',
  'أريد معاينة', 'معاينة العقار', 'زيارة العقار', 'أريد زيارة',
  'اتصال', 'أريد اتصال', 'اتصلوا بي', 'تواصل معي', 'كلموني',
  'أريد التحدث', 'أريد استشارة', 'استشارة عقارية'
];

/**
 * Booking Keywords for English
 * كلمات الحجز باللغة الإنجليزية
 */
export const BOOKING_KEYWORDS_EN = [
  'book appointment', 'schedule appointment', 'book a call', 'schedule call',
  'want to visit', 'property viewing', 'schedule viewing', 'book viewing',
  'contact me', 'call me', 'want consultation', 'real estate consultation',
  'schedule meeting', 'book meeting', 'arrange visit'
];

/**
 * Search Keywords for Arabic
 * كلمات البحث باللغة العربية
 */
export const SEARCH_KEYWORDS_AR = [
  'أريد عقار', 'أبحث عن', 'عقار في', 'شقة في', 'فيلا في',
  'أريد شراء', 'أريد استئجار', 'ابحث عن عقار', 'عقار للبيع', 'عقار للإيجار'
];

/**
 * Search Keywords for English
 * كلمات البحث باللغة الإنجليزية
 */
export const SEARCH_KEYWORDS_EN = [
  'i want property', 'looking for', 'property in', 'apartment in', 'villa in',
  'want to buy', 'want to rent', 'search for property', 'property for sale', 'property for rent'
];

/**
 * Saudi Cities in Arabic and English
 * المدن السعودية بالعربية والإنجليزية
 */
export const SAUDI_CITIES = [
  'الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'تبوك', 'بريدة', 'خميس مشيط', 'حائل',
  'riyadh', 'jeddah', 'dammam', 'mecca', 'medina', 'taif', 'tabuk', 'buraidah', 'khamis mushait', 'hail'
];

/**
 * Error Types
 * أنواع الأخطاء
 */
export enum ErrorType {
  OPENAI_ERROR = 'OPENAI_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  WHATSAPP_ERROR = 'WHATSAPP_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

/**
 * Processing Status
 * حالة المعالجة
 */
export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
