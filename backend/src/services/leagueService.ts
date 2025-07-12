import { QueryTypes } from 'sequelize'
import sequelize from '../config/database'
import { League, Season, Match, MatchDetails, PlayerMatchStats } from '../models'

export class LeagueService {
  // 1. LİG GENEL GÖRÜNÜM (League Overview)
  
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
        -- Ev sahibi takım sonuçları
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
        -- Deplasman takımı sonuçları
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
        ts.team_name as "Team",
        ts.played as "Played",
        ts.win as "Won",
        ts.draw as "Drawn", 
        ts.loss as "Lost",
        ts.goals_for as "Goals For",
        ts.goals_against as "Goals Against",
        (ts.goals_for - ts.goals_against) as "Goal Difference",
        (ts.win * 3 + ts.draw) as "Points",
        l5.last_5_form as "Form"
      FROM team_stats ts
      LEFT JOIN last_5_matches l5 ON ts.team_name = l5.team_name
      ORDER BY 
        "Points" DESC,
        "Goal Difference" DESC,
        "Goals For" DESC;
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

  // Oyuncu istatistikleri (Tüm pozisyonlar)
  static async getPlayerStats(seasonId: number, limit: number = 50) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC
      LIMIT :limit;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, limit },
      type: QueryTypes.SELECT,
    })
  }

  // Takım puan gelişimi
  static async getTeamPointsProgress(seasonId: number) {
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
        -- Home team results
        SELECT 
          home_team as team_name,
          home_score as gf,
          away_score as ga,
          CASE 
            WHEN home_score > away_score THEN 3
            WHEN home_score = away_score THEN 1
            ELSE 0
          END as points,
          match_timestamp
        FROM match_results
        UNION ALL
        -- Away team results
        SELECT 
          away_team as team_name,
          away_score as gf,
          home_score as ga,
          CASE 
            WHEN away_score > home_score THEN 3
            WHEN away_score = home_score THEN 1
            ELSE 0
          END as points,
          match_timestamp
        FROM match_results
      ),
      cumulative_points AS (
        SELECT 
          team_name,
          match_timestamp,
          SUM(points) OVER (
            PARTITION BY team_name 
            ORDER BY match_timestamp 
            ROWS UNBOUNDED PRECEDING
          ) as cumulative_points
        FROM team_matches
      )
      SELECT 
        team_name as team,
        match_timestamp,
        cumulative_points as points
      FROM cumulative_points
      ORDER BY match_timestamp, team_name;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // 2. MAÇ DETAYLARI (Match Details)
  
  // Maç detayları temel bilgileri
  static async getMatchDetails(seasonId: number, homeTeam: string, awayTeam: string) {
    const query = `
      SELECT 
        m.match_id,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
        CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        md.raw_json as match_data
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      WHERE m.season_id = :seasonId
        AND json_extract(md.raw_json, '$.homeTeam.name') = :homeTeam
        AND json_extract(md.raw_json, '$.awayTeam.name') = :awayTeam;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, homeTeam, awayTeam },
      type: QueryTypes.SELECT,
    })
  }

  // 3. OYUNCU DETAYLARI (Player Details)
  
  // Oyuncu detayları
  static async getPlayerDetails(seasonId: number, playerName: string) {
    const query = `
      WITH player_matches AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name = :playerName
      )
      SELECT 
        name as player_name,
        teamName as team,
        position,
        json_extract(country, '$.name') as country,
        COUNT(*) as matches_played,
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as avg_rating,
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as total_goals,
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as total_assists,
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as total_minutes,
        ROUND(AVG(CAST(COALESCE(minutesPlayed, 0) AS FLOAT)), 1) as avg_minutes,
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as shots_on_target,
        SUM(CAST(COALESCE(shotOffTarget, 0) AS INTEGER)) as shots_off_target,
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as pass_accuracy,
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as key_passes,
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as tackles,
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as interceptions,
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as saves
      FROM player_matches
      GROUP BY name, teamName, position, json_extract(country, '$.name')
      LIMIT 1;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, playerName },
      type: QueryTypes.SELECT,
    })
  }

  // Tüm oyuncular (Player Dashboard için)
  static async getAllPlayers(seasonId: number) {
    try {
      const query = `
        SELECT 
          pms.name,
          pms.teamName as team_name,
          pms.position,
          json_extract(pms.country, '$.name') as country,
          99 as jerseyNumber,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          COUNT(*) as matches_played,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) as total_saves,
          SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) as total_passes,
          SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) as accurate_passes,
          CASE 
            WHEN SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) > 0 
            THEN ROUND((SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) * 100.0 / SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER))), 2)
            ELSE 0 
          END as pass_accuracy,
          SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) as key_passes,
          SUM(CAST(COALESCE(pms.onTargetScoringAttempt, 0) AS INTEGER)) as shots_on_target,
          SUM(CAST(COALESCE(pms.shotOffTarget, 0) AS INTEGER)) as shots_off_target,
          SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) as tackles,
          SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) as interceptions,
          SUM(CAST(COALESCE(pms.duelWon, 0) AS INTEGER)) as duels_won,
          SUM(CAST(COALESCE(pms.duelLost, 0) AS INTEGER)) as duels_lost,
          SUM(CAST(COALESCE(pms.fouls, 0) AS INTEGER)) as fouls_committed,
          SUM(CAST(COALESCE(pms.wasFouled, 0) AS INTEGER)) as fouls_won,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as performance_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
          AND CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER) > 0
        GROUP BY pms.name, pms.teamName, pms.position, json_extract(pms.country, '$.name')
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 90
        ORDER BY performance_score DESC
        LIMIT 100;
      `
      
      return await sequelize.query(query, {
        replacements: { seasonId },
        type: QueryTypes.SELECT,
      })
    } catch (error) {
      console.error('Error in getAllPlayers:', error)
      throw error
    }
  }

  // 4. RÜYA TAKIMI (Dream Team)
  
  // Dream Team (Rüya Takımı)
  static async getDreamTeam(seasonId: number) {
    const query = `
      WITH player_performance AS (
        SELECT 
          pms.name,
          pms.teamName,
          pms.position,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          -- Position-based scoring
          CASE 
            WHEN pms.position = 'G' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.6 + 
                    SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) * 0.4, 2)
            WHEN pms.position = 'D' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.5 + 
                    SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) * 0.2, 2)
            WHEN pms.position = 'M' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.3, 2)
            WHEN pms.position = 'F' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) * 0.4 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.2, 2)
            ELSE AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT))
          END as position_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
        GROUP BY pms.name, pms.teamName, pms.position
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 300
      ),
      ranked_players AS (
        SELECT 
          name,
          teamName,
          position,
          avg_rating,
          total_goals,
          total_assists,
          position_score,
          ROW_NUMBER() OVER (PARTITION BY position ORDER BY position_score DESC) as position_rank
        FROM player_performance
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        position_score as "Score"
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
        position_score DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // 5. MAÇ TAKIMLARI (Match Teams)
  
  // Maç takımları
  static async getMatchTeams(matchId: string) {
    const query = `
      SELECT 
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
        CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp
      FROM match_details md
      WHERE md.match_id = :matchId;
    `
    
    return await sequelize.query(query, {
      replacements: { matchId },
      type: QueryTypes.SELECT,
    })
  }

  // Pozisyon bazlı oyuncular
  static async getPlayersByPosition(seasonId: number, position: string, limit: number = 20) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.position = :position
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC
      LIMIT :limit;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, position, limit },
      type: QueryTypes.SELECT,
    })
  }

  // Takım bazlı oyuncular
  static async getPlayersByTeam(seasonId: number, teamName: string) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.teamName = :teamName
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    })
  }

  // Yeni oyuncu maçları metodu
  static async getPlayerMatches(seasonId: number, playerName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        pms.teamName,
        pms.position,
        pms.jerseyNumber,
        pms.minutesPlayed,
        pms.rating,
        pms.goals,
        pms.goalAssist,
        pms.saves,
        0 as yellowCard,
        0 as redCard
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      JOIN player_match_stats pms ON m.match_id = pms.match_id
      WHERE m.season_id = :seasonId AND pms.name = :playerName
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, playerName },
      type: QueryTypes.SELECT,
    })
    return results
  }

  // Yeni takım detayları metodu
  static async getTeamDetails(seasonId: number, teamName: string) {
    const query = `
      WITH match_results AS (
        SELECT 
          m.id as match_id,
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
          json_extract(md.raw_json, '$.homeTeam.manager.name') as home_manager,
          json_extract(md.raw_json, '$.awayTeam.manager.name') as away_manager,
          json_extract(md.raw_json, '$.venue.name') as venue_name
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
      ),
      team_stats AS (
        SELECT 
          CASE 
            WHEN home_team = :teamName THEN home_team
            WHEN away_team = :teamName THEN away_team
            ELSE NULL
          END as team_name,
          COUNT(*) as total_matches,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score > away_score THEN 1
            WHEN away_team = :teamName AND away_score > home_score THEN 1
            ELSE 0
          END) as wins,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score = away_score THEN 1
            WHEN away_team = :teamName AND away_score = home_score THEN 1
            ELSE 0
          END) as draws,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score < away_score THEN 1
            WHEN away_team = :teamName AND away_score < home_score THEN 1
            ELSE 0
          END) as losses,
          SUM(CASE 
            WHEN home_team = :teamName THEN home_score
            WHEN away_team = :teamName THEN away_score
            ELSE 0
          END) as goals_for,
          SUM(CASE 
            WHEN home_team = :teamName THEN away_score
            WHEN away_team = :teamName THEN home_score
            ELSE 0
          END) as goals_against
        FROM match_results
        WHERE home_team = :teamName OR away_team = :teamName
      )
      SELECT 
        team_name,
        total_matches,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        (goals_for - goals_against) as goal_difference,
        (wins * 3 + draws) as points,
        ROUND((wins * 100.0 / total_matches), 2) as win_percentage
      FROM team_stats
      WHERE team_name IS NOT NULL
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    }) as any[]
    return results.length > 0 ? results[0] : null
  }

  // Yeni takım maçları metodu
  static async getTeamMatches(seasonId: number, teamName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        json_extract(md.raw_json, '$.status') as match_status,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName THEN 'home'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName THEN 'away'
          ELSE NULL
        END as team_venue,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'W'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) THEN 'W'
          WHEN CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) = 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'D'
          ELSE 'L'
        END as result
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      WHERE m.season_id = :seasonId 
        AND (json_extract(md.raw_json, '$.homeTeam.name') = :teamName OR json_extract(md.raw_json, '$.awayTeam.name') = :teamName)
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { teamName, seasonId },
      type: QueryTypes.SELECT,
    }) as any[]
    return results
  }
}

export default LeagueService 
        SELECT 
          pms.name,
          pms.teamName as team_name,
          pms.position,
          json_extract(pms.country, '$.name') as country,
          99 as jerseyNumber,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          COUNT(*) as matches_played,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) as total_saves,
          SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) as total_passes,
          SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) as accurate_passes,
          CASE 
            WHEN SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) > 0 
            THEN ROUND((SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) * 100.0 / SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER))), 2)
            ELSE 0 
          END as pass_accuracy,
          SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) as key_passes,
          SUM(CAST(COALESCE(pms.onTargetScoringAttempt, 0) AS INTEGER)) as shots_on_target,
          SUM(CAST(COALESCE(pms.shotOffTarget, 0) AS INTEGER)) as shots_off_target,
          SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) as tackles,
          SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) as interceptions,
          SUM(CAST(COALESCE(pms.duelWon, 0) AS INTEGER)) as duels_won,
          SUM(CAST(COALESCE(pms.duelLost, 0) AS INTEGER)) as duels_lost,
          SUM(CAST(COALESCE(pms.fouls, 0) AS INTEGER)) as fouls_committed,
          SUM(CAST(COALESCE(pms.wasFouled, 0) AS INTEGER)) as fouls_won,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as performance_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
          AND CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER) > 0
        GROUP BY pms.name, pms.teamName, pms.position, json_extract(pms.country, '$.name')
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 90
        ORDER BY performance_score DESC
        LIMIT 100;
      `
      
      return await sequelize.query(query, {
        replacements: { seasonId },
        type: QueryTypes.SELECT,
      })
    } catch (error) {
      console.error('Error in getAllPlayers:', error)
      throw error
    }
  }

  // 4. RÜYA TAKIMI (Dream Team)
  
  // Dream Team (Rüya Takımı)
  static async getDreamTeam(seasonId: number) {
    const query = `
      WITH player_performance AS (
        SELECT 
          pms.name,
          pms.teamName,
          pms.position,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          -- Position-based scoring
          CASE 
            WHEN pms.position = 'G' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.6 + 
                    SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) * 0.4, 2)
            WHEN pms.position = 'D' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.5 + 
                    SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) * 0.2, 2)
            WHEN pms.position = 'M' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.3, 2)
            WHEN pms.position = 'F' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) * 0.4 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.2, 2)
            ELSE AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT))
          END as position_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
        GROUP BY pms.name, pms.teamName, pms.position
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 300
      ),
      ranked_players AS (
        SELECT 
          name,
          teamName,
          position,
          avg_rating,
          total_goals,
          total_assists,
          position_score,
          ROW_NUMBER() OVER (PARTITION BY position ORDER BY position_score DESC) as position_rank
        FROM player_performance
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        position_score as "Score"
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
        position_score DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // 5. MAÇ TAKIMLARI (Match Teams)
  
  // Maç takımları
  static async getMatchTeams(matchId: string) {
    const query = `
      SELECT 
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
        CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp
      FROM match_details md
      WHERE md.match_id = :matchId;
    `
    
    return await sequelize.query(query, {
      replacements: { matchId },
      type: QueryTypes.SELECT,
    })
  }

  // Pozisyon bazlı oyuncular
  static async getPlayersByPosition(seasonId: number, position: string, limit: number = 20) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.position = :position
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC
      LIMIT :limit;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, position, limit },
      type: QueryTypes.SELECT,
    })
  }

  // Takım bazlı oyuncular
  static async getPlayersByTeam(seasonId: number, teamName: string) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.teamName = :teamName
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    })
  }

  // Yeni oyuncu maçları metodu
  static async getPlayerMatches(seasonId: number, playerName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        pms.teamName,
        pms.position,
        pms.jerseyNumber,
        pms.minutesPlayed,
        pms.rating,
        pms.goals,
        pms.goalAssist,
        pms.saves,
        0 as yellowCard,
        0 as redCard
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      JOIN player_match_stats pms ON m.match_id = pms.match_id
      WHERE m.season_id = :seasonId AND pms.name = :playerName
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, playerName },
      type: QueryTypes.SELECT,
    })
    return results
  }

  // Yeni takım detayları metodu
  static async getTeamDetails(seasonId: number, teamName: string) {
    const query = `
      WITH match_results AS (
        SELECT 
          m.id as match_id,
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
          json_extract(md.raw_json, '$.homeTeam.manager.name') as home_manager,
          json_extract(md.raw_json, '$.awayTeam.manager.name') as away_manager,
          json_extract(md.raw_json, '$.venue.name') as venue_name
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
      ),
      team_stats AS (
        SELECT 
          CASE 
            WHEN home_team = :teamName THEN home_team
            WHEN away_team = :teamName THEN away_team
            ELSE NULL
          END as team_name,
          COUNT(*) as total_matches,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score > away_score THEN 1
            WHEN away_team = :teamName AND away_score > home_score THEN 1
            ELSE 0
          END) as wins,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score = away_score THEN 1
            WHEN away_team = :teamName AND away_score = home_score THEN 1
            ELSE 0
          END) as draws,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score < away_score THEN 1
            WHEN away_team = :teamName AND away_score < home_score THEN 1
            ELSE 0
          END) as losses,
          SUM(CASE 
            WHEN home_team = :teamName THEN home_score
            WHEN away_team = :teamName THEN away_score
            ELSE 0
          END) as goals_for,
          SUM(CASE 
            WHEN home_team = :teamName THEN away_score
            WHEN away_team = :teamName THEN home_score
            ELSE 0
          END) as goals_against
        FROM match_results
        WHERE home_team = :teamName OR away_team = :teamName
      )
      SELECT 
        team_name,
        total_matches,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        (goals_for - goals_against) as goal_difference,
        (wins * 3 + draws) as points,
        ROUND((wins * 100.0 / total_matches), 2) as win_percentage
      FROM team_stats
      WHERE team_name IS NOT NULL
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    }) as any[]
    return results.length > 0 ? results[0] : null
  }

  // Yeni takım maçları metodu
  static async getTeamMatches(seasonId: number, teamName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        json_extract(md.raw_json, '$.status') as match_status,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName THEN 'home'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName THEN 'away'
          ELSE NULL
        END as team_venue,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'W'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) THEN 'W'
          WHEN CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) = 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'D'
          ELSE 'L'
        END as result
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      WHERE m.season_id = :seasonId 
        AND (json_extract(md.raw_json, '$.homeTeam.name') = :teamName OR json_extract(md.raw_json, '$.awayTeam.name') = :teamName)
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { teamName, seasonId },
      type: QueryTypes.SELECT,
    }) as any[]
    return results
  }
}

export default LeagueService 
        SELECT 
          pms.name,
          pms.teamName as team_name,
          pms.position,
          json_extract(pms.country, '$.name') as country,
          99 as jerseyNumber,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          COUNT(*) as matches_played,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) as total_saves,
          SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) as total_passes,
          SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) as accurate_passes,
          CASE 
            WHEN SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) > 0 
            THEN ROUND((SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) * 100.0 / SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER))), 2)
            ELSE 0 
          END as pass_accuracy,
          SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) as key_passes,
          SUM(CAST(COALESCE(pms.onTargetScoringAttempt, 0) AS INTEGER)) as shots_on_target,
          SUM(CAST(COALESCE(pms.shotOffTarget, 0) AS INTEGER)) as shots_off_target,
          SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) as tackles,
          SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) as interceptions,
          SUM(CAST(COALESCE(pms.duelWon, 0) AS INTEGER)) as duels_won,
          SUM(CAST(COALESCE(pms.duelLost, 0) AS INTEGER)) as duels_lost,
          SUM(CAST(COALESCE(pms.fouls, 0) AS INTEGER)) as fouls_committed,
          SUM(CAST(COALESCE(pms.wasFouled, 0) AS INTEGER)) as fouls_won,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as performance_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
          AND CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER) > 0
        GROUP BY pms.name, pms.teamName, pms.position, json_extract(pms.country, '$.name')
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 90
        ORDER BY performance_score DESC
        LIMIT 100;
      `
      
      return await sequelize.query(query, {
        replacements: { seasonId },
        type: QueryTypes.SELECT,
      })
    } catch (error) {
      console.error('Error in getAllPlayers:', error)
      throw error
    }
  }

  // 4. RÜYA TAKIMI (Dream Team)
  
  // Dream Team (Rüya Takımı)
  static async getDreamTeam(seasonId: number) {
    const query = `
      WITH player_performance AS (
        SELECT 
          pms.name,
          pms.teamName,
          pms.position,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          -- Position-based scoring
          CASE 
            WHEN pms.position = 'G' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.6 + 
                    SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) * 0.4, 2)
            WHEN pms.position = 'D' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.5 + 
                    SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) * 0.2, 2)
            WHEN pms.position = 'M' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.3, 2)
            WHEN pms.position = 'F' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) * 0.4 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.2, 2)
            ELSE AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT))
          END as position_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
        GROUP BY pms.name, pms.teamName, pms.position
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 300
      ),
      ranked_players AS (
        SELECT 
          name,
          teamName,
          position,
          avg_rating,
          total_goals,
          total_assists,
          position_score,
          ROW_NUMBER() OVER (PARTITION BY position ORDER BY position_score DESC) as position_rank
        FROM player_performance
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        position_score as "Score"
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
        position_score DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // 5. MAÇ TAKIMLARI (Match Teams)
  
  // Maç takımları
  static async getMatchTeams(matchId: string) {
    const query = `
      SELECT 
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
        CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp
      FROM match_details md
      WHERE md.match_id = :matchId;
    `
    
    return await sequelize.query(query, {
      replacements: { matchId },
      type: QueryTypes.SELECT,
    })
  }

  // Pozisyon bazlı oyuncular
  static async getPlayersByPosition(seasonId: number, position: string, limit: number = 20) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.position = :position
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC
      LIMIT :limit;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, position, limit },
      type: QueryTypes.SELECT,
    })
  }

  // Takım bazlı oyuncular
  static async getPlayersByTeam(seasonId: number, teamName: string) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.teamName = :teamName
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    })
  }

  // Yeni oyuncu maçları metodu
  static async getPlayerMatches(seasonId: number, playerName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        pms.teamName,
        pms.position,
        pms.jerseyNumber,
        pms.minutesPlayed,
        pms.rating,
        pms.goals,
        pms.goalAssist,
        pms.saves,
        0 as yellowCard,
        0 as redCard
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      JOIN player_match_stats pms ON m.match_id = pms.match_id
      WHERE m.season_id = :seasonId AND pms.name = :playerName
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, playerName },
      type: QueryTypes.SELECT,
    })
    return results
  }

  // Yeni takım detayları metodu
  static async getTeamDetails(seasonId: number, teamName: string) {
    const query = `
      WITH match_results AS (
        SELECT 
          m.id as match_id,
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
          json_extract(md.raw_json, '$.homeTeam.manager.name') as home_manager,
          json_extract(md.raw_json, '$.awayTeam.manager.name') as away_manager,
          json_extract(md.raw_json, '$.venue.name') as venue_name
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
      ),
      team_stats AS (
        SELECT 
          CASE 
            WHEN home_team = :teamName THEN home_team
            WHEN away_team = :teamName THEN away_team
            ELSE NULL
          END as team_name,
          COUNT(*) as total_matches,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score > away_score THEN 1
            WHEN away_team = :teamName AND away_score > home_score THEN 1
            ELSE 0
          END) as wins,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score = away_score THEN 1
            WHEN away_team = :teamName AND away_score = home_score THEN 1
            ELSE 0
          END) as draws,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score < away_score THEN 1
            WHEN away_team = :teamName AND away_score < home_score THEN 1
            ELSE 0
          END) as losses,
          SUM(CASE 
            WHEN home_team = :teamName THEN home_score
            WHEN away_team = :teamName THEN away_score
            ELSE 0
          END) as goals_for,
          SUM(CASE 
            WHEN home_team = :teamName THEN away_score
            WHEN away_team = :teamName THEN home_score
            ELSE 0
          END) as goals_against
        FROM match_results
        WHERE home_team = :teamName OR away_team = :teamName
      )
      SELECT 
        team_name,
        total_matches,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        (goals_for - goals_against) as goal_difference,
        (wins * 3 + draws) as points,
        ROUND((wins * 100.0 / total_matches), 2) as win_percentage
      FROM team_stats
      WHERE team_name IS NOT NULL
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    }) as any[]
    return results.length > 0 ? results[0] : null
  }

  // Yeni takım maçları metodu
  static async getTeamMatches(seasonId: number, teamName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        json_extract(md.raw_json, '$.status') as match_status,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName THEN 'home'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName THEN 'away'
          ELSE NULL
        END as team_venue,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'W'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) THEN 'W'
          WHEN CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) = 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'D'
          ELSE 'L'
        END as result
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      WHERE m.season_id = :seasonId 
        AND (json_extract(md.raw_json, '$.homeTeam.name') = :teamName OR json_extract(md.raw_json, '$.awayTeam.name') = :teamName)
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { teamName, seasonId },
      type: QueryTypes.SELECT,
    }) as any[]
    return results
  }
}

export default LeagueService 
        SELECT 
          pms.name,
          pms.teamName as team_name,
          pms.position,
          json_extract(pms.country, '$.name') as country,
          99 as jerseyNumber,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          COUNT(*) as matches_played,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) as total_saves,
          SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) as total_passes,
          SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) as accurate_passes,
          CASE 
            WHEN SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER)) > 0 
            THEN ROUND((SUM(CAST(COALESCE(pms.accuratePass, 0) AS INTEGER)) * 100.0 / SUM(CAST(COALESCE(pms.totalPass, 0) AS INTEGER))), 2)
            ELSE 0 
          END as pass_accuracy,
          SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) as key_passes,
          SUM(CAST(COALESCE(pms.onTargetScoringAttempt, 0) AS INTEGER)) as shots_on_target,
          SUM(CAST(COALESCE(pms.shotOffTarget, 0) AS INTEGER)) as shots_off_target,
          SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) as tackles,
          SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) as interceptions,
          SUM(CAST(COALESCE(pms.duelWon, 0) AS INTEGER)) as duels_won,
          SUM(CAST(COALESCE(pms.duelLost, 0) AS INTEGER)) as duels_lost,
          SUM(CAST(COALESCE(pms.fouls, 0) AS INTEGER)) as fouls_committed,
          SUM(CAST(COALESCE(pms.wasFouled, 0) AS INTEGER)) as fouls_won,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as performance_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
          AND CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER) > 0
        GROUP BY pms.name, pms.teamName, pms.position, json_extract(pms.country, '$.name')
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 90
        ORDER BY performance_score DESC
        LIMIT 100;
      `
      
      return await sequelize.query(query, {
        replacements: { seasonId },
        type: QueryTypes.SELECT,
      })
    } catch (error) {
      console.error('Error in getAllPlayers:', error)
      throw error
    }
  }

  // 4. RÜYA TAKIMI (Dream Team)
  
  // Dream Team (Rüya Takımı)
  static async getDreamTeam(seasonId: number) {
    const query = `
      WITH player_performance AS (
        SELECT 
          pms.name,
          pms.teamName,
          pms.position,
          ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)), 2) as avg_rating,
          SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) as total_goals,
          SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) as total_assists,
          SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) as total_minutes,
          -- Position-based scoring
          CASE 
            WHEN pms.position = 'G' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.6 + 
                    SUM(CAST(COALESCE(pms.saves, 0) AS INTEGER)) * 0.4, 2)
            WHEN pms.position = 'D' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.5 + 
                    SUM(CAST(COALESCE(pms.totalTackle, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.interceptionWon, 0) AS INTEGER)) * 0.2, 2)
            WHEN pms.position = 'M' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.keyPass, 0) AS INTEGER)) * 0.3 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.3, 2)
            WHEN pms.position = 'F' THEN 
              ROUND(AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT)) * 0.4 + 
                    SUM(CAST(COALESCE(pms.goals, 0) AS INTEGER)) * 0.4 +
                    SUM(CAST(COALESCE(pms.goalAssist, 0) AS INTEGER)) * 0.2, 2)
            ELSE AVG(CAST(COALESCE(pms.rating, 0) AS FLOAT))
          END as position_score
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.name IS NOT NULL 
          AND pms.teamName IS NOT NULL 
          AND pms.position IS NOT NULL
        GROUP BY pms.name, pms.teamName, pms.position
        HAVING SUM(CAST(COALESCE(pms.minutesPlayed, 0) AS INTEGER)) >= 300
      ),
      ranked_players AS (
        SELECT 
          name,
          teamName,
          position,
          avg_rating,
          total_goals,
          total_assists,
          position_score,
          ROW_NUMBER() OVER (PARTITION BY position ORDER BY position_score DESC) as position_rank
        FROM player_performance
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        position_score as "Score"
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
        position_score DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId },
      type: QueryTypes.SELECT,
    })
  }

  // 5. MAÇ TAKIMLARI (Match Teams)
  
  // Maç takımları
  static async getMatchTeams(matchId: string) {
    const query = `
      SELECT 
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
        CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp
      FROM match_details md
      WHERE md.match_id = :matchId;
    `
    
    return await sequelize.query(query, {
      replacements: { matchId },
      type: QueryTypes.SELECT,
    })
  }

  // Pozisyon bazlı oyuncular
  static async getPlayersByPosition(seasonId: number, position: string, limit: number = 20) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.position = :position
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC
      LIMIT :limit;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, position, limit },
      type: QueryTypes.SELECT,
    })
  }

  // Takım bazlı oyuncular
  static async getPlayersByTeam(seasonId: number, teamName: string) {
    const query = `
      WITH match_players AS (
        SELECT 
          m.id as match_id,
          m.match_id as match_code,
          pms.*
        FROM matches m
        JOIN player_match_stats pms ON m.match_id = pms.match_id
        WHERE m.season_id = :seasonId
          AND pms.teamName = :teamName
      )
      SELECT 
        name as "Player",
        teamName as "Team",
        position as "Position",
        json_extract(country, '$.name') as "Country",
        ROUND(AVG(CAST(COALESCE(rating, 0) AS FLOAT)), 2) as "Average Rating",
        SUM(CAST(COALESCE(goals, 0) AS INTEGER)) as "Goals",
        SUM(CAST(COALESCE(goalAssist, 0) AS INTEGER)) as "Assists",
        SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) as "Minutes Played",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) + COALESCE(shotOffTarget, 0) + COALESCE(blockedScoringAttempt, 0) AS INTEGER)) as "Total Shots",
        SUM(CAST(COALESCE(onTargetScoringAttempt, 0) AS INTEGER)) as "Shots on Target",
        ROUND(AVG(CASE 
          WHEN COALESCE(totalPass, 0) > 0 
          THEN CAST(COALESCE(accuratePass, 0) AS FLOAT) / CAST(totalPass AS FLOAT) * 100 
          ELSE 0 
        END), 2) as "Pass Accuracy",
        SUM(CAST(COALESCE(keyPass, 0) AS INTEGER)) as "Key Passes",
        SUM(CAST(COALESCE(duelWon, 0) + COALESCE(duelLost, 0) AS INTEGER)) as "Total Duels",
        SUM(CAST(COALESCE(duelWon, 0) AS INTEGER)) as "Duels Won",
        SUM(CAST(COALESCE(totalTackle, 0) AS INTEGER)) as "Tackles",
        SUM(CAST(COALESCE(outfielderBlock, 0) AS INTEGER)) as "Blocks",
        SUM(CAST(COALESCE(interceptionWon, 0) AS INTEGER)) as "Interceptions",
        SUM(CAST(COALESCE(wasFouled, 0) AS INTEGER)) as "Fouls Won",
        SUM(CAST(COALESCE(fouls, 0) AS INTEGER)) as "Fouls Committed",
        0 as "Yellow Cards",
        0 as "Red Cards",
        SUM(CAST(COALESCE(saves, 0) AS INTEGER)) as "Goalkeeper Saves",
        0 as "Goals Conceded"
      FROM match_players
      WHERE name IS NOT NULL AND teamName IS NOT NULL AND position IS NOT NULL
      GROUP BY 
        name,
        teamName,
        position,
        json_extract(country, '$.name')
      HAVING SUM(CAST(COALESCE(minutesPlayed, 0) AS INTEGER)) >= 90
      ORDER BY "Average Rating" DESC;
    `
    
    return await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    })
  }

  // Yeni oyuncu maçları metodu
  static async getPlayerMatches(seasonId: number, playerName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        pms.teamName,
        pms.position,
        pms.jerseyNumber,
        pms.minutesPlayed,
        pms.rating,
        pms.goals,
        pms.goalAssist,
        pms.saves,
        0 as yellowCard,
        0 as redCard
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      JOIN player_match_stats pms ON m.match_id = pms.match_id
      WHERE m.season_id = :seasonId AND pms.name = :playerName
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, playerName },
      type: QueryTypes.SELECT,
    })
    return results
  }

  // Yeni takım detayları metodu
  static async getTeamDetails(seasonId: number, teamName: string) {
    const query = `
      WITH match_results AS (
        SELECT 
          m.id as match_id,
          json_extract(md.raw_json, '$.homeTeam.name') as home_team,
          json_extract(md.raw_json, '$.awayTeam.name') as away_team,
          CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) as home_score,
          CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) as away_score,
          json_extract(md.raw_json, '$.homeTeam.manager.name') as home_manager,
          json_extract(md.raw_json, '$.awayTeam.manager.name') as away_manager,
          json_extract(md.raw_json, '$.venue.name') as venue_name
        FROM matches m
        JOIN match_details md ON m.match_id = md.match_id
        WHERE m.season_id = :seasonId
      ),
      team_stats AS (
        SELECT 
          CASE 
            WHEN home_team = :teamName THEN home_team
            WHEN away_team = :teamName THEN away_team
            ELSE NULL
          END as team_name,
          COUNT(*) as total_matches,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score > away_score THEN 1
            WHEN away_team = :teamName AND away_score > home_score THEN 1
            ELSE 0
          END) as wins,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score = away_score THEN 1
            WHEN away_team = :teamName AND away_score = home_score THEN 1
            ELSE 0
          END) as draws,
          SUM(CASE 
            WHEN home_team = :teamName AND home_score < away_score THEN 1
            WHEN away_team = :teamName AND away_score < home_score THEN 1
            ELSE 0
          END) as losses,
          SUM(CASE 
            WHEN home_team = :teamName THEN home_score
            WHEN away_team = :teamName THEN away_score
            ELSE 0
          END) as goals_for,
          SUM(CASE 
            WHEN home_team = :teamName THEN away_score
            WHEN away_team = :teamName THEN home_score
            ELSE 0
          END) as goals_against
        FROM match_results
        WHERE home_team = :teamName OR away_team = :teamName
      )
      SELECT 
        team_name,
        total_matches,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        (goals_for - goals_against) as goal_difference,
        (wins * 3 + draws) as points,
        ROUND((wins * 100.0 / total_matches), 2) as win_percentage
      FROM team_stats
      WHERE team_name IS NOT NULL
    `
    
    const results = await sequelize.query(query, {
      replacements: { seasonId, teamName },
      type: QueryTypes.SELECT,
    }) as any[]
    return results.length > 0 ? results[0] : null
  }

  // Yeni takım maçları metodu
  static async getTeamMatches(seasonId: number, teamName: string) {
    const query = `
      SELECT 
        m.id as match_id,
        m.match_id as match_code,
        json_extract(md.raw_json, '$.homeTeam.name') as home_team,
        json_extract(md.raw_json, '$.awayTeam.name') as away_team,
        json_extract(md.raw_json, '$.homeScore.normaltime') as home_score,
        json_extract(md.raw_json, '$.awayScore.normaltime') as away_score,
        json_extract(md.raw_json, '$.startTimestamp') as match_timestamp,
        json_extract(md.raw_json, '$.venue.name') as venue,
        json_extract(md.raw_json, '$.status') as match_status,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName THEN 'home'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName THEN 'away'
          ELSE NULL
        END as team_venue,
        CASE 
          WHEN json_extract(md.raw_json, '$.homeTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'W'
          WHEN json_extract(md.raw_json, '$.awayTeam.name') = :teamName AND 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) > 
               CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) THEN 'W'
          WHEN CAST(json_extract(md.raw_json, '$.homeScore.normaltime') AS INTEGER) = 
               CAST(json_extract(md.raw_json, '$.awayScore.normaltime') AS INTEGER) THEN 'D'
          ELSE 'L'
        END as result
      FROM matches m
      JOIN match_details md ON m.match_id = md.match_id
      WHERE m.season_id = :seasonId 
        AND (json_extract(md.raw_json, '$.homeTeam.name') = :teamName OR json_extract(md.raw_json, '$.awayTeam.name') = :teamName)
      ORDER BY match_timestamp DESC
    `
    
    const results = await sequelize.query(query, {
      replacements: { teamName, seasonId },
      type: QueryTypes.SELECT,
    }) as any[]
    return results
  }
}

export default LeagueService 