export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public url: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
