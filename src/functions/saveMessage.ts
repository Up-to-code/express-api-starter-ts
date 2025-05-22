import { prisma } from "../lib/prisma"

// Database - Message Operations
async function saveMessage(text: string, clientId: string, isBot: boolean) {
  await prisma.message.create({
    data: {
      text,
      clientId,
      isBot,
    },
  })
}
export default saveMessage