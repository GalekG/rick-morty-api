import { Logger } from 'pino';
import { Dialect } from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Character } from './models/Character.model';
import { Location } from './models/Location.model';

const dbConfig: SequelizeOptions = {
  dialect: process.env.DB_DIALECT as Dialect,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
  define: { underscored: false },
  models: [Character, Location],
};

export let sequelize!: Sequelize;

export const initializeDB = async (logger: Logger): Promise<void> => {
  if (sequelize) {
    logger.warn('Sequelize already initialized.');
    return;
  }

  if (
    !dbConfig.database ||
    !dbConfig.username ||
    !dbConfig.password ||
    !dbConfig.host ||
    !dbConfig.dialect
  ) {
    logger.error('Missing one or more critical database environment variables.');
    throw new Error('Database configuration missing.');
  }

  try {
    logger.info(
      `Initializing Sequelize connection on ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    );

    sequelize = new Sequelize(dbConfig);

    await sequelize.authenticate();
    logger.info(
      `✅ ${dbConfig.dialect.toUpperCase()} connection established successfully to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({
      msg: `❌ Unable to connect to ${dbConfig.dialect.toUpperCase()} database: ${errorMessage}`,
      error,
    });
    throw error;
  }
};
