import axios from 'axios';
import { CharacterModel, FilterArgs } from '../../../../domain/models/character.model';

export class CharacterAdapter {
  private baseUrl = process.env.RICK_MORTY_API_URL;

  /**
   * Fetches characters from the Rick and Morty API.
   *
   * @param {number} page - The page number of the results.
   * @param {FilterArgs} [filters] - Optional filters for the characters.
   * @returns {Promise<{ total: number, page: number, items: Array<CharacterModel> }>} - The total number of characters, the page number, and an array of character objects.
   */
  async fetchCharacters(
    page: number,
    filters?: FilterArgs,
  ): Promise<{
    total: number;
    page: number;
    items: Array<CharacterModel>;
  }> {
    const query = this.buildFectchCharactersQuery(page, filters);

    const response = await axios.post(
      this.baseUrl as string,
      { query },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const apiData = response.data.data.characters;
    const items = apiData.results.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      species: c.species,
      type: c.type,
      gender: c.gender,
      image: c.image,
      created: c.created,
      originLocationId: c.origin?.id || null,
      currentLocationId: c.location?.id || null,
      origin: c.origin,
      location: c.location,
    }));

    return {
      total: apiData.info.count,
      page,
      items,
    };
  }

  async fetchCharactersByIds(ids: (number | string)[]): Promise<{
    items: Array<CharacterModel>;
    errors?: string[];
  }> {
    if (!ids.length) return { items: [], errors: undefined };
    const query = this.buildFectchCharactersQueryByIds(ids);

    const response = await axios.post(
      this.baseUrl as string,
      { query },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const apiData = response.data.data.charactersByIds;
    const items = apiData.results.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      species: c.species,
      type: c.type,
      gender: c.gender,
      image: c.image,
      created: c.created,
      originLocationId: c.origin?.id || null,
      currentLocationId: c.location?.id || null,
      origin: c.origin,
      location: c.location,
    }));

    return { items, errors: response.data.errors };
  }

  private buildFectchCharactersQuery(page: number, filter?: FilterArgs): string {
    let filterString = '';
    if (filter) {
      const filterEntries = Object.entries(filter).filter(([, value]) => value !== undefined);
      if (filterEntries.length > 0) {
        filterString = `filter: { ${filterEntries
          .map(([key, value]) => `${key}: "${value}"`)
          .join(', ')} }`;
      }
    }

    return `query GetCharacters {
        characters(page: ${page}${filterString ? `, ${filterString}` : ''}) {
          results { ${this.buildBaseCharacterQuery()} }
          info { count }
        }
      }`;
  }

  private buildFectchCharactersQueryByIds(ids: (number | string)[]): string {
    const idsString = ids.reduce((acc, id) => [...acc, `${id}`], [] as string[]).join(',');
    return `query GetCharactersByIds { charactersByIds(ids: [${idsString}]) { ${this.buildBaseCharacterQuery()} } }`;
  }

  private buildBaseCharacterQuery(): string {
    return `
      id
      name
      status
      species
      type
      gender
      origin { id name type dimension created }
      location { id name type dimension created }
      image
      created
    `;
  }
}
