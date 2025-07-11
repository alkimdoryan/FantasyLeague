import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface MatchAttributes {
  id: number
  match_id: string
  season_id: number
  home_team_id?: number
  away_team_id?: number
  home_score?: number
  away_score?: number
  match_date?: Date
  status?: string
  created_at?: Date
  updated_at?: Date
}

interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: number
  public match_id!: string
  public season_id!: number
  public home_team_id?: number
  public away_team_id?: number
  public home_score?: number
  public away_score?: number
  public match_date?: Date
  public status?: string
  public readonly created_at?: Date
  public readonly updated_at?: Date
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'seasons',
        key: 'id',
      },
    },
    home_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    away_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    home_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    away_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    match_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'scheduled',
    },
  },
  {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
  }
)

export default Match 