import { prisma } from "../lib/prisma"

async function updateClientActivity(clientId: string, message: string) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        lastActive: new Date(),
        lastMessage: message,
      },
    })
  }

  export default updateClientActivity