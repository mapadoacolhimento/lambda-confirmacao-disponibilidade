export default function cleanPhone(phone: string) {
  return phone.replace("whatsapp:+55", "").replace("whatsapp%3A%2B55", "");
}
