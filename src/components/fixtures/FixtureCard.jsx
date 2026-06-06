import { formatInTimezone } from '../../utils/timezones'
import styles from './FixtureCard.module.css'

// API-Football status.short values
const LIVE_STATUSES     = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])

function statusLabel(status) {
  switch (status.short) {
    case '1H':   return `${status.elapsed}'`
    case 'HT':   return 'HT'
    case '2H':   return `${status.elapsed}'`
    case 'ET':   return `ET ${status.elapsed}'`
    case 'BT':   return 'Break'
    case 'P':    return 'Pen'
    case 'SUSP': return 'Susp'
    case 'INT':  return 'Int'
    case 'LIVE': return 'Live'
    case 'FT':   return 'FT'
    case 'AET':  return 'AET'
    case 'PEN':  return 'Pen'
    case 'PST':  return 'PST'
    case 'CANC': return 'CANC'
    case 'ABD':  return 'ABD'
    case 'AWD':  return 'AWD'
    default:     return status.short
  }
}

export default function FixtureCard({ fixture, timezone }) {
  const { fixture: meta, teams, goals, league, score } = fixture
  const short      = meta.status.short
  const isLive     = LIVE_STATUSES.has(short)
  const isFinished = FINISHED_STATUSES.has(short)
  const isUpcoming = !isLive && !isFinished
  const isCancelled = short === 'PST' || short === 'CANC' || short === 'ABD'

  const { time } = formatInTimezone(meta.date, timezone)

  // Penalty shootout score (only shown for PEN finished matches)
  const penHome = score?.penalty?.home
  const penAway = score?.penalty?.away
  const showPens = short === 'PEN' && penHome != null

  return (
    <div className={`${styles.card} ${isLive ? styles.live : ''} ${isCancelled ? styles.cancelled : ''}`}>
      <div className={styles.meta}>
        <span className={styles.round}>{league.round}</span>

        {isLive && (
          <span className={styles.liveChip}>
            <span className={styles.liveDot} />
            {statusLabel(meta.status)}
          </span>
        )}
        {isFinished && (
          <span className={styles.statusChip}>{statusLabel(meta.status)}</span>
        )}
        {isUpcoming && (
          <span className={styles.kickoff}>{time}</span>
        )}
      </div>

      <div className={styles.matchup}>
        <TeamSide team={teams.home} winner={isFinished && goals.home > goals.away} />

        <div className={styles.centre}>
          {isUpcoming && !isCancelled && (
            <span className={styles.vs}>vs</span>
          )}
          {isCancelled && (
            <span className={styles.cancelledLabel}>{statusLabel(meta.status)}</span>
          )}
          {!isUpcoming && !isCancelled && (
            <>
              <span className={styles.score}>
                {goals.home ?? 0} <span className={styles.scoreSep}>–</span> {goals.away ?? 0}
              </span>
              {showPens && (
                <span className={styles.pens}>({penHome} – {penAway} pens)</span>
              )}
            </>
          )}
        </div>

        <TeamSide team={teams.away} winner={isFinished && goals.away > goals.home} right />
      </div>

      {meta.venue?.name && (
        <p className={styles.venue}>{meta.venue.name}{meta.venue.city ? `, ${meta.venue.city}` : ''}</p>
      )}
    </div>
  )
}

function TeamSide({ team, winner, right }) {
  return (
    <div className={`${styles.team} ${right ? styles.teamRight : styles.teamLeft}`}>
      <img
        src={team.logo}
        alt={team.name}
        className={styles.logo}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      <span className={`${styles.teamName} ${winner ? styles.winner : ''}`}>
        {team.name}
      </span>
    </div>
  )
}
