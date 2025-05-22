function getSenderName(value: any, from: string) {
    const contact = value.contacts?.find((c: any) => c.wa_id === from)
    return contact?.profile?.name || "Unknown"
  }
  export default getSenderName