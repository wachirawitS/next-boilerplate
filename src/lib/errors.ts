export class ApiError extends Error {
  constructor(public readonly status: number, public readonly fieldErrors: Record<string, string> = {}) {
    super("คำขอไม่สำเร็จ");
  }

  static fromResponse(status: number, body: unknown) {
    const payload = typeof body === "object" && body !== null ? body as { fieldErrors?: Record<string, string> } : {};
    return new ApiError(status, payload.fieldErrors ?? {});
  }
}
