import 'dotenv/config';
import express, { Response } from 'express';
import pino from 'pino';
import cors from 'cors';
import {
  createPinoHttpMiddleware,
  customLoggingMiddleware,
} from './shared/infrastructure/middlewares/logger.middleware';
import {
  createErrorHandlerMiddleware,
  notFoundMiddleware,
} from './shared/infrastructure/middlewares/requestError.middleware';

const isProduction = process.env.APP_ENV === 'production';

const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      messageKey: 'msg',
      ignore: 'pid,hostname',
    },
  },
});

logger.info('Starting Rick and Morty API...');

const PORT = process.env.APP_PORT || 3000;

const app = express();

app.use(createPinoHttpMiddleware(logger));
app.use(customLoggingMiddleware);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());

app.get('/', (_, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Rick and Morty API' });
});

app.get('/health', (_, res: Response) => {
  res.status(200).send();
});

app.get('/error', () => {
  throw new Error('Test error');
});

app.use(notFoundMiddleware);
app.use(createErrorHandlerMiddleware);

async function startServer() {
  app.listen(PORT, () => {
    logger.info(
      `🚀 Server started and running on port ${PORT} in ${process.env.APP_ENV} environment`,
    );
  });
}

startServer();
