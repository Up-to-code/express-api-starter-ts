import { prisma } from "../lib/prisma"

async function createClient(phone: string, name: string) {
    return await prisma.client.create({
      data: {
        name: name || "Unknown",
        phone,
        lastMessage: "",
        lastActive: new Date(),
      },
    })
  }

  export default createClient