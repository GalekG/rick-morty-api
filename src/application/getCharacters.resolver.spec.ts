import { characterResolver } from './getCharacters.resolver';
import { CharacterSequelizeRepository } from '../infrastructure/database/persistence/repositories/character.repository';
import { CharacterAdapter } from '../infrastructure/database/persistence/adapters/character.adapter';
import { RedisCacheService } from '../infrastructure/cache/client.redis';
import { CharacterStatus, CharacterGender } from '../domain/constants/character.constant';

jest.mock('../infrastructure/database/persistence/repositories/character.repository');
jest.mock('../infrastructure/database/persistence/adapters/character.adapter');
jest.mock('../infrastructure/cache/client.redis');

describe('CharacterResolver suite test 🧪', () => {
  let resolver: any;

  let mockCharacterRepository: jest.Mocked<CharacterSequelizeRepository>;
  let mockCharacterAdapter: jest.Mocked<CharacterAdapter>;
  let mockCacheInstance: {
    get: jest.Mock;
    set: jest.Mock;
  };

  const mockContext = {
    req: {
      log: {
        info: jest.fn(),
        error: jest.fn(),
      },
    },
  };

  const mockCharacter = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive' as CharacterStatus,
    species: 'Human',
    type: '',
    gender: 'Male' as CharacterGender,
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    originLocationId: '1',
    currentLocationId: '20',
    origin: { id: '1', name: 'Earth (C-137)' },
    currentLocation: { id: '20', name: 'Earth (Replacement Dimension)' },
    created: '2017-11-04T18:48:46.250Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCacheInstance = {
      get: jest.fn(),
      set: jest.fn(),
    };

    (RedisCacheService.getSingletonInstance as jest.Mock).mockImplementation(() => ({
      getCacheService: jest.fn().mockReturnValue(mockCacheInstance),
    }));

    mockCharacterRepository = {
      insertCharactersTransaction: jest.fn().mockResolvedValue(undefined),
      paginate: jest.fn().mockResolvedValue({ count: 1, rows: [mockCharacter] }),
    } as unknown as jest.Mocked<CharacterSequelizeRepository>;

    mockCharacterAdapter = {
      fetchCharacters: jest.fn().mockResolvedValue({
        items: [
          {
            id: 1,
            name: 'Rick Sanchez',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
            origin: { id: '1', name: 'Earth (C-137)' },
            location: { id: '20', name: 'Earth (Replacement Dimension)' },
            created: '2017-11-04T18:48:46.250Z',
          },
        ],
        total: 1,
      }),
    } as unknown as jest.Mocked<CharacterAdapter>;

    resolver = characterResolver;

    (CharacterSequelizeRepository as jest.Mock).mockImplementation(() => mockCharacterRepository);
    (CharacterAdapter as jest.Mock).mockImplementation(() => mockCharacterAdapter);
  });

  it('should be defined ✅', () => {
    expect(resolver).toBeDefined();
  });

  describe('run suite test 🧪', () => {
    it('should return cached data when available ✅', async () => {
      const cachedData = {
        total: 1,
        page: 1,
        items: [mockCharacter],
      };

      mockCacheInstance.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await resolver.run(null, { page: 1 }, mockContext);

      expect(mockCacheInstance.get).toHaveBeenCalledWith('gql:characters:p1:{}');
      expect(mockContext.req.log.info).toHaveBeenCalledWith(
        expect.stringContaining('Cache hit for key'),
      );
      expect(result).toEqual(cachedData);
      expect(mockCharacterAdapter.fetchCharacters).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache the result when no cache is available ✅', async () => {
      mockCacheInstance.get.mockResolvedValue(null);

      const result = await resolver.run(null, { page: 1 }, mockContext);

      expect(mockCacheInstance.get).toHaveBeenCalledWith('gql:characters:p1:{}');
      expect(mockCharacterAdapter.fetchCharacters).toHaveBeenCalledWith(1, undefined);
      expect(mockCharacterRepository.insertCharactersTransaction).toHaveBeenCalled();
      expect(mockCacheInstance.set).toHaveBeenCalled();
      expect(result).toEqual({
        total: 1,
        page: 1,
        items: [mockCharacter],
      });
    });

    it('should fall back to database when API fails ✅', async () => {
      mockCacheInstance.get.mockResolvedValue(null);
      mockCharacterAdapter.fetchCharacters.mockRejectedValue(new Error('API Error'));

      const result = await resolver.run(null, { page: 1 }, mockContext);

      expect(mockCharacterAdapter.fetchCharacters).toHaveBeenCalled();
      expect(mockContext.req.log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'API Rick and Morty failed. Falling back to local DB',
        }),
      );
      expect(mockCharacterRepository.paginate).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual({
        total: 1,
        page: 1,
        items: [mockCharacter],
      });
    });

    it('should apply filters when provided ✅', async () => {
      const filters = {
        status: 'Alive' as CharacterStatus,
        species: 'Human',
      };

      await resolver.run(null, { page: 2, filters }, mockContext);

      expect(mockCharacterAdapter.fetchCharacters).toHaveBeenCalledWith(2, filters);
      const expectedCacheKey = 'gql:characters:p2:{"status":"Alive","species":"Human"}';
      expect(mockCacheInstance.get).toHaveBeenCalledWith(expectedCacheKey.toLowerCase());
    });

    it('should handle errors and throw a user-friendly message ✅', async () => {
      mockCacheInstance.get.mockRejectedValue(new Error('Cache error'));
      mockCharacterAdapter.fetchCharacters.mockRejectedValue(new Error('API Error'));
      mockCharacterRepository.paginate.mockRejectedValue(new Error('DB Error'));

      await expect(resolver.run(null, { page: 1 }, mockContext)).rejects.toThrow(
        'Internal server error while fetching characters from the database.',
      );

      expect(mockContext.req.log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'Error getting characters from local GraphQL resolver (DB)',
        }),
      );
    });
  });
});
