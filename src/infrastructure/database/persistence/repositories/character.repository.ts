import { Location } from '../../models/Location.model';
import { Character } from '../../models/Character.model';
import { sequelize } from '../../db';
import { Op } from 'sequelize';
import { FilterArgs } from '../../../../domain/models/character.model';

export class CharacterSequelizeRepository {
  async count(): Promise<number> {
    return await Character.count();
  }

  async paginate(
    page: number,
    limit: number,
    filters?: FilterArgs,
  ): Promise<{ count: number; rows: Character[] }> {
    const whereCondition: any = {};
    let includeOrigin = false;
    const locationWhere: any = {};

    if (filters) {
      if (filters.id) whereCondition.id = filters.id;
      if (filters.name) whereCondition.name = { [Op.iLike]: `%${filters.name}%` };
      if (filters.status) whereCondition.status = filters.status;
      if (filters.species) whereCondition.species = filters.species;
      if (filters.gender) whereCondition.gender = filters.gender;

      if (filters.origin) {
        includeOrigin = true;
        locationWhere.name = { [Op.iLike]: `%${filters.origin}%` };
      }
    }

    const offset = (page - 1) * limit;

    return Character.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Location,
          as: 'origin',
          where: locationWhere,
          required: includeOrigin,
        },
        {
          model: Location,
          as: 'currentLocation',
        },
      ],
    });
  }

  async insertCharactersTransaction(data: any[]) {
    await sequelize.transaction(async (t) => {
      for (const charData of data) {
        let originLocation: Location | undefined = undefined;
        let currentLocation: Location | undefined = undefined;

        if (charData.origin?.id)
          [originLocation] = await Location.findOrCreate({
            where: { id: `${charData.origin.id}` },
            defaults: {
              id: `${charData.origin.id}`,
              name: charData.origin.name,
              type: charData.origin.type,
              dimension: charData.origin.dimension,
            },
            transaction: t,
          });

        if (charData.location?.id)
          [currentLocation] = await Location.findOrCreate({
            where: { id: `${charData.location.id}` },
            defaults: {
              id: `${charData.location.id}`,
              name: charData.location.name,
              type: charData.location.type,
              dimension: charData.location.dimension,
            },
            transaction: t,
          });

        await Character.findOrCreate({
          where: { id: `${charData.id}` },
          defaults: {
            id: `${charData.id}`,
            name: charData.name,
            status: charData.status,
            species: charData.species,
            type: charData.type,
            gender: charData.gender,
            image: charData.image,
            created: new Date(charData.created),
            originLocationId: originLocation?.id,
            currentLocationId: currentLocation?.id,
          },
          transaction: t,
        });
      }
    });
  }

  async findAll(): Promise<Character[]> {
    return await Character.findAll();
  }
}
