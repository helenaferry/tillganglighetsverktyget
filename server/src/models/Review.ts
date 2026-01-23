import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/database';

// Review attributes interface
export interface ReviewAttributes {
  id: number;
  created_at: Date;
  title: string | null;
  excludedContentTypes: string | null;
  objectType: string | null;
  regulatoryFramework: string | null;
  selectedPrefillIds: string | null;
}

// Optional fields for creation (id and created_at are auto-generated)
export interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'created_at'> {}

// Review model class
export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public created_at!: Date;
  public title!: string | null;
  public excludedContentTypes!: string | null;
  public objectType!: string | null;
  public regulatoryFramework!: string | null;
  public selectedPrefillIds!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Review model
Review.init(
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    excludedContentTypes: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'excluded_content_types',
    },
    objectType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'object_type',
    },
    regulatoryFramework: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'regulatory_framework',
    },
    selectedPrefillIds: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'selected_prefill_ids',
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: false, // We manage timestamps manually to match Oracle schema
  }
);
