import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const CARDS = [
  { to: '/fixtures',    label: 'Fixtures',    desc: 'Live scores & upcoming matches' },
  { to: '/groups',      label: 'Groups',      desc: 'All 12 group standings' },
  { to: '/teams',       label: 'Teams',       desc: 'All 48 national squads' },
  { to: '/leaderboard', label: 'Leaderboard', desc: 'Goals & assists leaders' },
]

// Photo on Unsplash — unsplash.com/photos/1629977010057-6c5086645098
// Ball hitting the back of the net, net in foreground, crowd + players through netting, daylight
const HERO_IMG =
  'https://images.unsplash.com/photo-1629977010057-6c5086645098?w=1920&fm=jpg&q=85&auto=format'

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
          <p className={styles.eyebrow}>FIFA World Cup</p>
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
