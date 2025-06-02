const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create sample clients
    console.log('👥 Creating sample clients...');
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          name: 'Ahmed Hassan',
          phone: '+201234567890',
          lastMessage: 'Hello, I need help with my order',
          type: 'VIP',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      }),
      prisma.client.create({
        data: {
          name: 'Sarah Mohamed',
          phone: '+201234567891',
          lastMessage: 'Thank you for the quick response',
          type: 'Regular',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      }),
      prisma.client.create({
        data: {
          name: 'Omar Ali',
          phone: '+201234567892',
          lastMessage: 'When will my order be delivered?',
          type: 'New',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      }),
      prisma.client.create({
        data: {
          name: 'Fatima Ibrahim',
          phone: '+201234567893',
          lastMessage: 'I love your service!',
          type: 'VIP',
          createdAt: new Date(), // Today
        },
      }),
    ]);

    console.log(`✅ Created ${clients.length} clients`);

    // Create sample messages
    console.log('💬 Creating sample messages...');
    const messages = [];
    
    for (const client of clients) {
      // Create 2-5 messages per client
      const messageCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < messageCount; i++) {
        const isBot = Math.random() > 0.6; // 40% chance of bot message
        const daysAgo = Math.floor(Math.random() * 7); // Random day in last week
        
        const message = await prisma.message.create({
          data: {
            text: isBot 
              ? `Bot response ${i + 1} for ${client.name}`
              : `User message ${i + 1} from ${client.name}`,
            clientId: client.id,
            isBot,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        });
        
        messages.push(message);
      }
    }

    console.log(`✅ Created ${messages.length} messages`);

    // Create sample templates
    console.log('📝 Creating sample templates...');
    const templates = await Promise.all([
      prisma.template.create({
        data: {
          name: 'Welcome Message',
          content: 'Welcome to our service, {{name}}! We\'re excited to have you.',
          category: 'greeting',
          variables: ['name'],
          language: 'en',
        },
      }),
      prisma.template.create({
        data: {
          name: 'Order Confirmation',
          content: 'Your order #{{orderNumber}} has been confirmed. Total: {{total}}',
          category: 'confirmation',
          variables: ['orderNumber', 'total'],
          language: 'en',
        },
      }),
      prisma.template.create({
        data: {
          name: 'رسالة ترحيب',
          content: 'مرحباً بك {{name}} في خدمتنا! نحن سعداء لانضمامك إلينا.',
          category: 'greeting',
          variables: ['name'],
          language: 'ar',
        },
      }),
      prisma.template.create({
        data: {
          name: 'تأكيد الطلب',
          content: 'تم تأكيد طلبك رقم {{orderNumber}}. المجموع: {{total}}',
          category: 'confirmation',
          variables: ['orderNumber', 'total'],
          language: 'ar',
        },
      }),
    ]);

    console.log(`✅ Created ${templates.length} templates`);

    // Create sample campaigns
    console.log('📢 Creating sample campaigns...');
    const campaigns = await Promise.all([
      prisma.campaign.create({
        data: {
          name: 'Welcome Campaign',
          type: 'Template',
          status: 'Active',
          audience: 'New Clients',
          sentCount: 15,
          message: 'Welcome to our service!',
          lastSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          clients: {
            connect: [{ id: clients[2].id }, { id: clients[3].id }],
          },
        },
      }),
      prisma.campaign.create({
        data: {
          name: 'Monthly Newsletter',
          type: 'Custom',
          status: 'Scheduled',
          audience: 'All Clients',
          sentCount: 0,
          message: 'Check out our latest updates and offers!',
          clients: {
            connect: clients.map(client => ({ id: client.id })),
          },
        },
      }),
      prisma.campaign.create({
        data: {
          name: 'VIP Promotion',
          type: 'Template',
          status: 'Completed',
          audience: 'VIP Clients',
          sentCount: 8,
          message: 'Exclusive offer for our VIP customers!',
          lastSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          clients: {
            connect: [{ id: clients[0].id }, { id: clients[3].id }],
          },
        },
      }),
    ]);

    console.log(`✅ Created ${campaigns.length} campaigns`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Clients: ${clients.length}`);
    console.log(`   💬 Messages: ${messages.length}`);
    console.log(`   📝 Templates: ${templates.length}`);
    console.log(`   📢 Campaigns: ${campaigns.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedData()
  .then(() => {
    console.log('\n✅ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  });
