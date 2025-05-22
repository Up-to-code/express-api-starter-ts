import { logWithTimestamp } from "../utils/logger"
import findClientByPhone from "./findClientByPhone"
import createClient from "./createClient"

async function findOrCreateClient(phone: string, name: string) {
    const client = await findClientByPhone(phone)
    
    if (client) {
      return client
    }
    
    const newClient = await createClient(phone, name)
    logWithTimestamp(`Created new client: ${phone}`, "info")
    return newClient
  }
  export default findOrCreateClient
