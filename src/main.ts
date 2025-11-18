import 'dotenv/config';
import express from 'express';
import pino from 'pino';
import cors from 'cors';
import {
  createPinoHttpMiddleware,
  customLoggingMiddleware,
} from './infrastructure/middlewares/logger.middleware';
import {
  createErrorHandlerMiddleware,
  notFoundMiddleware,
} from './infrastructure/middlewares/requestError.middleware';
import { RedisCacheService } from './infrastructure/cache/client.redis';
import { initializeRoutes } from './infrastructure/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/docs/swagger.config';
import cron from 'node-cron';
import { syncCharacters } from './jobs/syncCharacters.cron';
import { initializeDB } from './infrastructure/database/db';
import { SyncAndSeedService } from './domain/services/syncAndSeed.service';
import { CharacterSequelizeRepository } from './infrastructure/database/persistence/repositories/character.repository';
import { CharacterAdapter } from './infrastructure/database/persistence/adapters/character.adapter';

const app = express();

/* LOGGER */
const logger = pino({
  level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
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

/* Logger middleware */
app.use(createPinoHttpMiddleware(logger));
app.use(customLoggingMiddleware);
/* Logger middleware */
/* LOGGER */

const PORT = process.env.APP_PORT || 3000;

/* CORS CONFIGURATION */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);
/* CORS CONFIGURATION */

app.use(express.json());

initializeRoutes(app);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

/* CRON JOB */
cron.schedule('0 */12 * * *', () => {
  syncCharacters({ log: logger } as any);
  logger.info('Scheduled syncCharacters job every 12 hours');
});
/* CRON JOB */

/* ERROR HANDLING */
app.use(notFoundMiddleware);
app.use(createErrorHandlerMiddleware);
/* ERROR HANDLING */

async function startServer() {
  const cacheServiceSingleton = RedisCacheService.getSingletonInstance();
  const syncAndSeedService = new SyncAndSeedService(
    new CharacterSequelizeRepository(),
    new CharacterAdapter(),
  );

  try {
    try {
      await cacheServiceSingleton.initialize(logger);
    } catch (e) {
      logger.warn({ msg: 'Failed to initialize cache service', error: e });
    }

    try {
      await initializeDB(logger);

      await syncAndSeedService.run(logger);
    } catch (e) {
      logger.error({ msg: 'Failed to initialize database, shutting down.', error: e });
      process.exit(1);
    }

    app.listen(PORT, () => {
      logger.info(
        `🚀 Server started and running on port ${PORT} in ${process.env.APP_ENV} environment`,
      );
    });
  } catch (e) {
    logger.error({ msg: 'Failed to start server', error: e });
    process.exit(1);
  }
}

startServer();
