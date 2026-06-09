export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(message, 404, true, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401, true, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403, true, 'FORBIDDEN');
  }

  static badRequest(message = 'Bad request'): ApiError {
    return new ApiError(message, 400, true, 'BAD_REQUEST');
  }

  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(message, 409, true, 'CONFLICT');
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 500, false, 'INTERNAL_ERROR');
  }

  static unprocessable(message = 'Unprocessable entity'): ApiError {
    return new ApiError(message, 422, true, 'UNPROCESSABLE');
  }

  static tooMany(message = 'Too many requests'): ApiError {
    return new ApiError(message, 429, true, 'TOO_MANY_REQUESTS');
  }
}
