/**
 * Custom Error Classes for DS Financial API
 * Provides standardized error responses across the platform
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTHENTICATION_REQUIRED') {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

class PaymentError extends AppError {
  constructor(message = 'Payment processing error', details = null) {
    super(message, 402, 'PAYMENT_ERROR', details);
  }
}

class AIError extends AppError {
  constructor(message = 'AI service temporarily unavailable', details = null) {
    super(message, 503, 'AI_SERVICE_ERROR', details);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

function errorResponse(res, error) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle known error types
  if (error.name === 'SqliteError' || error.message?.includes('SQLITE')) {
    return res.status(400).json({
      success: false,
      error: 'Database error',
      code: 'DATABASE_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }

  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Default error
  console.error('Unhandled error:', error);
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  PaymentError,
  AIError,
  DatabaseError,
  errorResponse
};
