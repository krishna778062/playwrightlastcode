export class ApiError extends Error {
  constructor(
    public statusCode: number, // ✅ Was 'status', now 'statusCode'
    message: string, // ✅ Not public anymore
    public url: string,
    public response?: any,
    public cause?: Error // ✅ Add cause property
  ) {
    super(message);
  }
}
