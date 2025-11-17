import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

export const createPinoHttpMiddleware = (logger: Logger) => {
  return pinoHttp({
    logger,
    autoLogging: false,
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
  });
};

export const customLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const requestLogger = req.log;
    const statusCode = res.statusCode;

    const logData = {
      msg: `${req.method} ${req.originalUrl} - ${statusCode} (${duration}ms)`,
      agent: req.get('user-agent'),
      ip: req.ip,
    };

    if (statusCode >= 200 && statusCode < 400) {
      requestLogger.info(logData);
    } else if (statusCode >= 400 && statusCode < 500) {
      requestLogger.warn(logData);
    } else if (statusCode >= 500) {
      requestLogger.error({
        ...logData,
        error: res.err?.message,
      });
    }
  });

  next();
};
