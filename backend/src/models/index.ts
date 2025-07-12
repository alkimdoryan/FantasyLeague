import League from './League'
import Season from './Season'
import Match from './Match'
import MatchDetails from './MatchDetails'
import PlayerMatchStats from './PlayerMatchStats'

// Model associations
League.hasMany(Season, { foreignKey: 'league_id', as: 'seasons' })
Season.belongsTo(League, { foreignKey: 'league_id', as: 'league' })

Season.hasMany(Match, { foreignKey: 'season_id', as: 'matches' })
Match.belongsTo(Season, { foreignKey: 'season_id', as: 'seasonData' })

Match.hasOne(MatchDetails, { foreignKey: 'match_id', sourceKey: 'match_id', as: 'details' })
MatchDetails.belongsTo(Match, { foreignKey: 'match_id', targetKey: 'match_id', as: 'match' })

Match.hasMany(PlayerMatchStats, { foreignKey: 'match_id', sourceKey: 'match_id', as: 'playerStats' })
PlayerMatchStats.belongsTo(Match, { foreignKey: 'match_id', targetKey: 'match_id', as: 'match' })

export {
  League,
  Season,
  Match,
  MatchDetails,
  PlayerMatchStats,
}

export default {
  League,
  Season,
  Match,
  MatchDetails,
  PlayerMatchStats,
} 