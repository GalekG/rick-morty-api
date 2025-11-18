import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
} from 'graphql';
import { characterResolver } from '../../application/getCharacters.resolver';

const LocationType = new GraphQLObjectType({
  name: 'Location',
  description: 'Location of a character (origin or current location)',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    dimension: { type: GraphQLString },
  }),
});

const CharacterType = new GraphQLObjectType({
  name: 'Character',
  description: 'A character from Rick and Morty',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(GraphQLString) },
    species: { type: GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    gender: { type: GraphQLNonNull(GraphQLString) },
    image: { type: GraphQLString },
    created: { type: GraphQLNonNull(GraphQLString) },
    origin: {
      type: LocationType,
      description: 'Origin location of the character',
      resolve: (character) => character.origin,
    },
    location: {
      type: LocationType,
      description: 'Last known location of the character',
      resolve: (character) => character.currentLocation,
    },
  }),
});

const CharactersPageType = new GraphQLObjectType({
  name: 'CharactersPage',
  description: 'Paginated result of character search',
  fields: () => ({
    total: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'Total number of characters found',
    },
    page: { type: GraphQLNonNull(GraphQLInt), description: 'Current page' },
    items: {
      type: GraphQLNonNull(GraphQLList(CharacterType)),
      description: 'List of characters in the current page',
    },
  }),
});

const StatusEnum = new GraphQLEnumType({
  name: 'StatusEnum',
  values: {
    Alive: { value: 'Alive' },
    Dead: { value: 'Dead' },
    unknown: { value: 'unknown' },
  },
});

const GenderEnum = new GraphQLEnumType({
  name: 'GenderEnum',
  values: {
    Female: { value: 'Female' },
    Male: { value: 'Male' },
    Genderless: { value: 'Genderless' },
    unknown: { value: 'unknown' },
  },
});

const CharacterFilterInput = new GraphQLInputObjectType({
  name: 'CharacterFilterInput',
  description: 'Filters for character search',
  fields: {
    id: { type: GraphQLString, description: 'Filter by character ID' },
    name: { type: GraphQLString, description: 'Filter by character name (partial)' },
    status: { type: StatusEnum, description: 'Filter by status (Alive, Dead, unknown)' },
    species: { type: GraphQLString, description: 'Filter by species' },
    gender: { type: GenderEnum, description: 'Filter by gender' },
    origin: { type: GraphQLString, description: 'Filter by origin location name' },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    characters: {
      type: CharactersPageType,
      description: 'Get a paginated list of characters with filters',
      args: {
        page: { type: GraphQLInt, defaultValue: 1, description: 'Page number' },
        limit: {
          type: GraphQLInt,
          defaultValue: 20,
          description: 'Limit of results per page',
        },
        filters: { type: CharacterFilterInput, description: 'Filters object' },
      },
      resolve: characterResolver.run.bind(characterResolver),
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
});
