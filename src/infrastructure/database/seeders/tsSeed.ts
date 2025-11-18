import { Logger } from 'pino';
import { CharacterSequelizeRepository } from '../persistence/repositories/character.repository';
import { CharacterAdapter } from '../persistence/adapters/character.adapter';

interface LocationApiData {
  id: number | null;
  name: string;
  type: string;
  dimension: string;
  created: string;
}

interface CharacterApiData {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: LocationApiData;
  location: LocationApiData;
  image: string;
  created: string;
}

export const syncAndSeedDB = async (logger: Logger): Promise<void> => {
  const persistence = new CharacterSequelizeRepository();
  const adapter = new CharacterAdapter();

  try {
    const characterCount = await persistence.count();

    if (characterCount >= 15) {
      logger.warn('Initial seeding skipped: Database already contains at least 15 characters.');
      return;
    }

    logger.info('Starting initial database population (seeding) with 15 characters...');

    const charactersToFetch = 15;
    const apiResponse = await adapter.fetchCharacters(1);

    const apiCharacters: CharacterApiData[] = apiResponse.items.slice(0, charactersToFetch);

    if (apiCharacters.length === 0) {
      logger.warn('Could not fetch characters from the external API for seeding.');
      return;
    }

    await persistence.insertCharactersTransaction(apiCharacters);

    logger.info(
      `✅ Initial seeding completed successfully: ${apiCharacters.length} characters stored.`,
    );
  } catch (error) {
    logger.error({ error }, '❌ Error during database sync or seeding process.');
  }
};
