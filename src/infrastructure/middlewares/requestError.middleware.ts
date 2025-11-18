import { NextFunction, Request, Response } from 'express';

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Not found: ${req.method} ${req.originalUrl}`,
    status: 404,
  });
};

export const createErrorHandlerMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.err = err;

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    status: statusCode,
  });
  next(err);
};
