import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AppHeader } from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import styles from './Home.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const TRASH_COLORS: Record<string, string> = {
  organic: '#16a34a',
  mixed: '#ca8a04',
  recyclable: '#2563eb',
  glass: '#0891b2',
}

const LOCALE_MAP: Record<string, string> = { en: 'en-GB', pt: 'pt-PT', es: 'es-ES' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayStr(): string {
  const d = new Date()
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate())
}

// Monday-first offset: Sunday=0 in JS → index 6 in our grid
function monthStartOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay()
  return (jsDay + 6) % 7
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function formatCountdown(dateStr: string, t: TFunction): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return t('home.today')
  if (diff === 1) return t('home.tomorrow')
  return t('home.inDays', { count: diff })
}

function formatDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat(LOCALE_MAP[lang] ?? 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardDay {
  date: string
  trashTypes: string[]
}

// ── CalendarCard ──────────────────────────────────────────────────────────────

function CalendarCard({ dayMap }: { dayMap: Map<string, string[]> }) {
  const { t, i18n } = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const today = todayStr()
  const offset = monthStartOffset(year, month)
  const totalDays = daysInMonth(year, month)
  const cells = useMemo(() => {
    const arr: Array<number | null> = Array(offset).fill(null)
    for (let d = 1; d <= totalDays; d++) arr.push(d)
    return arr
  }, [year, month, offset, totalDays])

  const monthTypes = useMemo(() => {
    const types = new Set<string>()
    for (let d = 1; d <= totalDays; d++) {
      const key = toDateStr(year, month, d)
      dayMap.get(key)?.forEach(tp => types.add(tp))
    }
    return [...types]
  }, [dayMap, year, month, totalDays])

  const weekdays = t('home.weekdays', { returnObjects: true }) as string[]
  const monthLabel = new Intl.DateTimeFormat(LOCALE_MAP[i18n.language] ?? 'en-GB', { month: 'long' })
    .format(new Date(year, month, 1))

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {year}
        </p>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={prev} aria-label={t('home.prevMonth')}>‹</button>
          <button className={styles.navBtn} onClick={next} aria-label={t('home.nextMonth')}>›</button>
        </div>
      </div>

      <div className={styles.calBody}>
        <div className={styles.weekdayRow}>
          {weekdays.map(d => (
            <div key={d} className={styles.weekdayLabel}>{d}</div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className={`${styles.dayCell} ${styles.empty}`} />
            const key = toDateStr(year, month, day)
            const types = dayMap.get(key) ?? []
            const isToday = key === today
            return (
              <div key={key} className={`${styles.dayCell} ${isToday ? styles.today : ''}`}>
                <div className={styles.dots}>
                  {types.map(tp => (
                    <span key={tp} className={styles.dotWrapper} data-tooltip={t(`trash.${tp}`)}>
                      <span
                        className={styles.dot}
                        style={{ background: TRASH_COLORS[tp] ?? '#888' }}
                      />
                    </span>
                  ))}
                </div>
                <div className={styles.dayNumber}>{day}</div>
              </div>
            )
          })}
        </div>
      </div>

      {monthTypes.length > 0 && (
        <div className={styles.legend}>
          {monthTypes.map(tp => (
            <div key={tp} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: TRASH_COLORS[tp] ?? '#888' }} />
              {t(`trash.${tp}`)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── NextCollectionCard ────────────────────────────────────────────────────────

function NextCollectionCard({ days }: { days: DashboardDay[] }) {
  const { t, i18n } = useTranslation()
  const today = todayStr()
  const next = days.find(d => d.date >= today)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>{t('home.nextCollection')}</p>
      </div>
      <div className={styles.nextBody}>
        {!next ? (
          <p className={styles.nextEmpty}>{t('home.noneScheduled')}</p>
        ) : (
          <>
            <div>
              <p className={styles.nextDate}>{formatDate(next.date, i18n.language)}</p>
              <p className={styles.nextCountdown}>{formatCountdown(next.date, t)}</p>
            </div>
            <div className={styles.nextTypes}>
              {next.trashTypes.map(tp => (
                <div key={tp} className={styles.nextTypeRow}>
                  <span className={styles.nextTypeDot} style={{ background: TRASH_COLORS[tp] ?? '#888' }} />
                  <span className={styles.nextTypeLabel}>{t(`trash.${tp}`)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────

export function Home() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [days, setDays] = useState<DashboardDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.getDashboard(token, 90)
      .then(res => setDays(res.days))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const dayMap = useMemo(() => {
    const m = new Map<string, string[]>()
    days.forEach(d => m.set(d.date, d.trashTypes))
    return m
  }, [days])

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.content}>
        {loading ? (
          <div className={styles.grid}>
            <div className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonBody}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={styles.skeletonLine} style={{ width: `${65 + (i % 3) * 15}%` }} />
                ))}
              </div>
            </div>
            <div className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonBody}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.skeletonLine} style={{ width: `${50 + i * 20}%` }} />
                ))}
              </div>
            </div>
          </div>
        ) : days.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗑️</div>
            <p className={styles.emptyTitle}>{t('home.emptyTitle')}</p>
            <p className={styles.emptyText}>{t('home.emptyText')}</p>
            <Link to="/settings" className={styles.emptyBtn}>{t('home.emptyBtn')}</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            <CalendarCard dayMap={dayMap} />
            <NextCollectionCard days={days} />
          </div>
        )}
      </main>
    </div>
  )
}
