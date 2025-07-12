import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface MatchAttributes {
  id: number
  season_id: number
  season: string
  match_id: string
}

interface MatchCreationAttributes extends Optional<MatchAttributes, 'id'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: number
  public season_id!: number
  public season!: string
  public match_id!: string
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'seasons',
        key: 'id',
      },
    },
    season: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    match_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
    timestamps: false,
  }
)

export default Match 