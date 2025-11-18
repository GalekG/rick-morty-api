import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Location } from './Location.model';
import { CHARACTER_GENDER, CHARACTER_STATUS } from '../../../domain/constants/character.constant';

@Table({
  tableName: 'Characters',
  timestamps: true,
  modelName: 'Character',
})
export class Character extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  public id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(128),
  })
  public name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(CHARACTER_STATUS)),
  })
  public status!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(64),
  })
  public species!: string;

  @Column({
    type: DataType.STRING(64),
  })
  public type!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(CHARACTER_GENDER)),
  })
  public gender!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  public image!: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  public created!: Date;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public originLocationId?: string | null;

  @BelongsTo(() => Location, 'originLocationId')
  public origin?: Location;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public currentLocationId?: string | null;

  @BelongsTo(() => Location, 'currentLocationId')
  public currentLocation?: Location;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
