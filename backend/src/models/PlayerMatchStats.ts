import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

interface PlayerMatchStatsAttributes {
  id: number
  match_id: string
  player_id?: number
  name: string
  short_name?: string
  team_name: string
  team_id?: number
  position: string
  jersey_number?: number
  country?: string
  rating?: number
  minutes_played?: number
  goals?: number
  goal_assist?: number
  expected_goals?: number
  expected_assists?: number
  shots_total?: number
  shots_on_target?: number
  shots_off_target?: number
  key_pass?: number
  total_pass?: number
  accurate_pass?: number
  total_long_balls?: number
  accurate_long_balls?: number
  total_cross?: number
  accurate_cross?: number
  total_tackle?: number
  duel_won?: number
  duel_lost?: number
  aerial_won?: number
  aerial_lost?: number
  interception_won?: number
  total_clearance?: number
  outfielder_block?: number
  fouls?: number
  was_fouled?: number
  saves?: number
  goals_conceded?: number
  penalty_save?: number
  good_high_claim?: number
  punches?: number
  created_at?: Date
  updated_at?: Date
}

interface PlayerMatchStatsCreationAttributes extends Optional<PlayerMatchStatsAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PlayerMatchStats extends Model<PlayerMatchStatsAttributes, PlayerMatchStatsCreationAttributes> implements PlayerMatchStatsAttributes {
  public id!: number
  public match_id!: string
  public player_id?: number
  public name!: string
  public short_name?: string
  public team_name!: string
  public team_id?: number
  public position!: string
  public jersey_number?: number
  public country?: string
  public rating?: number
  public minutes_played?: number
  public goals?: number
  public goal_assist?: number
  public expected_goals?: number
  public expected_assists?: number
  public shots_total?: number
  public shots_on_target?: number
  public shots_off_target?: number
  public key_pass?: number
  public total_pass?: number
  public accurate_pass?: number
  public total_long_balls?: number
  public accurate_long_balls?: number
  public total_cross?: number
  public accurate_cross?: number
  public total_tackle?: number
  public duel_won?: number
  public duel_lost?: number
  public aerial_won?: number
  public aerial_lost?: number
  public interception_won?: number
  public total_clearance?: number
  public outfielder_block?: number
  public fouls?: number
  public was_fouled?: number
  public saves?: number
  public goals_conceded?: number
  public penalty_save?: number
  public good_high_claim?: number
  public punches?: number
  public readonly created_at?: Date
  public readonly updated_at?: Date
}

PlayerMatchStats.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jersey_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    minutes_played: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goals: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    goal_assist: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    expected_goals: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    expected_assists: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    shots_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    shots_on_target: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    shots_off_target: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    key_pass: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_pass: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    accurate_pass: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_long_balls: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    accurate_long_balls: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_cross: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    accurate_cross: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_tackle: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    duel_won: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    duel_lost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    aerial_won: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    aerial_lost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    interception_won: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_clearance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    outfielder_block: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    fouls: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    was_fouled: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    saves: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    goals_conceded: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    penalty_save: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    good_high_claim: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    punches: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'PlayerMatchStats',
    tableName: 'player_match_stats',
    indexes: [
      {
        fields: ['match_id'],
      },
      {
        fields: ['name'],
      },
      {
        fields: ['team_name'],
      },
      {
        fields: ['position'],
      },
    ],
  }
)

export default PlayerMatchStats 