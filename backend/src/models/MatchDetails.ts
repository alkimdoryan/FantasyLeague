import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface MatchDetailsAttributes {
  match_id: number
  raw_json: string
}

interface MatchDetailsCreationAttributes extends Optional<MatchDetailsAttributes, 'match_id'> {}

class MatchDetails extends Model<MatchDetailsAttributes, MatchDetailsCreationAttributes> implements MatchDetailsAttributes {
  public match_id!: number
  public raw_json!: string
}

MatchDetails.init(
  {
    match_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    raw_json: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MatchDetails',
    tableName: 'match_details',
    timestamps: false,
  }
)

export default MatchDetails 