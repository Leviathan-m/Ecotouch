import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let isOperational = error.isOperational || false;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    isOperational = true;
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    isOperational = true;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Telegram WebApp auth errors
  if (error.message.includes('Telegram auth')) {
    statusCode = 401;
    message = 'Telegram authentication failed';
    isOperational = true;
  }

  // Blockchain errors
  if (error.message.includes('blockchain') || error.message.includes('contract')) {
    statusCode = 503;
    message = 'Blockchain service temporarily unavailable';
    isOperational = false;
  }

  // Third-party API errors
  if (error.message.includes('API') && statusCode === 500) {
    statusCode = 502;
    message = 'External service error';
    isOperational = false;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        isOperational,
      }),
    },
  });
};
