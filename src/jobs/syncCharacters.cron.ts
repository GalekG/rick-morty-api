import { Logger } from 'pino';
import { Response, Request } from 'express';
import { Character } from '../infrastructure/database/models/Character.model';
import { Location } from '../infrastructure/database/models/Location.model';
import { CharacterSequelizeRepository } from '../infrastructure/database/persistence/repositories/character.repository';
import { CharacterAdapter } from '../infrastructure/database/persistence/adapters/character.adapter';

export const syncCharacters = async <T extends Request & { log: Logger }>(
  req: T,
  res?: Response,
): Promise<Response<any, Record<string, any>>> => {
  try {
    const repository = new CharacterSequelizeRepository();
    const adapter = new CharacterAdapter();

    const characteres = await repository.findAll();

    if (!characteres?.length)
      return res?.status(200).json({ message: 'No characters to sync' }) as Response<
        any,
        Record<string, any>
      >;

    const ids = characteres.map((c) => c.id as string);

    const apiResponse = await adapter.fetchCharactersByIds(ids);
    const { items, errors } = apiResponse;

    if (errors) {
      req.log.error('GraphQL error:', errors);
      return res?.status(500).json({ error: 'GraphQL error' }) as Response<
        any,
        Record<string, any>
      >;
    }

    if (!items?.length) {
      return res?.status(200).json({ message: 'No characters to sync' }) as Response<
        any,
        Record<string, any>
      >;
    }

    const characters: any[] = [];
    const locations = new Map<string, any>();

    items.forEach((result: any) => {
      const character = {
        id: result.id,
        name: result.name,
        status: result.status,
        species: result.species,
        type: result.type,
        gender: result.gender,
        image: result.image,
        created: result.created,
        originLocationId: result.origin?.id,
        currentLocationId: result.location?.id,
      };

      const originLocation = {
        id: result.origin?.id,
        name: result.origin?.name,
        type: result.origin?.type,
        dimension: result.origin?.dimension,
        created: result.origin?.created,
      };

      const currentLocation = {
        id: result.location?.id,
        name: result.location?.name,
        type: result.location?.type,
        dimension: result.location?.dimension,
        created: result.location?.created,
      };

      originLocation.id && locations.set(originLocation.id, originLocation);
      currentLocation.id && locations.set(currentLocation.id, currentLocation);
      characters.push(character);
    });

    await Character.bulkCreate(characters, {
      updateOnDuplicate: [
        'id',
        'name',
        'status',
        'species',
        'type',
        'gender',
        'image',
        'created',
        'originLocationId',
        'currentLocationId',
      ],
    });

    await Location.bulkCreate(Array.from(locations.values()), {
      updateOnDuplicate: ['id', 'name', 'type', 'dimension'],
    });

    req.log.info(`Sync completed. Updated ${characters.length} characters`);

    return res?.status(200).json({
      message: 'Sync completed',
      data: { total: characters.length },
    }) as Response<any, Record<string, any>>;
  } catch (error: any) {
    const errors = error.response?.data.errors;

    req.log.error({
      msg: 'Error getting characters from Rick and Morty API',
      error: errors,
    });
    return res?.status(500).json({
      error: 'Error getting characters from Rick and Morty API',
      details: errors,
    }) as Response<any, Record<string, any>>;
  }
};
