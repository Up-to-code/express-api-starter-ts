/**
 * إتجاه العقارية (Etjahh Real Estate) - OpenAI Service
 * خدمة OpenAI لشركة إتجاه العقارية
 */

import { logWithTimestamp } from '../../../utils/logger';
import { OpenAIConfig } from '../types/AITypes';

/**
 * OpenAI Service Class
 * فئة خدمة OpenAI
 */
export class OpenAIService {
  private config: OpenAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'
    };
  }

  /**
   * Check if OpenAI is configured
   * فحص تكوين OpenAI
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Generate AI response using OpenAI
   * توليد استجابة ذكية باستخدام OpenAI
   */
  async generateResponse(userMessage: string, language: string = 'ar'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.createSystemPrompt(language);

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response content from OpenAI');
      }

      logWithTimestamp(`OpenAI response generated successfully`, 'info');
      return aiResponse;
    } catch (error: any) {
      logWithTimestamp(`OpenAI API error: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Create system prompt based on language
   * إنشاء موجه النظام بناءً على اللغة
   */
  private createSystemPrompt(language: string): string {
    if (language === 'ar') {
      return `أنت مساعد ذكي لشركة "إتجاه العقارية" في المملكة العربية السعودية. أنت وسيط عقاري محترف ومتخصص في السوق السعودي.

🏢 **معلومات الشركة:**
- الاسم: شركة إتجاه العقارية
- التخصص: الوساطة العقارية في المملكة العربية السعودية
- الخدمات: بيع وشراء وإيجار العقارات، استشارات عقارية، تقييم العقارات

🎯 **مهامك الأساسية:**
- تقديم معلومات دقيقة عن العقارات والخدمات العقارية
- مساعدة العملاء في البحث عن العقارات المناسبة لاحتياجاتهم
- تقديم استشارات عقارية مهنية ومتخصصة
- الرد بطريقة ودودة ومهنية باللغة العربية
- تمثيل شركة إتجاه العقارية بأفضل صورة ممكنة

📋 **إرشادات الاستجابة:**
- استخدم اسم "شركة إتجاه العقارية" في جميع ردودك
- ركز على السوق العقاري السعودي
- قدم معلومات مفيدة وعملية
- كن مهذباً ومحترفاً في جميع الأوقات
- استخدم الرموز التعبيرية المناسبة لجعل الرد أكثر ودية

🔍 **عند طلب البحث عن عقار:**
إذا طلب العميل البحث عن عقار محدد، قم بتحليل المعايير واستخراجها بدقة.

تذكر: أنت تمثل شركة إتجاه العقارية وتهدف إلى تقديم أفضل خدمة عقارية في المملكة.`;
    } else {
      return `You are an intelligent assistant for "Etjahh Real Estate Company" in Saudi Arabia. You are a professional real estate broker specializing in the Saudi market.

🏢 **Company Information:**
- Name: Etjahh Real Estate Company
- Specialization: Real estate brokerage in Saudi Arabia
- Services: Property sales, purchases, rentals, real estate consultations, property valuations

🎯 **Your Main Tasks:**
- Provide accurate information about properties and real estate services
- Help clients search for suitable properties for their needs
- Offer professional and specialized real estate consultations
- Respond in a friendly and professional manner
- Represent Etjahh Real Estate Company in the best possible way

📋 **Response Guidelines:**
- Use "Etjahh Real Estate Company" in all your responses
- Focus on the Saudi real estate market
- Provide useful and practical information
- Be polite and professional at all times
- Use appropriate emojis to make responses more friendly

🔍 **When Property Search is Requested:**
If a client requests to search for a specific property, analyze and extract the criteria accurately.

Remember: You represent Etjahh Real Estate Company and aim to provide the best real estate service in Saudi Arabia.`;
    }
  }

  /**
   * Generate property analysis using AI
   * توليد تحليل العقار باستخدام الذكاء الاصطناعي
   */
  async analyzeProperty(propertyData: any, language: string = 'ar'): Promise<string> {
    const prompt = language === 'ar'
      ? `قم بتحليل هذا العقار وتقديم تقييم مهني:

العقار: ${propertyData.title || propertyData.titleAr}
السعر: ${propertyData.price} ${propertyData.currency}
الموقع: ${propertyData.city || propertyData.cityAr}
النوع: ${propertyData.type}
المساحة: ${propertyData.area} متر مربع
غرف النوم: ${propertyData.bedrooms}
دورات المياه: ${propertyData.bathrooms}

قدم تحليلاً مهنياً يتضمن:
- تقييم السعر مقارنة بالسوق
- مميزات الموقع
- نقاط القوة والضعف
- توصيات للمشترين المحتملين`
      : `Analyze this property and provide a professional assessment:

Property: ${propertyData.title}
Price: ${propertyData.price} ${propertyData.currency}
Location: ${propertyData.city}
Type: ${propertyData.type}
Area: ${propertyData.area} sqm
Bedrooms: ${propertyData.bedrooms}
Bathrooms: ${propertyData.bathrooms}

Provide a professional analysis including:
- Price evaluation compared to market
- Location advantages
- Strengths and weaknesses
- Recommendations for potential buyers`;

    return await this.generateResponse(prompt, language);
  }

  /**
   * Generate market insights
   * توليد رؤى السوق
   */
  async generateMarketInsights(city: string, language: string = 'ar'): Promise<string> {
    const prompt = language === 'ar'
      ? `قدم تحليلاً للسوق العقاري في ${city} يتضمن:
- الاتجاهات الحالية للأسعار
- أفضل المناطق للاستثمار
- توقعات السوق
- نصائح للمشترين والمستثمرين

تذكر أنك تمثل شركة إتجاه العقارية.`
      : `Provide a real estate market analysis for ${city} including:
- Current price trends
- Best areas for investment
- Market forecasts
- Tips for buyers and investors

Remember you represent Etjahh Real Estate Company.`;

    return await this.generateResponse(prompt, language);
  }

  /**
   * Generate investment advice
   * توليد نصائح الاستثمار
   */
  async generateInvestmentAdvice(
    budget: number, 
    investmentType: string, 
    language: string = 'ar'
  ): Promise<string> {
    const prompt = language === 'ar'
      ? `قدم نصائح استثمارية عقارية لعميل لديه ميزانية ${budget} ريال سعودي ويريد الاستثمار في ${investmentType}.

تضمن النصائح:
- أفضل أنواع العقارات للاستثمار
- المناطق المناسبة
- العائد المتوقع
- المخاطر والفرص
- خطة استثمارية مقترحة

من شركة إتجاه العقارية.`
      : `Provide real estate investment advice for a client with a budget of ${budget} SAR who wants to invest in ${investmentType}.

Include advice on:
- Best property types for investment
- Suitable areas
- Expected returns
- Risks and opportunities
- Suggested investment plan

From Etjahh Real Estate Company.`;

    return await this.generateResponse(prompt, language);
  }

  /**
   * Get service configuration status
   * الحصول على حالة تكوين الخدمة
   */
  getConfigStatus(): {
    configured: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
  } {
    return {
      configured: this.isConfigured(),
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    };
  }

  /**
   * Update configuration
   * تحديث التكوين
   */
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
