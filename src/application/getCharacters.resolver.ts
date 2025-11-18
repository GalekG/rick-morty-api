import { Character } from '../infrastructure/database/models/Character.model';
import { CharacterSequelizeRepository } from '../infrastructure/database/persistence/repositories/character.repository';
import { TimeSpent } from '../infrastructure/decorators/timeSpent.decorator';
import { CharacterAdapter } from '../infrastructure/database/persistence/adapters/character.adapter';
import { RedisCacheService } from '../infrastructure/cache/client.redis';
import { FilterArgs } from '../domain/models/character.model';

interface CharacterResolverArgs extends Record<string, string | number | object | undefined> {
  page?: number;
  filters?: FilterArgs;
}

class CharacterResolver {
  @TimeSpent
  public async run(_: any, args: CharacterResolverArgs, context: any) {
    const persistence = new CharacterSequelizeRepository();
    const adapter = new CharacterAdapter();
    const cacheServiceSingleton = RedisCacheService.getSingletonInstance();

    const { page, filters } = args;
    const pageNum = page || 1;

    const filterString = JSON.stringify(filters || {});
    const cacheKey = `gql:characters:p${pageNum}:${filterString}`.toLowerCase();

    try {
      const cacheInstance = await cacheServiceSingleton.getCacheService(context.req.log);
      const cachedData = await cacheInstance.get(cacheKey);

      if (cachedData) {
        context.req.log.info(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(cachedData);
      }

      const result: {
        total: number;
        page: number;
        items: Character[];
      } = {
        total: 0,
        page: pageNum,
        items: [],
      };

      context.req.log.info({
        msg: `Cache MISS, fetching characters from Rick and Morty GraphQL`,
        page,
        filters,
      });

      let isApiSource = false;

      try {
        const response = await adapter.fetchCharacters(pageNum, filters);

        const { items, total } = response;

        await persistence.insertCharactersTransaction(items);

        result.items = items.map((c) => {
          return {
            id: c.id,
            name: c.name,
            status: c.status,
            species: c.species,
            type: c.type,
            gender: c.gender,
            image: c.image,
            originLocationId: c.origin?.id,
            currentLocationId: c.location?.id,
            origin: c.origin,
            currentLocation: c.location,
            created: c.created,
          } as unknown as Character;
        });
        result.total = total ?? 0;

        isApiSource = true;
      } catch (e) {
        context.req.log.error({
          msg: 'API Rick and Morty failed. Falling back to local DB',
          error: e,
        });

        const { count, rows: items } = await persistence.paginate(pageNum, 20, filters);

        result.total = count;
        result.items = items;
      }

      if (isApiSource && result.items.length > 0) {
        const jsonResult = JSON.stringify(result);
        await cacheInstance.set(cacheKey, jsonResult);
        context.req.log.info(`Cached result for key: ${cacheKey}`);
      }

      return result;
    } catch (error: any) {
      console.error(error);
      context.req.log.error({
        msg: 'Error getting characters from local GraphQL resolver (DB)',
        error: error.message,
      });
      throw new Error('Internal server error while fetching characters from the database.');
    }
  }
}

export const characterResolver = new CharacterResolver();
