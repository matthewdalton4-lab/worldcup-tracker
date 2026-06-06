import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const CARDS = [
  { to: '/fixtures',    label: 'Fixtures',    desc: 'Live scores & upcoming matches' },
  { to: '/groups',      label: 'Groups',      desc: 'All 12 group standings' },
  { to: '/teams',       label: 'Teams',       desc: 'All 48 national squads' },
  { to: '/leaderboard', label: 'Leaderboard', desc: 'Goals & assists leaders' },
]

const HERO_IMG = '/crowd.png'

export default function Home() {
  return (
    <>
      {/* ── Full-bleed hero ── */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <img src="/worldcuplogo.png" alt="FIFA World Cup 2026" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>2026</h1>
          <p className={styles.heroSub}>USA &middot; Canada &middot; Mexico &mdash; 11 June – 19 July</p>
        </div>
        <div className={styles.heroFade} />
      </section>

      {/* ── Nav cards ── */}
      <div className="container">
        <div className={styles.grid}>
          {CARDS.map(({ to, label, desc }) => (
            <Link key={to} to={to} className={styles.card}>
              <span className={styles.cardLabel}>{label}</span>
              <span className={styles.cardDesc}>{desc}</span>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
