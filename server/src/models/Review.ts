import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeInstance } from '../database/database';

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
export interface ReviewCreationAttributes extends Optional<
  ReviewAttributes,
  'id' | 'created_at'
> {}

// Review model class
export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
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
export const initReview = (sequelizeInstance: Sequelize) => {
  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      sequelize: sequelizeInstance,
      tableName: 'reviews',
      timestamps: false,
      indexes: [
        {
          fields: ['created_at'],
          name: 'idx_reviews_created_at',
        },
      ],
    },
  );
};
