import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/database';
import { Review } from './Review';

// Check attributes interface
export interface CheckAttributes {
  id: number;
  created_at: Date;
  updated_at: Date | null;
  review: number;
  requirement: string | null;
  status: number | null;
  comment: string | null;
  flag: number | null;
}

// Optional fields for creation (id, created_at, updated_at are auto-generated)
export interface CheckCreationAttributes extends Optional<CheckAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Check model class
export class Check extends Model<CheckAttributes, CheckCreationAttributes> implements CheckAttributes {
  public id!: number;
  public created_at!: Date;
  public updated_at!: Date | null;
  public review!: number;
  public requirement!: string | null;
  public status!: number | null;
  public comment!: string | null;
  public flag!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Check model
Check.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false, // Handled by Oracle sequence and trigger
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
    review: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reviews',
        key: 'id',
      },
    },
    requirement: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '0=FAIL, 1=PASS, 2=IRRELEVANT, 3=NOT_ASSESSED',
    },
    comment: {
      type: DataTypes.TEXT, // CLOB in Oracle
      allowNull: true,
      field: 'check_comment', // Maps to check_comment in database (comment is Oracle reserved word)
    },
    flag: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Boolean flag: 0 or 1',
    },
  },
  {
    sequelize,
    tableName: 'checks',
    timestamps: false, // We manage timestamps manually to match Oracle schema
    indexes: [
      {
        unique: true,
        fields: ['review', 'requirement'],
        name: 'uq_checks_review_req',
      },
    ],
  }
);

// Define associations
Review.hasMany(Check, {
  foreignKey: 'review',
  as: 'checks',
  onDelete: 'CASCADE',
});

Check.belongsTo(Review, {
  foreignKey: 'review',
  as: 'reviewData',
});
