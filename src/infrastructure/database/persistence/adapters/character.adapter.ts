import axios from 'axios';
import { CharacterGender, CharacterStatus } from '../../../../domain/constants/character.constant';

interface FilterArgs {
  name?: string;
  status?: CharacterStatus;
  species?: string;
  gender?: CharacterGender;
}

export class CharacterAdapter {
  private baseUrl = process.env.RICK_MORTY_API_URL;

  async fetchCharacters(page: number, filters?: FilterArgs) {
    const query = this.buildFectchCharactersQuery(
      page,
      filters as Record<string, string | number | undefined>,
    );

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

  async fetchCharactersByIds(ids: number | string[]) {
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

  private buildFectchCharactersQuery(
    page: number,
    filter?: Record<string, string | number | undefined>,
  ): string {
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

  private buildFectchCharactersQueryByIds(ids: number | string[]): string {
    const idsString = Array.isArray(ids) ? ids.join(', ') : ids.toString();
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
