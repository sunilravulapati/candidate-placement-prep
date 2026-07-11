// backend/src/core/logger.ts
//
// Centralized logging framework for PrepGenie.
// Logs trace operations (upload, parsing, AI structure calls, repairs, DB, errors)
// with standard structured categories, processing time markers, and user context.
//
// Pure module - safe on all runtimes.

export type LogCategory =
  | 'upload'
  | 'parsing'
  | 'ai'
  | 'json_repair'
  | 'database'
  | 'completion'
  | 'storage'
  | 'lifecycle'
  | 'error'
  | 'interview'
  | 'general';

export interface LogContext {
  category: LogCategory;
  userId?: string;
  resumeId?: string;
  modelUsed?: string;
  processingTime?: number; // in milliseconds
  [key: string]: any;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const timeStr = context?.processingTime !== undefined ? ` [${context.processingTime}ms]` : '';
    const categoryStr = context?.category ? ` [${context.category.toUpperCase()}]` : '';
    const userStr = context?.userId ? ` [User:${context.userId}]` : '';
    const resumeStr = context?.resumeId ? ` [Resume:${context.resumeId}]` : '';
    
    // Extract generic context properties
    const extra: Record<string, any> = {};
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        if (!['category', 'userId', 'resumeId', 'modelUsed', 'processingTime'].includes(key)) {
          extra[key] = value;
        }
      }
    }
    const extraStr = Object.keys(extra).length > 0 ? ` | Context: ${JSON.stringify(extra)}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}]${categoryStr}${timeStr}${userStr}${resumeStr} ${message}${extraStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: any, context?: LogContext): void {
    const errDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : { raw: String(error) };
      
    const mergedContext: LogContext = {
      category: 'error',
      ...context,
      errorDetails: errDetails,
    };
    console.error(this.formatMessage('error', message, mergedContext));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
