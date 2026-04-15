type EmailSendPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
};

type EmailServiceLike = {
  send: (payload: EmailSendPayload) => Promise<unknown>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendWithRetry(
  emailService: EmailServiceLike,
  payload: EmailSendPayload,
  logContext: string,
  maxAttempts = 2,
) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await emailService.send(payload);
      console.log(`[EMAIL SENT] context=${logContext} to=${payload.to} attempt=${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[EMAIL FAILED] context=${logContext} to=${payload.to} attempt=${attempt} err=${message}`);

      if (attempt < maxAttempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
