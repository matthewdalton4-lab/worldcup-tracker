import styles from './PlayerCard.module.css'

const POSITION_ABBR = {
  Goalkeeper: 'GK',
  Defender:   'DEF',
  Midfielder: 'MID',
  Attacker:   'FWD',
}

export default function PlayerCard({ player }) {
  const posAbbr = POSITION_ABBR[player.position] ?? player.position

  return (
    <div className={styles.card}>
      <img
        src={player.photo}
        alt={player.name}
        className={styles.photo}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />

      <div className={styles.info}>
        <div className={styles.top}>
          <span className={styles.number}>
            {player.number != null ? `#${player.number}` : '–'}
          </span>
          <span className={styles.pos}>{posAbbr}</span>
        </div>

        <span className={styles.name}>{player.name}</span>

        <div className={styles.meta}>
          {player.age != null && (
            <span className={styles.metaItem}>{player.age} yrs</span>
          )}
          {player.club && (
            <>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaItem} title={player.club}>
                {player.club}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
