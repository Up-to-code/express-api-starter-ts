import { prisma } from '../lib/prisma';

const sampleQAPairs = [
  {
    question: "How do I schedule an appointment?",
    answer: "To schedule an appointment, go to the Appointments section in your dashboard and click 'New Appointment'. Select a client, choose a date and time, and add any relevant details.",
    category: "appointment",
    language: "en",
    tags: ["appointment", "scheduling", "calendar"],
    priority: 10,
    isActive: true
  },
  {
    question: "كيف أجدول موعد؟",
    answer: "لجدولة موعد، اذهب إلى قسم المواعيد في لوحة التحكم واضغط على 'موعد جديد'. اختر عميل، واختر التاريخ والوقت، وأضف أي تفاصيل ذات صلة.",
    category: "appointment",
    language: "ar",
    tags: ["موعد", "جدولة", "تقويم"],
    priority: 10,
    isActive: true
  },
  {
    question: "How do I add a new client?",
    answer: "You can add a new client by going to the Clients section and clicking 'Add Client'. Fill in the required information including name, phone number, and email address.",
    category: "client",
    language: "en",
    tags: ["client", "add", "contact"],
    priority: 8,
    isActive: true
  },
  {
    question: "كيف أضيف عميل جديد؟",
    answer: "يمكنك إضافة عميل جديد بالذهاب إلى قسم العملاء والضغط على 'إضافة عميل'. املأ المعلومات المطلوبة بما في ذلك الاسم ورقم الهاتف وعنوان البريد الإلكتروني.",
    category: "client",
    language: "ar",
    tags: ["عميل", "إضافة", "جهة اتصال"],
    priority: 8,
    isActive: true
  },
  {
    question: "What property types do you handle?",
    answer: "We handle all types of properties including residential homes, apartments, commercial buildings, land plots, and investment properties. Our team specializes in both sales and rentals.",
    category: "property",
    language: "en",
    tags: ["property", "types", "real estate"],
    priority: 9,
    isActive: true
  },
  {
    question: "ما أنواع العقارات التي تتعاملون معها؟",
    answer: "نتعامل مع جميع أنواع العقارات بما في ذلك المنازل السكنية والشقق والمباني التجارية وقطع الأراضي والعقارات الاستثمارية. فريقنا متخصص في البيع والإيجار.",
    category: "property",
    language: "ar",
    tags: ["عقار", "أنواع", "عقارات"],
    priority: 9,
    isActive: true
  },
  {
    question: "How do I create a WhatsApp campaign?",
    answer: "To create a WhatsApp campaign, go to the Marketing section, select 'WhatsApp Campaigns', and click 'New Campaign'. Choose your template, select target clients, and schedule your campaign.",
    category: "marketing",
    language: "en",
    tags: ["whatsapp", "campaign", "marketing"],
    priority: 7,
    isActive: true
  },
  {
    question: "كيف أنشئ حملة واتساب؟",
    answer: "لإنشاء حملة واتساب، اذهب إلى قسم التسويق، اختر 'حملات واتساب'، واضغط على 'حملة جديدة'. اختر القالب، حدد العملاء المستهدفين، وجدول حملتك.",
    category: "marketing",
    language: "ar",
    tags: ["واتساب", "حملة", "تسويق"],
    priority: 7,
    isActive: true
  },
  {
    question: "What are your office hours?",
    answer: "Our office hours are Sunday to Thursday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 4:00 PM. We're closed on Fridays.",
    category: "general",
    language: "both",
    tags: ["hours", "office", "schedule"],
    priority: 5,
    isActive: true
  },
  {
    question: "How do I generate reports?",
    answer: "You can generate various reports from the Analytics section. Choose the type of report you need (sales, clients, appointments, etc.), select the date range, and click 'Generate Report'.",
    category: "technical",
    language: "en",
    tags: ["reports", "analytics", "data"],
    priority: 6,
    isActive: true
  },
  {
    question: "كيف أولد التقارير؟",
    answer: "يمكنك إنشاء تقارير مختلفة من قسم التحليلات. اختر نوع التقرير الذي تحتاجه (مبيعات، عملاء، مواعيد، إلخ)، حدد النطاق الزمني، واضغط على 'إنشاء تقرير'.",
    category: "technical",
    language: "ar",
    tags: ["تقارير", "تحليلات", "بيانات"],
    priority: 6,
    isActive: true
  },
  {
    question: "How do I backup my data?",
    answer: "Your data is automatically backed up daily to secure cloud storage. You can also manually export your data from the Settings section by clicking 'Export Data'.",
    category: "technical",
    language: "en",
    tags: ["backup", "data", "export"],
    priority: 4,
    isActive: true
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including bank transfers, credit cards, cash, and digital payment platforms. Payment terms can be discussed based on the property and agreement type.",
    category: "general",
    language: "both",
    tags: ["payment", "methods", "finance"],
    priority: 7,
    isActive: true
  },
  {
    question: "How do I update client information?",
    answer: "To update client information, go to the Clients section, find the client you want to update, click the edit button, make your changes, and save. All changes are logged for audit purposes.",
    category: "client",
    language: "en",
    tags: ["client", "update", "edit"],
    priority: 6,
    isActive: true
  },
  {
    question: "Can I customize message templates?",
    answer: "Yes! You can create and customize message templates in the Marketing section. Go to 'Message Templates', click 'New Template', and design your custom template with placeholders for dynamic content.",
    category: "marketing",
    language: "en",
    tags: ["templates", "messages", "customization"],
    priority: 8,
    isActive: true
  }
];

async function seedQAPairs() {
  try {
    console.log('🌱 Starting QA pairs seeding...');

    // Clear existing QA pairs
    await prisma.qAPair.deleteMany({});
    console.log('🗑️ Cleared existing QA pairs');

    // Insert sample QA pairs
    const createdQAPairs = await prisma.qAPair.createMany({
      data: sampleQAPairs
    });

    console.log(`✅ Created ${createdQAPairs.count} QA pairs`);

    // Get statistics
    const stats = await prisma.qAPair.groupBy({
      by: ['category', 'language'],
      _count: { id: true }
    });

    console.log('📊 QA Pairs Statistics:');
    stats.forEach(stat => {
      console.log(`  ${stat.category} (${stat.language}): ${stat._count.id} pairs`);
    });

    console.log('🎉 QA pairs seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding QA pairs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedQAPairs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedQAPairs };
