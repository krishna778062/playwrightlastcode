import path from 'path';
import winston from 'winston';

// Log level configuration
const LOG_LEVELS = {
  silent: 'silent', // No logs
  error: 'error', // Only errors
  warn: 'warn', // Warnings and errors
  info: 'info', // Info, warnings, and errors
  debug: 'debug', // All logs (most verbose)
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

// Get log level from environment variables
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();

  // Check for common environment patterns
  if (process.env.CI) return 'warn'; // Less verbose in CI
  if (process.env.NODE_ENV === 'test') return 'info'; // Moderate verbosity in tests
  if (process.env.NODE_ENV === 'production') return 'error'; // Minimal logs in production

  // Use environment variable if set
  if (envLevel && Object.values(LOG_LEVELS).includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  // Default to debug for development
  return 'debug';
}

// Helper function to get caller information
function getCallerInfo(): { file: string; line: number } | null {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;

  const stack = new Error().stack as any;
  Error.prepareStackTrace = originalPrepareStackTrace;

  // Skip the first 3 frames: Error, getCallerInfo, and the logger method
  const caller = stack[3];
  if (!caller) return null;

  const fileName = path.basename(caller.getFileName());
  const lineNumber = caller.getLineNumber();

  return { file: fileName, line: lineNumber };
}

// Simple Winston-based logger - replaces console.log with structured output
class Logger {
  winston: winston.Logger;

  constructor() {
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const transports: winston.transport[] = [
      // Console output with colors and emojis
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const emoji = this.getEmoji(level);
            const location = meta.file ? ` ${meta.file}:${meta.line}` : '';
            const context = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${emoji}${location} ${message}${context}`;
          })
        ),
      }),
    ];

    // Add file logging for CI/test environments
    if (process.env.CI || process.env.NODE_ENV === 'test') {
      const logsDir = path.join(process.cwd(), 'logs');
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'app.log'),
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const emoji = this.getEmoji(level);
              const location = meta.file ? ` ${meta.file}:${meta.line}` : '';
              const context = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} ${emoji}${location} ${message}${context}`;
            })
          ),
        })
      );
    }

    return winston.createLogger({
      level: getLogLevel(),
      transports,
      exitOnError: false,
    });
  }

  private getEmoji(level: string): string {
    const emojis: Record<string, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return emojis[level] || '📝';
  }

  debug(message: string, data?: any): void {
    const caller = getCallerInfo();
    this.winston.debug(message, { ...data, ...caller });
  }

  info(message: string, data?: any): void {
    const caller = getCallerInfo();
    this.winston.info(message, { ...data, ...caller });
  }

  warn(message: string, data?: any): void {
    const caller = getCallerInfo();
    this.winston.warn(message, { ...data, ...caller });
  }

  error(message: string, error?: Error | any, data?: any): void {
    const caller = getCallerInfo();
    const errorData =
      error instanceof Error
        ? { error: error.message, stack: error.stack, ...data, ...caller }
        : { error, ...data, ...caller };
    this.winston.error(message, errorData);
  }
}

// Single logger instance - no need for modules since file path shows everything
const logger = new Logger();

// Simple replacement for console.log
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | any, data?: any) => logger.error(message, error, data),
};

// Utility functions for log level control
export const logControl = {
  // Set log level programmatically
  setLevel: (level: LogLevel) => {
    logger.winston.level = level;
  },

  // Get current log level
  getLevel: () => logger.winston.level,

  // Available log levels
  levels: LOG_LEVELS,

  // Quick level setters
  silent: () => (logger.winston.level = 'silent'),
  error: () => (logger.winston.level = 'error'),
  warn: () => (logger.winston.level = 'warn'),
  info: () => (logger.winston.level = 'info'),
  debug: () => (logger.winston.level = 'debug'),
};
