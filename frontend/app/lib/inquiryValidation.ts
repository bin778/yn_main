import {
  INQUIRY_CONTENT_MIN,
  INQUIRY_FIELD_LIMITS,
  INQUIRY_NAME_PATTERN,
  INQUIRY_TEL_PATTERN,
  INQUIRY_VALIDATION_MESSAGES,
} from '@/app/constants/contactContent';

export type InquiryFieldValues = {
  name: string;
  tel: string;
  content: string;
};

type ValidationResult =
  | { ok: true; values: InquiryFieldValues }
  | { ok: false; message: string };

export function validateInquiryFields(fields: InquiryFieldValues): ValidationResult {
  const name = fields.name.trim();
  const tel = fields.tel.replace(/\D/g, '');
  const content = fields.content.trim();

  if (!INQUIRY_NAME_PATTERN.test(name)) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.name };
  }

  if (!INQUIRY_TEL_PATTERN.test(tel)) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.tel };
  }

  if (content.length < INQUIRY_CONTENT_MIN) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.contentMin };
  }

  if (content.length > INQUIRY_FIELD_LIMITS.content) {
    return { ok: false, message: INQUIRY_VALIDATION_MESSAGES.contentMax };
  }

  return { ok: true, values: { name, tel, content } };
}
