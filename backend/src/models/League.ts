import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface LeagueAttributes {
  id: number
  name: string
  country?: string
  logo_url?: string
  created_at?: Date
  updated_at?: Date
}

interface LeagueCreationAttributes extends Optional<LeagueAttributes, 'id' | 'created_at' | 'updated_at'> {}

class League extends Model<LeagueAttributes, LeagueCreationAttributes> implements LeagueAttributes {
  public id!: number
  public name!: string
  public country?: string
  public logo_url?: string
  public readonly created_at?: Date
  public readonly updated_at?: Date
}

League.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'League',
    tableName: 'leagues',
  }
)

export default League 