import { League, Season, Match, MatchDetails, PlayerMatchStats } from '../models'

export const seedDemoData = async () => {
  try {
    // Create demo league
    const [league] = await League.findOrCreate({
      where: { name: 'Premier League' },
      defaults: {
        name: 'Premier League',
        country: 'England',
        logo_url: 'https://logos.pl/images/premier-league-logo.png',
      },
    })

    // Create demo season
    const [season] = await Season.findOrCreate({
      where: { season: '2023-24', league_id: league.id },
      defaults: {
        season: '2023-24',
        league_id: league.id,
        is_active: true,
      },
    })

    // Create demo match
    const [match] = await Match.findOrCreate({
      where: { match_id: 'demo_match_1' },
      defaults: {
        match_id: 'demo_match_1',
        season_id: season.id,
        home_team_id: 1,
        away_team_id: 2,
        home_score: 2,
        away_score: 1,
        status: 'finished',
      },
    })

    // Create demo match details
    await MatchDetails.findOrCreate({
      where: { match_id: 'demo_match_1' },
      defaults: {
        match_id: 'demo_match_1',
        raw_json: JSON.stringify({
          homeTeam: { name: 'Arsenal', id: 1 },
          awayTeam: { name: 'Chelsea', id: 2 },
          homeScore: { normaltime: 2 },
          awayScore: { normaltime: 1 },
          startTimestamp: Date.now(),
        }),
        home_team_name: 'Arsenal',
        away_team_name: 'Chelsea',
        start_timestamp: Date.now(),
      },
    })

    // Create demo player stats
    const demoPlayers = [
      {
        match_id: 'demo_match_1',
        name: 'Bukayo Saka',
        team_name: 'Arsenal',
        position: 'F',
        rating: 8.5,
        minutes_played: 90,
        goals: 1,
        goal_assist: 1,
      },
      {
        match_id: 'demo_match_1',
        name: 'Martin Ødegaard',
        team_name: 'Arsenal',
        position: 'M',
        rating: 8.2,
        minutes_played: 90,
        goals: 1,
        goal_assist: 0,
      },
      {
        match_id: 'demo_match_1',
        name: 'Raheem Sterling',
        team_name: 'Chelsea',
        position: 'F',
        rating: 7.1,
        minutes_played: 90,
        goals: 1,
        goal_assist: 0,
      },
    ]

    for (const player of demoPlayers) {
      await PlayerMatchStats.findOrCreate({
        where: { 
          match_id: player.match_id,
          name: player.name,
        },
        defaults: player,
      })
    }

    console.log('✅ Demo data seeded successfully')
    return true
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    return false
  }
} 