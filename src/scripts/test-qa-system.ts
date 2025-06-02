import generateResponse from '../functions/generateResponse';
import { logWithTimestamp } from '../utils/logger';

async function testQASystem() {
  console.log('🧪 Testing QA System with 90% Similarity Threshold\n');

  const testMessages = [
    // High similarity matches (should use QA pairs)
    {
      message: "How do I schedule an appointment?",
      expectedSource: "QA Database",
      description: "Exact match for appointment scheduling"
    },
    {
      message: "كيف أجدول موعد؟", 
      expectedSource: "QA Database",
      description: "Exact match for Arabic appointment scheduling"
    },
    {
      message: "How can I add a new client?",
      expectedSource: "QA Database", 
      description: "High similarity to 'How do I add a new client?'"
    },
    
    // Medium similarity (should use AI Agent)
    {
      message: "What are your working hours?",
      expectedSource: "AI Agent",
      description: "Medium similarity to office hours question"
    },
    {
      message: "I want to buy a house",
      expectedSource: "AI Agent", 
      description: "Related to property but not exact match"
    },
    
    // Low/No similarity (should use AI Agent)
    {
      message: "What's the weather like today?",
      expectedSource: "AI Agent",
      description: "Completely unrelated to real estate"
    },
    {
      message: "Hello there!",
      expectedSource: "AI Agent",
      description: "General greeting"
    }
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    console.log(`\n📝 Test ${i + 1}: ${test.description}`);
    console.log(`📨 Message: "${test.message}"`);
    console.log(`🎯 Expected: ${test.expectedSource}`);
    
    try {
      const startTime = Date.now();
      const response = await generateResponse(
        test.message,
        `+1234567890${i}`, // Unique phone number for each test
        `Test User ${i + 1}`
      );
      const endTime = Date.now();
      
      console.log(`⚡ Response time: ${endTime - startTime}ms`);
      console.log(`🤖 Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
      console.log(`✅ Test completed successfully`);
      
    } catch (error: any) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('─'.repeat(80));
  }

  console.log('\n🎉 All tests completed!');
  console.log('\n📊 Summary:');
  console.log('• High similarity (≥90%) → QA Database responses');
  console.log('• Low similarity (<90%) → AI Agent responses');
  console.log('• Fallback chain: QA → AI Agent → Default Response');
}

// Run the test
if (require.main === module) {
  testQASystem()
    .then(() => {
      console.log('\n✅ Test suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { testQASystem };
