import { TIMEZONES } from '../../utils/timezones'
import styles from './TimezoneSelector.module.css'

export default function TimezoneSelector({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="tz-select" className={styles.label}>Timezone</label>
      <select
        id="tz-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.value + tz.label} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  )
}
