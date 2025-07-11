import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface SeasonAttributes {
  id: number
  season: string
  league_id: number
  start_date?: Date
  end_date?: Date
  is_active?: boolean
  created_at?: Date
  updated_at?: Date
}

interface SeasonCreationAttributes extends Optional<SeasonAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  public id!: number
  public season!: string
  public league_id!: number
  public start_date?: Date
  public end_date?: Date
  public is_active?: boolean
  public readonly created_at?: Date
  public readonly updated_at?: Date
}

Season.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    season: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    league_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'leagues',
        key: 'id',
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Season',
    tableName: 'seasons',
  }
)

export default Season 