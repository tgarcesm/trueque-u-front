/** Errores de validación ASP.NET Core: { errors: { Field: ["msg"] } } */
export function parseApiErrorMessages(body: unknown): string[] {
  if (body == null) return [];

  if (typeof body === "string") {
    try {
      return parseApiErrorMessages(JSON.parse(body) as unknown);
    } catch {
      const trimmed = body.trim();
      return trimmed ? [trimmed] : [];
    }
  }

  if (typeof body !== "object") return [];

  const obj = body as Record<string, unknown>;
  const messages: string[] = [];

  const errors = obj.errors;
  if (errors != null && typeof errors === "object" && !Array.isArray(errors)) {
    for (const value of Object.values(errors as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string" && item.trim()) {
            messages.push(item.trim());
          }
        }
      } else if (typeof value === "string" && value.trim()) {
        messages.push(value.trim());
      }
    }
  }

  if (messages.length > 0) return messages;

  if (typeof obj.message === "string" && obj.message.trim()) {
    return [obj.message.trim()];
  }
  if (typeof obj.title === "string" && obj.title.trim()) {
    return [obj.title.trim()];
  }

  return [];
}

export class ApiValidationError extends Error {
  readonly messages: string[];

  constructor(messages: string[]) {
    super(messages[0] ?? "Revisa los datos del formulario.");
    this.name = "ApiValidationError";
    this.messages = messages;
  }
}

export async function parseErrorResponse(res: Response): Promise<string[]> {
  try {
    const body = await res.json();
    const messages = parseApiErrorMessages(body);
    if (messages.length > 0) return messages;
    if (typeof body === "object" && body != null && typeof (body as { message?: string }).message === "string") {
      return [(body as { message: string }).message];
    }
  } catch {
    try {
      const text = await res.text();
      if (text.trim()) return [text.trim()];
    } catch {
      // ignore
    }
  }
  return [];
}
