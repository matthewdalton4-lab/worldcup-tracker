import styles from './GroupTable.module.css'

// mobile: false = hidden on screens ≤ 480px
const COLS = [
  { key: 'P',   label: 'P',   mobile: false, getValue: (e) => e.all.played       },
  { key: 'W',   label: 'W',   mobile: true,  getValue: (e) => e.all.win          },
  { key: 'D',   label: 'D',   mobile: true,  getValue: (e) => e.all.draw         },
  { key: 'L',   label: 'L',   mobile: true,  getValue: (e) => e.all.lose         },
  { key: 'GF',  label: 'GF',  mobile: false, getValue: (e) => e.all.goals.for    },
  { key: 'GA',  label: 'GA',  mobile: false, getValue: (e) => e.all.goals.against},
  { key: 'GD',  label: 'GD',  mobile: false, getValue: (e) => e.goalsDiff        },
  { key: 'Pts', label: 'Pts', mobile: true,  getValue: (e) => e.points,  pts: true },
]

export default function GroupTable({ group }) {
  if (!group?.length) return null

  const groupName = group[0]?.group ?? 'Group'

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{groupName}</h3>
      {/* scroll wrapper handles overflow on narrow screens */}
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.rank}`}>#</th>
              <th className={styles.teamCol}>Team</th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={`${styles.stat} ${col.mobile ? '' : styles.hideMobile}`}
                >
                  {col.label}
                </th>
              ))}
              <th className={`${styles.form} ${styles.hideMobile}`}>Form</th>
            </tr>
          </thead>
          <tbody>
            {group.map((entry, i) => (
              <tr key={entry.team.id} className={i < 2 ? styles.qualified : ''}>
                <td className={styles.rank}>{entry.rank}</td>
                <td className={styles.teamCol}>
                  <img
                    src={entry.team.logo}
                    alt={entry.team.name}
                    className={styles.logo}
                    onError={(e) => { e.currentTarget.style.opacity = '0' }}
                  />
                  <span>{entry.team.name}</span>
                </td>
                {COLS.map((col) => (
                  <td
                    key={col.key}
                    className={`${styles.stat} ${col.pts ? styles.pts : ''} ${col.mobile ? '' : styles.hideMobile}`}
                  >
                    {col.getValue(entry)}
                  </td>
                ))}
                <td className={`${styles.form} ${styles.hideMobile}`}>
                  <FormBubbles form={entry.form} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FormBubbles({ form }) {
  if (!form) return null
  return (
    <div className={styles.bubbles}>
      {form.split('').slice(-5).map((r, i) => (
        <span
          key={i}
          className={`${styles.bubble} ${
            r === 'W' ? styles.win : r === 'D' ? styles.draw : styles.loss
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  )
}
