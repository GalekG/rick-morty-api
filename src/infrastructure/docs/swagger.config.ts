/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');

const baseDir = process.env.SWAGGER_SOURCE || 'src';

const apisPath =
  baseDir === 'dist'
    ? `./dist/infrastructure/routes/*.route.js`
    : `./src/infrastructure/routes/*.route.{ts,js}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rick and Morty API Documentation',
      version: '1.0.0',
      description:
        'Swagger documentation for the Rick and Morty API. Includes endpoints for characters, locations, and episodes. Built with Express and TypeScript.',
    },
    servers: [
      {
        url: process.env.BASE_URL,
        description: 'Rick and Morty API Base URL',
      },
    ],
  },
  apis: [apisPath],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
