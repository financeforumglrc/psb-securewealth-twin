/**
 * Global Error Handler Middleware — Production-Grade
 * Handles all error types with consistent response format
 */
const { AppError, errorResponse } = require('../utils/errors');

const isDev = process.env.NODE_ENV === 'development';

const errorHandler = (err, req, res, next) => {
    // Log all errors with context
    const logContext = {
        error: err.message,
        code: err.code || err.name || 'UNKNOWN',
        stack: err.stack?.split('\n').slice(0, 5).join('\n'),
        path: req.path,
        method: req.method,
        ip: req.ip || req.socket?.remoteAddress,
        timestamp: new Date().toISOString()
    };

    if (err.statusCode >= 500 || !err.isOperational) {
        console.error('Server Error:', JSON.stringify(logContext, null, 2));
    } else {
        console.warn('Client Error:', JSON.stringify(logContext, null, 2));
    }

    // Use the centralized error response
    return errorResponse(res, err);
};

module.exports = { errorHandler };
