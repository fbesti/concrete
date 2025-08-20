import { Request, Response, NextFunction } from 'express';

interface LogData {
  method: string;
  url: string;
  status: number;
  responseTime: number;
  contentLength?: number | undefined;
  userAgent?: string | undefined;
  ip: string;
  timestamp: string;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request start
  console.log(`→ ${req.method} ${req.url} - ${req.ip} - ${timestamp}`);

  // Override res.end to capture response details
  const originalEnd = res.end.bind(res);

  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Gather log data
    const logData: LogData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime,
      contentLength: res.get('content-length')
        ? parseInt(res.get('content-length')!)
        : undefined,
      userAgent: req.get('user-agent'),
      ip: req.ip || 'unknown',
      timestamp,
    };

    // Color code based on status
    const statusColor = getStatusColor(res.statusCode);
    const timeColor = getTimeColor(responseTime);

    // Log response
    console.log(
      `← ${req.method} ${req.url} ` +
        `${statusColor}${res.statusCode}\x1b[0m ` +
        `${timeColor}${responseTime}ms\x1b[0m ` +
        `${logData.contentLength ? `- ${logData.contentLength}b` : ''}`
    );

    // Log detailed info for errors
    if (res.statusCode >= 400) {
      console.error('Error response details:', {
        ...logData,
        headers: req.headers,
        query: req.query,
        body: req.body,
      });
    }

    // Call original end method
    return originalEnd(chunk, encoding, callback);
  };

  next();
};

// Color helpers
const getStatusColor = (status: number): string => {
  if (status >= 500) return '\x1b[31m'; // Red
  if (status >= 400) return '\x1b[33m'; // Yellow
  if (status >= 300) return '\x1b[36m'; // Cyan
  if (status >= 200) return '\x1b[32m'; // Green
  return '\x1b[0m'; // Reset
};

const getTimeColor = (time: number): string => {
  if (time > 1000) return '\x1b[31m'; // Red for slow requests (>1s)
  if (time > 500) return '\x1b[33m'; // Yellow for medium requests (>500ms)
  if (time > 100) return '\x1b[36m'; // Cyan for fast requests (>100ms)
  return '\x1b[32m'; // Green for very fast requests
};

// Additional middleware for request correlation IDs
export const addRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Simple request ID generator
const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
