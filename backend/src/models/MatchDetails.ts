import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface MatchDetailsAttributes {
  id: number
  match_id: string
  raw_json: string
  home_team_name?: string
  away_team_name?: string
  home_team_colors?: string
  away_team_colors?: string
  venue_name?: string
  start_timestamp?: number
  created_at?: Date
  updated_at?: Date
}

interface MatchDetailsCreationAttributes extends Optional<MatchDetailsAttributes, 'id' | 'created_at' | 'updated_at'> {}

class MatchDetails extends Model<MatchDetailsAttributes, MatchDetailsCreationAttributes> implements MatchDetailsAttributes {
  public id!: number
  public match_id!: string
  public raw_json!: string
  public home_team_name?: string
  public away_team_name?: string
  public home_team_colors?: string
  public away_team_colors?: string
  public venue_name?: string
  public start_timestamp?: number
  public readonly created_at?: Date
  public readonly updated_at?: Date
}

MatchDetails.init(
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
    raw_json: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    home_team_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_team_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_team_colors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    away_team_colors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    venue_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_timestamp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'MatchDetails',
    tableName: 'match_details',
  }
)

export default MatchDetails 