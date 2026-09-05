export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly requestId: string | undefined, public readonly fieldErrors: Record<string, string> = {}) {
    super("คำขอไม่สำเร็จ");
  }

  static fromResponse(status: number, body: unknown) {
    const payload = typeof body === "object" && body !== null ? body as { code?: string; requestId?: string; fieldErrors?: Record<string, Array<{ message?: string }>> } : {};
    const fieldErrors = Object.fromEntries(Object.entries(payload.fieldErrors ?? {}).map(([key, errors]) => [key, errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง"]));
    return new ApiError(status, payload.code ?? "REQUEST_FAILED", payload.requestId, fieldErrors);
  }
}
