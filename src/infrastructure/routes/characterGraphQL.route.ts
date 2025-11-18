import { Router } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from '../graphql/schema';

/**
 * @swagger
 * tags:
 *   - name: GraphQL
 *     description: Main endpoint for all Rick and Morty character queries.
 */
export const graphQLRouter = Router();

/**
 * @swagger
 * /api/graphql:
 *   post:
 *     tags: [GraphQL]
 *     summary: Executes a GraphQL query.
 *     description: |
 *       Main GraphQL endpoint for querying Rick & Morty data.

 *       ### Available Query:
 *       ```graphql
 *       query GetCharactersPage(
 *         $page: Int,
 *         $filters: CharacterFilterInput
 *       ) {
 *         characters(page: $page, filters: $filters) {
 *           total
 *           page
 *           items {
 *             id
 *             name
 *             status
 *             species
 *             type
 *             gender
 *             image
 *             created
 *             origin { id name type dimension }
 *             location { id name type dimension }
 *           }
 *         }
 *       }
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: GraphQL query string.
 *               variables:
 *                 type: object
 *                 description: Query variables (optional).
 *           examples:
 *             SimpleQuery:
 *               summary: Get default characters page
 *               value:
 *                 query: |
 *                   query {
 *                     characters {
 *                       total
 *                       page
 *                       items { id name status }
 *                     }
 *                   }
 *             FullQueryWithFilters:
 *               summary: Search characters with filters
 *               value:
 *                 query: |
 *                   query GetCharactersPage(
 *                     $page: Int,
 *                     $filters: CharacterFilterInput
 *                   ) {
 *                     characters(page: $page, filters: $filters) {
 *                       total
 *                       page
 *                       items {
 *                         id
 *                         name
 *                         status
 *                         species
 *                         gender
 *                         origin { name }
 *                         location { name }
 *                       }
 *                     }
 *                   }
 *                 variables:
 *                   page: 1
 *                   filters:
 *                     name: "Rick"
 *                     status: "Alive"
 *                     gender: "Male"
 *                     origin: "Earth"
 *     responses:
 *       200:
 *         description: GraphQL executed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     characters:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id: { type: string }
 *                               name: { type: string }
 *                               status: { type: string }
 *                               species: { type: string }
 *                               type: { type: string }
 *                               gender: { type: string }
 *                               image: { type: string }
 *                               created: { type: string }
 *                               origin:
 *                                 type: object
 *                                 properties:
 *                                   id: { type: string }
 *                                   name: { type: string }
 *                                   type: { type: string }
 *                                   dimension: { type: string }
 *                               location:
 *                                 type: object
 *                                 properties:
 *                                   id: { type: string }
 *                                   name: { type: string }
 *                                   type: { type: string }
 *                                   dimension: { type: string }
 *       400:
 *         description: Invalid GraphQL query syntax or variables.
 *       500:
 *         description: Internal server error from API or resolver.
 *
 *   get:
 *     tags: [GraphQL]
 *     summary: GraphiQL Playground
 *     description: Returns the interactive GraphiQL interface for testing queries.
 *     responses:
 *       200:
 *         description: HTML for GraphiQL interface.
 */

graphQLRouter.use(
  '/',
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: { req },
    customFormatErrorFn: (err) => {
      req.log.error({ msg: 'GraphQL Error', gqlError: err.message, stack: err.stack });
      return {
        message: err.message,
        locations: err.locations,
        path: err.path,
      };
    },
  })),
);

export default graphQLRouter;
