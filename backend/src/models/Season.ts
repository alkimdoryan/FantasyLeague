import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface SeasonAttributes {
  id: number
  season: string
  league_id: number
}

interface SeasonCreationAttributes extends Optional<SeasonAttributes, 'id'> {}

class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  public id!: number
  public season!: string
  public league_id!: number
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
  },
  {
    sequelize,
    modelName: 'Season',
    tableName: 'seasons',
    timestamps: false,
  }
)

export default Season 