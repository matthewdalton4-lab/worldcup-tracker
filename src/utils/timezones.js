/**
 * Timezone list for the fixture timezone selector.
 * Grouped into US/Canada/Mexico host cities first, then global.
 */
export const TIMEZONES = [
  // ── Host nation zones ──────────────────────────────────────
  { label: 'New York / Boston  (ET)',    value: 'America/New_York' },
  { label: 'Dallas / Houston   (CT)',    value: 'America/Chicago' },
  { label: 'Denver / Kansas City (MT)',  value: 'America/Denver' },
  { label: 'Los Angeles / San Jose (PT)', value: 'America/Los_Angeles' },
  { label: 'Seattle            (PT)',    value: 'America/Los_Angeles' },
  { label: 'Kansas City        (CT)',    value: 'America/Chicago' },
  { label: 'Miami              (ET)',    value: 'America/New_York' },
  { label: 'Atlanta            (ET)',    value: 'America/New_York' },
  { label: 'Philadelphia       (ET)',    value: 'America/New_York' },
  { label: 'Toronto / Montreal (ET)',    value: 'America/Toronto' },
  { label: 'Vancouver          (PT)',    value: 'America/Vancouver' },
  { label: 'Mexico City        (CST)',   value: 'America/Mexico_City' },
  { label: 'Guadalajara        (CST)',   value: 'America/Mexico_City' },
  // ── UTC reference ──────────────────────────────────────────
  { label: 'UTC',                        value: 'UTC' },
  // ── Europe ────────────────────────────────────────────────
  { label: 'London             (BST/GMT)', value: 'Europe/London' },
  { label: 'Paris / Berlin     (CET)',   value: 'Europe/Paris' },
  { label: 'Madrid / Rome      (CET)',   value: 'Europe/Madrid' },
  { label: 'Amsterdam          (CET)',   value: 'Europe/Amsterdam' },
  { label: 'Lisbon             (WET)',   value: 'Europe/Lisbon' },
  { label: 'Athens / Istanbul  (EET)',   value: 'Europe/Athens' },
  { label: 'Moscow             (MSK)',   value: 'Europe/Moscow' },
  // ── Americas ──────────────────────────────────────────────
  { label: 'São Paulo          (BRT)',   value: 'America/Sao_Paulo' },
  { label: 'Buenos Aires       (ART)',   value: 'America/Argentina/Buenos_Aires' },
  { label: 'Bogotá             (COT)',   value: 'America/Bogota' },
  // ── Africa & Middle East ───────────────────────────────────
  { label: 'Cairo              (EET)',   value: 'Africa/Cairo' },
  { label: 'Dubai / Riyadh     (GST)',   value: 'Asia/Dubai' },
  // ── Asia-Pacific ──────────────────────────────────────────
  { label: 'Mumbai             (IST)',   value: 'Asia/Kolkata' },
  { label: 'Bangkok / Jakarta  (ICT)',   value: 'Asia/Bangkok' },
  { label: 'Singapore / KL    (SGT)',    value: 'Asia/Singapore' },
  { label: 'Beijing / Shanghai (CST)',   value: 'Asia/Shanghai' },
  { label: 'Tokyo / Seoul      (JST)',   value: 'Asia/Tokyo' },
  { label: 'Sydney             (AEST)',  value: 'Australia/Sydney' },
]

export const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

/**
 * Format a UTC date string into a locale-friendly time in the given IANA timezone.
 * @param {string} utcDate  - ISO 8601 date string from API
 * @param {string} timezone - IANA timezone string
 * @returns {{ date: string, time: string, full: string }}
 */
export function formatInTimezone(utcDate, timezone) {
  const d = new Date(utcDate)
  const dateFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const timeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return {
    date: dateFmt.format(d),
    time: timeFmt.format(d),
    full: `${dateFmt.format(d)}, ${timeFmt.format(d)}`,
  }
}

/**
 * Returns a stable YYYY-MM-DD sort key for a UTC date in a given timezone.
 * Used to bucket fixtures into day groups.
 */
export function getDateKey(utcDate, timezone) {
  const d = new Date(utcDate)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${p.year}-${p.month}-${p.day}`
}

/**
 * Long-form date heading for a date group, e.g. "Wednesday, 11 June 2026"
 */
export function formatDateHeading(dateKey, timezone) {
  // dateKey is YYYY-MM-DD — parse as noon UTC to avoid DST edge cases
  const [y, m, day] = dateKey.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0))
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Group an array of API-Football fixture objects by local calendar date.
 * Returns an array of { dateKey, heading, fixtures } sorted chronologically.
 */
export function groupFixturesByDate(fixtures, timezone) {
  const map = new Map()

  for (const fixture of fixtures) {
    const key = getDateKey(fixture.fixture.date, timezone)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(fixture)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, list]) => ({
      dateKey,
      heading: formatDateHeading(dateKey, timezone),
      fixtures: list.sort(
        (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
      ),
    }))
}
