// Response Generation
function getDefaultArabicResponse(message: string) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("مرحبا") || lowerMessage.includes("اهلا") || lowerMessage.includes("السلام")) {
      return "مرحبا! كيف يمكنني مساعدتك في استفسارك العقاري اليوم؟"
    } else if (lowerMessage.includes("سعر") || lowerMessage.includes("تكلفة") || lowerMessage.includes("كم")) {
      return "يتراوح سعر العقارات بناءً على الموقع والمساحة والمواصفات. هل يمكنك تقديم المزيد من التفاصيل حول ما تبحث عنه؟"
    } else {
      return "شكراً للتواصل معنا. كيف يمكننا مساعدتك في احتياجاتك العقارية؟"
    }
  }
  
  function getDefaultEnglishResponse(message: string) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! How can I assist you with your real estate inquiry today?"
    } else if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return "Property prices vary based on location, size, and specifications. Can you provide more details about what you are looking for?"
    } else {
      return "Thank you for contacting us. How can we help with your real estate needs?"
    }
  }
  
  function getDefaultResponse(message: string, language: string) {
    if (language === "ar") {
      return getDefaultArabicResponse(message)
    } else {
      return getDefaultEnglishResponse(message)
    }
  }

  export { getDefaultArabicResponse, getDefaultEnglishResponse, getDefaultResponse }