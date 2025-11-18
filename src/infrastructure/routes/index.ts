import { Application, Response } from 'express';
import graphQLRouter from './characterGraphQL.route';

export const initializeRoutes = (app: Application): void => {
  app.get('/api', (_, res: Response) => {
    res.status(200).json({ message: 'Welcome to the Rick and Morty API' });
  });

  app.get('/api/health', (_, res: Response) => {
    res.status(200).send();
  });

  app.get('/api/error', () => {
    throw new Error('Test error');
  });

  app.use('/api/graphql', graphQLRouter);
};
