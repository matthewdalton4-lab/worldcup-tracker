import { Link } from 'react-router-dom'
import styles from './TeamCard.module.css'

export default function TeamCard({ team, group }) {
  return (
    <Link to={`/teams/${team.id}`} className={styles.card}>
      <img
        src={team.logo}
        alt={team.name}
        className={styles.logo}
        onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
      />
      <div className={styles.info}>
        <span className={styles.name}>{team.name}</span>
        {group && <span className={styles.group}>Group {group}</span>}
      </div>
    </Link>
  )
}
