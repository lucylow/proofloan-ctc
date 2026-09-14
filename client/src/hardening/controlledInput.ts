export function sanitizeTextInput(value: string, maxLength = 500) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, maxLength);
}

export function sanitizeSearchQuery(value: string) {
  return sanitizeTextInput(value, 120).trim();
}
