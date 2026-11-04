"use server";

import {
  enquiryFields,
  enquiryLimits,
  type EnquiryField,
  type EnquiryState,
} from "../lib/contact";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// A person takes longer than this to fill the form; a script does not.
const MIN_FILL_MS = 2500;

const labels: Record<EnquiryField, string> = {
  name: "Name",
  email: "Email",
  artist: "Artist / event",
  date: "Date",
  city: "City",
  message: "Message",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Sends a booking enquiry to Nimish's inbox through Resend's REST API (free tier:
 * 3,000 emails a month, 100 a day). No SDK: one fetch, key kept on the server.
 */
export async function sendEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const fields = Object.fromEntries(
    enquiryFields.map((field) => {
      const raw = formData.get(field);
      return [field, typeof raw === "string" ? raw.trim().slice(0, enquiryLimits[field]) : ""];
    }),
  ) as Record<EnquiryField, string>;

  // Spam guards. A bot that fills the hidden field, or submits faster than any
  // person could type, gets a quiet "sent" and nothing is delivered.
  const trap = formData.get("website");
  const startedAt = Number(formData.get("startedAt"));
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
  if ((typeof trap === "string" && trap.length > 0) || tooFast) {
    return { status: "sent", fields: {}, errors: {}, sentTo: { name: "", email: fields.email } };
  }

  const errors: EnquiryState["errors"] = {};
  if (fields.name.length < 2) errors.name = "Tell me who’s writing.";
  if (!EMAIL.test(fields.email)) errors.email = "I need an email address I can reply to.";
  if (fields.message.length < 10) errors.message = "A line or two about the show, please.";
  if (Object.keys(errors).length > 0) return { status: "invalid", fields, errors };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "NIMISH. website <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set.");
    return { status: "failed", fields, errors: {} };
  }

  const rows = enquiryFields
    .filter((field) => field !== "message" && fields[field])
    .map((field) => [labels[field], fields[field]] as const);
  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    fields.message,
    "",
    "Sent from the contact form on the NIMISH. website. Reply to this email to answer.",
  ].join("\n");
  const html = `<table cellpadding="6" style="font-family:monospace;font-size:14px;border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="color:#666;vertical-align:top">${label}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
    )
    .join("")}</table><p style="font-family:monospace;font-size:14px;white-space:pre-wrap">${escapeHtml(
    fields.message,
  )}</p><p style="font-family:monospace;font-size:12px;color:#888">Sent from the contact form on the NIMISH. website. Reply to this email to answer.</p>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        reply_to: fields.email,
        subject: `Booking enquiry: ${fields.artist || fields.name}${fields.date ? `, ${fields.date}` : ""}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`Contact form: Resend answered ${response.status}: ${await response.text()}`);
      return { status: "failed", fields, errors: {} };
    }
  } catch (error) {
    console.error("Contact form: could not reach Resend.", error);
    return { status: "failed", fields, errors: {} };
  }

  return {
    status: "sent",
    fields: {},
    errors: {},
    sentTo: { name: fields.name.split(/\s+/)[0], email: fields.email },
  };
}
