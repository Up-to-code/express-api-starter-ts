const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const properties = [
  {
    title: "Luxury Villa in Riyadh",
    titleAr: "فيلا فاخرة في الرياض",
    description: "Stunning 4-bedroom villa with modern amenities, private pool, and beautiful garden. Located in prestigious Al-Malqa district with easy access to shopping centers and schools.",
    descriptionAr: "فيلا رائعة من 4 غرف نوم مع وسائل الراحة الحديثة ومسبح خاص وحديقة جميلة. تقع في حي الملقا المرموق مع سهولة الوصول إلى مراكز التسوق والمدارس.",
    price: 2500000,
    currency: "SAR",
    type: "VILLA",
    status: "AVAILABLE",
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    location: "Al-Malqa District",
    locationAr: "حي الملقا",
    address: "Al-Malqa District, Riyadh 12345",
    addressAr: "حي الملقا، الرياض 12345",
    city: "Riyadh",
    cityAr: "الرياض",
    country: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    latitude: 24.7136,
    longitude: 46.6753,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ],
    features: ["Swimming Pool", "Garden", "Garage", "Security System", "Central AC"],
    featuresAr: ["مسبح", "حديقة", "جراج", "نظام أمني", "تكييف مركزي"],
    amenities: ["Gym", "Playground", "BBQ Area", "Maid Room"],
    amenitiesAr: ["صالة رياضية", "ملعب أطفال", "منطقة شواء", "غرفة خادمة"],
    yearBuilt: 2020,
    parking: 2,
    furnished: false,
    petFriendly: true,
    utilities: "Electricity, Water, Internet included",
    utilitiesAr: "الكهرباء والماء والإنترنت مشمولة",
    contactInfo: "Contact Etjahh Real Estate for viewing",
    isActive: true,
    isFeatured: true
  },
  {
    title: "Modern Apartment in Jeddah",
    titleAr: "شقة عصرية في جدة",
    description: "Beautiful 3-bedroom apartment with sea view, fully furnished, located in the heart of Jeddah with access to beaches and shopping malls.",
    descriptionAr: "شقة جميلة من 3 غرف نوم مع إطلالة على البحر، مفروشة بالكامل، تقع في قلب جدة مع إمكانية الوصول إلى الشواطئ ومراكز التسوق.",
    price: 1800000,
    currency: "SAR",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    location: "Corniche District",
    locationAr: "حي الكورنيش",
    address: "Corniche Road, Jeddah 21589",
    addressAr: "طريق الكورنيش، جدة 21589",
    city: "Jeddah",
    cityAr: "جدة",
    country: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    latitude: 21.4858,
    longitude: 39.1925,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    features: ["Sea View", "Balcony", "Parking", "Elevator", "24/7 Security"],
    featuresAr: ["إطلالة بحرية", "شرفة", "مواقف سيارات", "مصعد", "حراسة 24/7"],
    amenities: ["Swimming Pool", "Gym", "Reception", "Concierge"],
    amenitiesAr: ["مسبح", "صالة رياضية", "استقبال", "خدمة الكونسيرج"],
    yearBuilt: 2019,
    parking: 1,
    furnished: true,
    petFriendly: false,
    utilities: "All utilities included",
    utilitiesAr: "جميع المرافق مشمولة",
    contactInfo: "Contact Etjahh Real Estate for viewing",
    isActive: true,
    isFeatured: false
  },
  {
    title: "Spacious Townhouse in Dammam",
    titleAr: "تاون هاوس واسع في الدمام",
    description: "Family-friendly 5-bedroom townhouse with private garden, garage, and modern kitchen. Perfect for families looking for space and comfort.",
    descriptionAr: "تاون هاوس من 5 غرف نوم مناسب للعائلات مع حديقة خاصة وجراج ومطبخ عصري. مثالي للعائلات التي تبحث عن المساحة والراحة.",
    price: 1200000,
    currency: "SAR",
    type: "TOWNHOUSE",
    status: "AVAILABLE",
    bedrooms: 5,
    bathrooms: 4,
    area: 280,
    location: "Al-Faisaliyah",
    locationAr: "الفيصلية",
    address: "Al-Faisaliyah District, Dammam 31411",
    addressAr: "حي الفيصلية، الدمام 31411",
    city: "Dammam",
    cityAr: "الدمام",
    country: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    latitude: 26.4207,
    longitude: 50.0888,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
    ],
    features: ["Private Garden", "Garage", "Storage Room", "Laundry Room"],
    featuresAr: ["حديقة خاصة", "جراج", "غرفة تخزين", "غرفة غسيل"],
    amenities: ["Community Pool", "Playground", "Security", "Maintenance"],
    amenitiesAr: ["مسبح مجتمعي", "ملعب أطفال", "أمن", "صيانة"],
    yearBuilt: 2018,
    parking: 2,
    furnished: false,
    petFriendly: true,
    utilities: "Water and electricity included",
    utilitiesAr: "الماء والكهرباء مشمولان",
    contactInfo: "Contact Etjahh Real Estate for viewing",
    isActive: true,
    isFeatured: false
  }
];

async function addProperties() {
  try {
    console.log('🌱 Adding comprehensive properties...');

    // Clear existing properties
    await prisma.property.deleteMany({});
    console.log('🗑️ Cleared existing properties');

    // Create properties
    for (const propertyData of properties) {
      const property = await prisma.property.create({
        data: propertyData
      });
      console.log(`✅ Created: ${property.titleAr} (${property.title})`);
    }

    console.log(`🎉 Successfully added ${properties.length} properties!`);

  } catch (error) {
    console.error('❌ Error adding properties:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProperties();
