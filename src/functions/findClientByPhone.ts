import { prisma } from "../lib/prisma"

// Database - Client Operations
async function findClientByPhone(phone: string) {
    return await prisma.client.findUnique({
      where: { phone },
    })
  }

  export default findClientByPhone