import { QueryTypes } from 'sequelize'
import sequelize from '../config/database'
import { League, Season, Match, MatchDetails, PlayerMatchStats } from '../models'

export class LeagueService {
  // Lig listesi
  static async getAllLeagues() {
    return await League.findAll({
      order: [['name', 'ASC']],
    })
  }

  // Sezonlar listesi
  static async getSeasonsByLeague(leagueId: number) {
    const query = `
      SELECT 
        s.id, 
        s.season, 
        l.name as league_name,
        (SELECT COUNT(*) FROM matches m WHERE m.season_id = s.id) as match_count
      FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      WHERE l.id = :leagueId
      ORDER BY s.season DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { leagueId },
      type: QueryTypes.SELECT,
    })
  }

  // Takım puan durumu tablosu
  static async getLeagueStandings(seasonId: number) {
    const query = `
      WITH match_results AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
          CAST(json_extract(md.raw_json, '$.startTimestamp') AS INTEGER) as match_timestamp
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
        ORDER BY match_timestamp ASC
      ),
      team_matches AS (
        SELECT 
          home_team as team_name,
          home_score as gf,
          away_score as ga,
          CASE 
            WHEN home_score > away_score THEN '🟢'
            WHEN home_score = away_score THEN '⚪'
            ELSE '🔴'
          END as result,
          match_timestamp
        FROM match_results
        UNION ALL
        SELECT 
          away_team as team_name,
          away_score as gf,
          home_score as ga,
          CASE 
            WHEN away_score > home_score THEN '🟢'
            WHEN away_score = home_score THEN '⚪'
            ELSE '🔴'
          END as result,
          match_timestamp
        FROM match_results
      ),
      last_5_matches AS (
        SELECT 
          team_name,
          GROUP_CONCAT(result, '') as last_5_form
        FROM (
          SELECT 
            team_name, 
            result,
            ROW_NUMBER() OVER (PARTITION BY team_name ORDER BY match_timestamp DESC) as rn
          FROM team_matches
          ORDER BY match_timestamp DESC
        ) ranked
        WHERE rn <= 5
        GROUP BY team_name
      ),
      team_stats AS (
        SELECT 
          team_name,
          COUNT(*) as played,
          SUM(CASE WHEN gf > ga THEN 1 ELSE 0 END) as win,
          SUM(CASE WHEN gf = ga THEN 1 ELSE 0 END) as draw,
          SUM(CASE WHEN gf < ga THEN 1 ELSE 0 END) as loss,
          SUM(gf) as goals_for,
          SUM(ga) as goals_against
        FROM team_matches
        GROUP BY team_name
      )
      SELECT 
        ts.team_name as team,
        ts.played as played,
        ts.win as win,
        ts.draw as draw,
        ts.loss as loss,
        ts.goals_for as goals_for,
        ts.goals_against as goals_against,
        (ts.goals_for - ts.goals_against) as goal_difference,
        (ts.win * 3 + ts.draw) as points,
        l5.last_5_form as form
      FROM team_stats ts
      LEFT JOIN last_5_matches l5 ON ts.team_name = l5.team_name
      ORDER BY 
        points DESC,
        goal_difference DESC,
        goals_for DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // Sezon istatistikleri
  static async getSeasonStats(seasonId: number) {
    const query = `
      WITH match_stats AS (
        SELECT 
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
      )
      SELECT 
        COUNT(*) as total_matches,
        SUM(home_score + away_score) as total_goals,
        ROUND(AVG(home_score + away_score), 2) as avg_goals_per_match,
        SUM(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) as home_wins,
        SUM(CASE WHEN away_score > home_score THEN 1 ELSE 0 END) as away_wins,
        SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) as draws
      FROM match_stats;
    `
    
    const [result] = await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    }) as any[]
    
    return result
  }

  // Oyuncu istatistikleri tablosu (Tüm pozisyonlar)
  static async getPlayerStats(seasonId: number, position?: string, limit = 50) {
    let positionFilter = ''
    const replacements: any = { seasonId, minMinutes: 90 }
    
    if (position) {
      positionFilter = 'AND pms.position = :position'
      replacements.position = position
    }

    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
        ${positionFilter}
      )
      SELECT 
        name as player,
        team_name as team,
        position,
        country,
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as avg_rating,
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as goals,
        SUM(CAST(COALESCE(goal_assist, 0) AS INTEGER)) as assists,
        SUM(CAST(COALESCE(minutes_played, 0) AS INTEGER)) as minutes_played,
        SUM(CAST(COALESCE(shots_on_target, 0) + COALESCE(shots_off_target, 0) AS INTEGER)) as total_shots,
        SUM(CAST(COALESCE(shots_on_target, 0) AS INTEGER)) as shots_on_target,
        ROUND(AVG(CASE 
          WHEN COALESCE(total_pass, 0) > 0 
          THEN CAST(COALESCE(accurate_pass, 0) AS FLOAT) / CAST(total_pass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as pass_accuracy,
        SUM(CAST(COALESCE(key_pass, 0) AS INTEGER)) as key_passes,
        SUM(CAST(COALESCE(duel_won, 0) + COALESCE(duel_lost, 0) AS INTEGER)) as total_duels,
        SUM(CAST(COALESCE(duel_won, 0) AS INTEGER)) as duels_won,
        SUM(CAST(COALESCE(total_tackle, 0) AS INTEGER)) as tackles,
        SUM(CAST(COALESCE(outfielder_block, 0) AS INTEGER)) as blocks,
        SUM(CAST(COALESCE(interception_won, 0) AS INTEGER)) as interceptions,
        SUM(CAST(COALESCE(was_fouled, 0) AS INTEGER)) as fouls_won,
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as fouls_committed,
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as saves,
        SUM(CAST(COALESCE(goals_conceded, 0) AS INTEGER)) as goals_conceded
      FROM match_players
      WHERE name IS NOT NULL AND team_name IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        team_name,
        position,
        country
      HAVING SUM(CAST(COALESCE(minutes_played, 0) AS INTEGER)) >= :minMinutes
      ORDER BY avg_rating DESC
      LIMIT ${limit};
    `
    
    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    })
  }

  // Dream Team (Rüya Takımı)
  static async getDreamTeam(seasonId: number) {
    const query = `
      WITH match_stats AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
      ),
      player_scores AS (
        SELECT 
          name,
          short_name,
          team_name,
          position,
          COUNT(DISTINCT match_id) as matches_played,
          SUM(CASE 
            WHEN position = 'G' THEN (
              COALESCE(saves, 0) * 4 +
              COALESCE(penalty_save, 0) * 6 +
              COALESCE(good_high_claim, 0) * 2 +
              COALESCE(punches, 0) * 1.5 +
              CASE 
                WHEN COALESCE(total_pass, 0) > 0 THEN CAST(accurate_pass AS FLOAT) / CAST(total_pass AS FLOAT)
                ELSE 0 
              END
            )
            WHEN position = 'D' THEN (
              COALESCE(total_tackle, 0) * 2 +
              COALESCE(interception_won, 0) * 2 +
              COALESCE(total_clearance, 0) * 1.5 +
              COALESCE(duel_won, 0) * 1 +
              COALESCE(aerial_won, 0) * 1 -
              COALESCE(fouls, 0) * 1 +
              COALESCE(goals, 0) * 4 +
              COALESCE(goal_assist, 0) * 3 +
              CASE 
                WHEN COALESCE(total_pass, 0) > 0 THEN (CAST(accurate_pass AS FLOAT) / CAST(total_pass AS FLOAT)) * 2
                ELSE 0 
              END
            )
            WHEN position = 'M' THEN (
              COALESCE(goal_assist, 0) * 4 +
              COALESCE(key_pass, 0) * 2 +
              CASE 
                WHEN COALESCE(total_pass, 0) > 0 THEN (CAST(accurate_pass AS FLOAT) / CAST(total_pass AS FLOAT)) * 3
                ELSE 0 
              END +
              COALESCE(interception_won, 0) * 1.5 +
              COALESCE(total_tackle, 0) * 1 +
              COALESCE(goals, 0) * 3
            )
            WHEN position = 'F' THEN (
              COALESCE(goals, 0) * 5 +
              COALESCE(shots_on_target, 0) * 2 +
              COALESCE(goal_assist, 0) * 2.5 +
              COALESCE(key_pass, 0) * 1.5 -
              COALESCE(shots_off_target, 0) * 1 +
              CASE 
                WHEN COALESCE(total_pass, 0) > 0 THEN CAST(accurate_pass AS FLOAT) / CAST(total_pass AS FLOAT)
                ELSE 0 
              END
            )
            ELSE 0
          END) as total_score
        FROM match_stats
        GROUP BY name, short_name, team_name, position
        HAVING matches_played >= 3
      ),
      ranked_players AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (PARTITION BY position ORDER BY total_score DESC) as position_rank
        FROM player_scores
      )
      SELECT 
        name as player,
        team_name as team,
        position,
        ROUND(total_score, 2) as score
      FROM ranked_players
      WHERE 
        (position = 'G' AND position_rank <= 1) OR
        (position = 'D' AND position_rank <= 4) OR
        (position = 'M' AND position_rank <= 4) OR
        (position = 'F' AND position_rank <= 2)
      ORDER BY 
        CASE position
          WHEN 'G' THEN 1
          WHEN 'D' THEN 2
          WHEN 'M' THEN 3
          WHEN 'F' THEN 4
        END,
        total_score DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }
}

export default LeagueService 