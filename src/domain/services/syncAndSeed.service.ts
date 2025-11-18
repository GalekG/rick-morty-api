import { Logger } from 'pino';
import { CharacterSequelizeRepository } from '../../infrastructure/database/persistence/repositories/character.repository';
import { CharacterAdapter } from '../../infrastructure/database/persistence/adapters/character.adapter';
import { CharacterModel } from '../models/character.model';

export class SyncAndSeedService {
  constructor(
    private readonly persistence: CharacterSequelizeRepository,
    private readonly adapter: CharacterAdapter,
  ) {}

  public async run(logger: Logger): Promise<void> {
    try {
      const characterCount = await this.persistence.count();

      if (characterCount >= 15) {
        logger.warn('Initial seeding skipped: Database already contains at least 15 characters.');
        return;
      }

      logger.info('Starting initial database population (seeding) with 15 characters...');

      const charactersToFetch = 15;
      const apiResponse = await this.adapter.fetchCharacters(1);

      const apiCharacters: CharacterModel[] = apiResponse.items.slice(0, charactersToFetch);

      if (apiCharacters.length === 0) {
        logger.warn('Could not fetch characters from the external API for seeding.');
        return;
      }

      await this.persistence.insertCharactersTransaction(apiCharacters);

      logger.info(
        `✅ Initial seeding completed successfully: ${apiCharacters.length} characters stored.`,
      );
    } catch (error) {
      logger.error({ error }, '❌ Error during database sync or seeding process.');
    }
  }
}
