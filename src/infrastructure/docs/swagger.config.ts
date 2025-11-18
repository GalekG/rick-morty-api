// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerJsdoc = require('swagger-jsdoc');

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
  apis: ['./src/infrastructure/routes/*.route.{ts,js}'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
