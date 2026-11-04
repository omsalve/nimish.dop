/**
 * Where else to find Nimish. These three links are placeholders: replace the
 * handle and the phone number (see README, "Contact form and social links").
 */

// Country code + number, digits only: "919876543210" for +91 98765 43210.
const WHATSAPP_NUMBER = "910000000000";
const WHATSAPP_GREETING = "Hi Nimish, I saw your concert work and want to talk about a show.";

export const socials = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/imnimishh_/",
  },
  {
    id: "behance",
    label: "Behance",
    href: "https://www.behance.net/your-handle",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: `https://wa.me/${8356857496}?text=${encodeURIComponent(WHATSAPP_GREETING)}`,
  },
] as const;

export type Social = (typeof socials)[number];
