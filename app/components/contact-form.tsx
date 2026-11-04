"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendEnquiry } from "../actions/contact";
import {
  CONTACT_EMAIL,
  enquiryLimits,
  initialEnquiry,
  type EnquiryField,
} from "../lib/contact";
import { Arrow } from "./symbols";

type FieldProps = {
  name: EnquiryField;
  label: string;
  value?: string;
  error?: string;
  required?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
};

function Field({
  name,
  label,
  value,
  error,
  required,
  type = "text",
  autoComplete,
  placeholder,
  multiline,
}: FieldProps) {
  const id = `enquiry-${name}`;
  const shared = {
    id,
    name,
    required,
    placeholder,
    defaultValue: value,
    maxLength: enquiryLimits[name],
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div className={`enquiry-field enquiry-field-${name}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea {...shared} rows={5} />
      ) : (
        <input {...shared} type={type} autoComplete={autoComplete} />
      )}
      {error && (
        <p className="enquiry-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function EnquiryForm({ onAgain }: { onAgain: () => void }) {
  const [state, formAction, pending] = useActionState(sendEnquiry, initialEnquiry);
  const form = useRef<HTMLFormElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);

  // Stamp when the visitor started, and move focus to whatever needs it next.
  useEffect(() => {
    if (startedAt.current && !startedAt.current.value) {
      startedAt.current.value = String(Date.now());
    }
    if (state.status === "sent") confirmation.current?.focus();
    if (state.status === "invalid") {
      form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  if (state.status === "sent") {
    const name = state.sentTo?.name;
    return (
      <div className="enquiry-sent" role="status">
        <span className="enquiry-sent-stamp" aria-hidden="true">
          RECEIVED
        </span>
        <h3 ref={confirmation} tabIndex={-1} className="film-type">
          It’s in.
        </h3>
        <p>
          {name ? `Thanks, ${name}. ` : "Thanks. "}I’ll write back to{" "}
          <strong>{state.sentTo?.email}</strong>.
        </p>
        <button type="button" className="enquiry-again" onClick={onAgain}>
          WRITE ANOTHER <Arrow />
        </button>
      </div>
    );
  }

  const { fields, errors } = state;
  return (
    <form ref={form} action={formAction} className="enquiry" aria-describedby="enquiry-note">
      <div className="enquiry-grid">
        <Field name="name" label="YOUR NAME" value={fields.name} error={errors.name} required autoComplete="name" />
        <Field
          name="email"
          label="EMAIL"
          type="email"
          value={fields.email}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Field name="artist" label="ARTIST / EVENT" value={fields.artist} placeholder="Who’s playing" />
        <Field name="date" label="DATE" value={fields.date} placeholder="e.g. 14 Dec" />
        <Field name="city" label="CITY" value={fields.city} autoComplete="address-level2" />
        <Field
          name="message"
          label="THE BRIEF"
          value={fields.message}
          error={errors.message}
          required
          multiline
          placeholder="Venue, set times, what you need the photographs for."
        />
      </div>

      {/* Left empty by people; bots fill it. Hidden from sight and assistive tech. */}
      <div className="enquiry-trap" aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAt} type="hidden" name="startedAt" />

      <div className="enquiry-actions">
        <button type="submit" className="enquiry-send film-paper" disabled={pending}>
          <span>{pending ? "SENDING…" : "SEND IT"}</span>
          <Arrow />
        </button>
        <p id="enquiry-note" className="enquiry-note" aria-live="polite">
          {state.status === "failed" ? (
            <>
              That didn’t go through. Try again, or write to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </>
          ) : (
            <>
              * Required. Prefer email? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}

/** The booking form. "Write another" remounts it with a clean slate. */
export function ContactForm() {
  const [round, setRound] = useState(0);
  return <EnquiryForm key={round} onAgain={() => setRound((value) => value + 1)} />;
}
