/**
 * The booking enquiry: shared by the form (client) and its Server Action.
 * Delivery runs through Resend's free tier; see README, "Contact form".
 */

// Shown on the page as the direct line. Sample address until the real inbox is confirmed.
export const CONTACT_EMAIL = "hello@nimish.photo";

export const enquiryFields = ["name", "email", "artist", "date", "city", "message"] as const;
export type EnquiryField = (typeof enquiryFields)[number];

export const enquiryLimits: Record<EnquiryField, number> = {
  name: 100,
  email: 200,
  artist: 120,
  date: 60,
  city: 80,
  message: 4000,
};

export type EnquiryState = {
  status: "idle" | "sent" | "invalid" | "failed";
  /** Values echoed back after a failed attempt so nothing typed is lost. */
  fields: Partial<Record<EnquiryField, string>>;
  errors: Partial<Record<EnquiryField, string>>;
  /** First name and address for the confirmation. */
  sentTo?: { name: string; email: string };
};

export const initialEnquiry: EnquiryState = { status: "idle", fields: {}, errors: {} };
