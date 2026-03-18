import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from '../database/database';

export class Granskning extends Model {
  public id!: number;
  public name!: string;
}

Granskning.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    tableName: 'granskningar',
    sequelize: sequelizeInstance,
  },
);
