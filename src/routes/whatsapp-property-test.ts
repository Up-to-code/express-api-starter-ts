/**
 * WhatsApp Property Search Test Routes for إتجاه العقارية (Etjahh Real Estate)
 * مسارات اختبار البحث العقاري عبر واتساب لشركة إتجاه العقارية
 */

import { Router } from 'express';
import { logWithTimestamp } from '../utils/logger';
import { generateAIResponse } from '../functions/ai-agent/AIResponseGenerator';
import { EnhancedWhatsAppService } from '../services/EnhancedWhatsAppService';
import { processTextMessage } from '../functions/processTextMessage';

const router = Router();

/**
 * Test property search with WhatsApp integration
 * اختبار البحث العقاري مع تكامل واتساب
 */
router.post('/test-property-search', async (req, res) => {
  try {
    const {
      message,
      clientPhone,
      language = 'ar',
      includeImages = true,
      testMode = true
    } = req.body;

    if (!message || !clientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Message and client phone are required'
      });
    }

    logWithTimestamp(
      `🧪 Testing property search: "${message}" for ${clientPhone}`,
      'info'
    );

    const startTime = Date.now();

    // Test AI property search with WhatsApp integration
    const aiResponse = await generateAIResponse(message, language, clientPhone);

    const processingTime = Date.now() - startTime;

    // Enhanced response with test details
    const testResult = {
      success: true,
      testMode,
      input: {
        message,
        clientPhone,
        language,
        includeImages
      },
      aiResponse: {
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        source: aiResponse.source,
        processingTime: aiResponse.processingTime
      },
      propertySearch: aiResponse.propertySearchResult ? {
        propertiesFound: aiResponse.propertySearchResult.total,
        propertiesShown: aiResponse.propertySearchResult.properties?.length || 0,
        searchStrategy: aiResponse.propertySearchResult.searchStrategy,
        searchCriteria: aiResponse.propertySearchResult.searchCriteria
      } : null,
      whatsappIntegration: {
        messagesExpected: aiResponse.source === 'enhanced_property_search' ?
          (aiResponse.propertySearchResult?.properties?.length || 0) + 2 : 1,
        imagesExpected: includeImages && aiResponse.propertySearchResult?.properties ?
          aiResponse.propertySearchResult.properties.reduce((total: number, prop: any) =>
            total + Math.min(prop.images?.length || 0, 2), 0) : 0,
        enhancedMode: aiResponse.source === 'enhanced_property_search'
      },
      performance: {
        totalProcessingTime: processingTime,
        aiProcessingTime: aiResponse.processingTime,
        timestamp: new Date().toISOString()
      }
    };

    logWithTimestamp(
      `✅ Property search test completed: ${testResult.propertySearch?.propertiesFound || 0} properties found`,
      'success'
    );

    res.json(testResult);

  } catch (error: any) {
    logWithTimestamp(`❌ Property search test error: ${error.message}`, 'error');

    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Test direct WhatsApp message processing (simulates webhook)
 * اختبار معالجة رسائل واتساب المباشرة (محاكاة webhook)
 */
router.post('/test-whatsapp-message', async (req, res) => {
  try {
    const {
      from,
      message,
      senderName = 'Test User',
      simulateWebhook = true
    } = req.body;

    if (!from || !message) {
      return res.status(400).json({
        success: false,
        error: 'From and message are required'
      });
    }

    logWithTimestamp(
      `📱 Testing WhatsApp message processing: "${message}" from ${from}`,
      'info'
    );

    const startTime = Date.now();

    // Simulate WhatsApp message structure
    const whatsappMessage = {
      id: `test_msg_${Date.now()}`,
      from: from,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: 'text',
      text: {
        body: message
      }
    };

    // Simulate webhook value structure
    const webhookValue = {
      messaging_product: 'whatsapp',
      metadata: {
        display_phone_number: '15550123456',
        phone_number_id: 'test_phone_id'
      },
      contacts: [{
        profile: {
          name: senderName
        },
        wa_id: from
      }],
      messages: [whatsappMessage]
    };

    if (simulateWebhook) {
      // Process through the actual WhatsApp message handler
      await processTextMessage(whatsappMessage as any, webhookValue);
    }

    const processingTime = Date.now() - startTime;

    const testResult = {
      success: true,
      simulateWebhook,
      input: {
        from,
        message,
        senderName
      },
      whatsappMessage,
      processing: {
        completed: true,
        processingTime,
        timestamp: new Date().toISOString()
      },
      note: simulateWebhook ?
        'Message processed through actual WhatsApp handler - check logs for results' :
        'Message structure created but not processed'
    };

    logWithTimestamp(
      `✅ WhatsApp message test completed in ${processingTime}ms`,
      'success'
    );

    res.json(testResult);

  } catch (error: any) {
    logWithTimestamp(`❌ WhatsApp message test error: ${error.message}`, 'error');

    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Test Arabic property search queries
 * اختبار استعلامات البحث العقاري العربية
 */
router.post('/test-arabic-search', async (req, res) => {
  try {
    const testQueries = [
      'أبحث عن شقة في الرياض 3 غرف',
      'أريد فيلا في جدة مع مسبح',
      'استوديو مفروش في الدمام',
      'تاون هاوس في الخبر 4 غرف',
      'شقة للإيجار في مكة غرفتين',
      'فيلا للبيع في المدينة المنورة'
    ];

    const { clientPhone = '+966501234567' } = req.body;

    logWithTimestamp('🧪 Testing Arabic property search queries...', 'info');

    const results = [];

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];

      try {
        const startTime = Date.now();
        const aiResponse = await generateAIResponse(query, 'ar', clientPhone);
        const processingTime = Date.now() - startTime;

        results.push({
          query,
          success: true,
          response: {
            source: aiResponse.source,
            confidence: aiResponse.confidence,
            propertiesFound: aiResponse.propertySearchResult?.total || 0,
            processingTime
          }
        });

        logWithTimestamp(
          `✅ Query ${i + 1}/${testQueries.length}: ${aiResponse.propertySearchResult?.total || 0} properties found`,
          'info'
        );

        // Small delay between queries
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        results.push({
          query,
          success: false,
          error: error.message
        });
      }
    }

    const successfulQueries = results.filter(r => r.success).length;
    const totalProperties = results.reduce((sum, r) =>
      sum + (r.success ? r.response.propertiesFound : 0), 0);

    logWithTimestamp(
      `✅ Arabic search test completed: ${successfulQueries}/${testQueries.length} queries successful, ${totalProperties} total properties found`,
      'success'
    );

    res.json({
      success: true,
      summary: {
        totalQueries: testQueries.length,
        successfulQueries,
        totalPropertiesFound: totalProperties,
        successRate: Math.round((successfulQueries / testQueries.length) * 100)
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logWithTimestamp(`❌ Arabic search test error: ${error.message}`, 'error');

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get test status and system health
 * الحصول على حالة الاختبار وصحة النظام
 */
router.get('/status', async (req, res) => {
  try {
    // Check WhatsApp service status
    const whatsappStatus = {
      accessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      apiUrl: !!process.env.WHATSAPP_API_URL,
      configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_API_URL)
    };

    // Get recent analytics
    const analytics = await EnhancedWhatsAppService.getDeliveryAnalytics('day');

    res.json({
      success: true,
      system: {
        status: 'operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      whatsapp: whatsappStatus,
      analytics: {
        today: analytics
      },
      endpoints: {
        propertySearch: '/api/v1/whatsapp-property-test/test-property-search',
        whatsappMessage: '/api/v1/whatsapp-property-test/test-whatsapp-message',
        arabicSearch: '/api/v1/whatsapp-property-test/test-arabic-search',
        status: '/api/v1/whatsapp-property-test/status'
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
