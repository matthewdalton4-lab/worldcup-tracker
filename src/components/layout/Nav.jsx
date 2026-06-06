import { NavLink } from 'react-router-dom'
import styles from './Nav.module.css'

const links = [
  { to: '/',           label: 'Home' },
  { to: '/fixtures',   label: 'Fixtures' },
  { to: '/groups',     label: 'Groups' },
  { to: '/teams',      label: 'Teams' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
