import { AllowNull, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'Locations',
  timestamps: true,
  modelName: 'Location',
})
export class Location extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(128),
  })
  name!: string;

  @Column({
    type: DataType.STRING(64),
  })
  type?: string;

  @Column({
    type: DataType.STRING(64),
  })
  dimension?: string;
}
