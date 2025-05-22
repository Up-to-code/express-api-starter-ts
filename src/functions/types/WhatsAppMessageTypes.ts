
export interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: {
    body: string
  }
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsAppWebhook {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: WhatsAppContact[]
        messages?: WhatsAppMessage[]
        statuses?: any[]
      }
      field: string
    }>
  }>
}

 