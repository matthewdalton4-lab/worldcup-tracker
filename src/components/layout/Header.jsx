import { Link } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.wordmark}>
            <span className={styles.wc}>World Cup</span>
            <span className={styles.year}>2026</span>
          </span>
        </Link>
        <p className={styles.tagline}>USA &middot; Canada &middot; Mexico</p>
      </div>
    </header>
  )
}
